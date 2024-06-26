import middleware from 'co-body'
import { Form } from 'multiparty'
import type { ServerMiddleware } from '../config'

const multipart: ServerMiddleware = async (ctx, next) => {
    if (ctx.request.is('multipart/*')) {
        const form = new Form()

        await new Promise<void>((resolve, reject) => {
            // @ts-expect-error used in reject
            const doReject = error => {
                ctx.set('Content-Type', 'text/plain')
                ctx.body = error.message
                ctx.status = error.statusCode ?? 400

                reject(error)
            }

            form.once('error', doReject)
            form.once('close', resolve)

            form.on('field', (name, value) => ctx.request.body = { ...ctx.request.body, [name]: value })
            form.on('part', part => {
                const chunks: Uint8Array[] = []
                part.on('data', chunk => chunks.push(chunk))

                part.once('error', doReject)
                part.once('end', () => {
                    ctx.request.files = {
                        ...ctx.request.files,

                        [part.name]: {
                            originalName: part.filename,
                            headers: part.headers,
                            size: part.byteCount,
                            content: Buffer.concat(chunks),
                        },
                    }
                })
            })

            form.parse(ctx.req)
        })
    }

    return next()
}

const bodyparser: ServerMiddleware = async (ctx, next) => {
    ctx.request.body = await middleware(ctx)

    return next()
}

export { bodyparser, multipart }
