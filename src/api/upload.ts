import { mkdir, rm, writeFile } from 'fs/promises'
import { nanoid } from 'nanoid'
import type { ServerState } from '../config'
import { authenticate } from '../middleware/authenticate'
import { multipart } from '../middleware/body-parser'
import type { RouteRegistrar } from '../types'
import prisma from '../database'

interface UploadState extends ServerState {
    id: string
}

const routesUpload: RouteRegistrar = router => {
    router.get(
        '/upload',

        authenticate(true),

        async (ctx) => {
            ctx.body = await prisma.upload.findMany()
        }
    )

    router.post<UploadState>(
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
            await prisma.upload.create({
                data: {
                    key: ctx.state.id,
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
