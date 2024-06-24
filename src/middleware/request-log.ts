import type { Middleware } from 'koa'
import { nanoid } from 'nanoid'
import type { ServerState } from '../config'

const requestLog: Middleware<ServerState> = async function (ctx, next) {
    const id = nanoid()
    ctx.set('X-Request-ID', id)

    console.time(id)

    await next()

    console.timeLog(id, ctx.request.ip, ctx.request.method, ctx.request.path, ctx.request.protocol, ctx.response.status)
}

export default requestLog
