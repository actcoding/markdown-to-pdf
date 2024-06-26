import { createReadStream } from 'fs'
import { stat } from 'fs/promises'
import { join, resolve } from 'path'
import { authenticate } from '../middleware/authenticate'
import html from '../pdf/steps/02-generate-html'
import pdf from '../pdf/steps/03-pdf'
import type { Config, RouteRegistrar } from '../types'

const routesConvert: RouteRegistrar = router => {
    router.get(
        '/convert/:key',

        authenticate(),

        async (ctx) => {
            const { key } = ctx.params

            await ctx.db.upload.findUniqueOrThrow({
                where: { key },
            })

            const root = resolve(`work/${key}`)
            const config: Config = {
                inputFile: join(root, 'input.md'),
                outputFile: join(root, 'output.pdf'),
                workingDirectory: root,

                vite: {
                    root,

                    clearScreen: false,
                    logLevel: 'warn',
                }
            }

            try {
                const stats = await stat(config.outputFile)
                if (stats.isFile() && stats.size > 0) {
                    ctx.status = 200

                    ctx.attachment('output.pdf')
                    ctx.body = createReadStream(config.outputFile)
                    return
                }
            } catch (error) {
                //
            }

            await html(config)
            await pdf(config)

            // await rm(root, { recursive: true, force: true })

            ctx.status = 201

            ctx.attachment('output.pdf')
            ctx.set('Location', `/conversion/${key}`)
            ctx.body = createReadStream(config.outputFile)
        }
    )
}

export default routesConvert
