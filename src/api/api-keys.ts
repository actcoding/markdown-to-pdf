import { randomBytes } from 'crypto'
import db from '../database'
import { authenticate } from '../middleware/authenticate'
import type { RouteRegistrar } from '../types'
import { ZodError, z } from 'zod'
import { bodyparser } from '../middleware/body-parser'

type ApiKey = {
    id: string
    created_at: Date
    key: string
}

const routesApiKeys: RouteRegistrar = router => {
    router.get(
        '/api-key',

        authenticate(true),

        async (ctx) => {
            ctx.body = db.query('SELECT * FROM api_keys').all()
        }
    )

    router.post(
        '/api-key',

        authenticate(true),

        async (ctx) => {
            const key = randomBytes(32).toString('hex')

            const result = db.query<ApiKey, { $key: string }>(`
                INSERT INTO api_keys (key)
                VALUES ($key)
                RETURNING id;
            `).get({
                $key: key,
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

            const result = db.query<ApiKey, { $id: string }>(`
                SELECT * FROM api_keys
                WHERE id = $id
            `).get({
                $id: id,
            })

            if (result) {
                db.exec(`
                    DELETE FROM api_keys
                    WHERE id = ${id}
                `)

                ctx.status = 200
            } else {
                ctx.status = 404
            }
        }
    )
}

export default routesApiKeys
