import dayjs from 'dayjs'
import { nanoid } from 'nanoid'
import type { ServerMiddleware } from '../config'
import logger from '../logger'

const requestLog: ServerMiddleware = async function (ctx, next) {
    const id = nanoid()
    ctx.set('X-Request-ID', id)

    const now = dayjs()

    let failed = false
    const data: Record<string, unknown> = {
        ip: ctx.request.ip,
        method: ctx.request.method,
        path: ctx.request.path,
        protocol: ctx.request.protocol,
        params: ctx.params,
    }

    try {
        await next()
    // @ts-expect-error I hate errors
    } catch (error: Error) {
        failed = true

        if (error.name === 'NotFoundError') {
            data.error = error
        }
    }

    data.status = ctx.response.status
    data.duration = `${dayjs().diff(now)} ms`

    failed ? logger.error(data) : logger.info(data)
}

export default requestLog
