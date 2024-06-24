import type { Middleware } from 'koa'
import type { ServerState } from '../config'
import prisma from '../database'

export function authenticate(masterOnly: boolean = false): Middleware<ServerState> {
    return async (ctx, next) => {
        const header = ctx.get('Authorization')
        if (header.length === 0 || !header.startsWith('Bearer ')) {
            ctx.status = 403
            return
        }

        const key = header.substring(7)

        const isMasterKey = key === ctx.state.config.APP_MASTER_KEY
        const isValidApiKey = await prisma.apiKey.findUnique({
            where: { key },
        })

        if (
            (masterOnly && !isMasterKey) ||
            (!masterOnly && !isMasterKey && !isValidApiKey)
        ) {
            ctx.status = 403
            return
        }

        return next()
    }
}
