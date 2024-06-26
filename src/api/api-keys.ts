import { randomBytes } from 'crypto'
import { ZodError, z } from 'zod'
import { authenticate } from '../middleware/authenticate'
import { bodyparser } from '../middleware/body-parser'
import type { RouteRegistrar } from '../types'

const routesApiKeys: RouteRegistrar = router => {
    router.get(
        '/api-key',

        authenticate(true),

        async (ctx) => {
            ctx.body = await ctx.db.apiKey.findMany()
        }
    )

    router.post(
        '/api-key',

        authenticate(true),

        async (ctx) => {
            const key = randomBytes(32).toString('hex')

            const result = await ctx.db.apiKey.create({
                data: { key }
            })

            ctx.status = 201
            ctx.body = {
                ...result,
                key,
            }
        }
    )

    router.delete(
        '/api-key',

        authenticate(true),
        bodyparser,

        async (ctx, next) => {
            const schema = z.strictObject({
                id: z.coerce.number().positive(),
            })

            try {
                await schema.parseAsync(ctx.request.body)
            } catch (error) {
                ctx.status = 400
                if (error instanceof ZodError) {
                    ctx.body = error.issues
                } else {
                    ctx.body = error
                }
                return
            }

            return next()
        },

        async (ctx) => {
            const { id } = ctx.request.body!

            const result = await ctx.db.apiKey.findUnique({
                where: { id },
                select: { id: true },
            })

            if (result) {
                await ctx.db.apiKey.delete({
                    where: { id },
                })

                ctx.status = 200
            } else {
                ctx.status = 404
            }
        }
    )
}

export default routesApiKeys
