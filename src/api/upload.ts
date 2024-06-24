import { mkdir, rm, writeFile } from 'fs/promises'
import { nanoid } from 'nanoid'
import type { ServerState } from '../config'
import { authenticate } from '../middleware/authenticate'
import { multipart } from '../middleware/body-parser'
import type { RouteRegistrar } from '../types'

interface UploadState extends ServerState {
    id: string
}

const routesUpload: RouteRegistrar = router => {
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

            ctx.body = {
                'id': ctx.state.id,
            }
            ctx.status = 201
        },
    )
}

export default routesUpload
