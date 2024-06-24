import { createReadStream } from 'fs'
import { stat } from 'fs/promises'
import { join, resolve } from 'path'
import { authenticate } from '../middleware/authenticate'
import html from '../pdf/steps/02-generate-html'
import pdf from '../pdf/steps/03-pdf'
import type { Config, RouteRegistrar } from '../types'
import prisma from '../database'

const routesConvert: RouteRegistrar = router => {
    router.get(
        '/convert/:id',

        authenticate(),

        async (ctx) => {
            const { id } = ctx.params

            await prisma.upload.findUniqueOrThrow({
                where: {
                    id: parseInt(id),
                },
            })

            const root = resolve(`work/${id}`)
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
            ctx.set('Location', `/conversion/${id}`)
            ctx.body = createReadStream(config.outputFile)
        }
    )
}

export default routesConvert
