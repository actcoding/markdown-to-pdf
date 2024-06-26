import { mkdir, rm, writeFile } from 'fs/promises'
import { nanoid } from 'nanoid'
import { authenticate } from '../middleware/authenticate'
import { multipart } from '../middleware/body-parser'
import type { RouteRegistrar } from '../types'

const routesUpload: RouteRegistrar = router => {
    router.get(
        '/upload',

        authenticate(true),

        async (ctx) => {
            ctx.body = await ctx.db.upload.findMany()
        }
    )

    router.post(
        '/upload',

        authenticate(),
        multipart,

        // generate upload id
        async (ctx, next) => {
            ctx.state.id = nanoid()

            const dest = `work/${ctx.state.id}`
            await mkdir(dest, { recursive: true })

            try {
                return await next()
            } catch (error) {
                await rm(dest, { recursive: true })
            }
        },

        async (ctx) => {
            const files = ctx.request.files
            if (!files) {
                ctx.status = 400
                return
            }

            const { markdown } = files

            await writeFile(`work/${ctx.state.id}/input.md`, markdown.content)
            await ctx.db.upload.create({
                data: {
                    key: ctx.state.id as string,
                }
            })

            ctx.body = {
                'id': ctx.state.id,
            }
            ctx.status = 201
        },
    )
}

export default routesUpload
