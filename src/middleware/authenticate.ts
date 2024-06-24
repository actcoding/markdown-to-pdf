import type { Middleware } from 'koa'
import type { ServerState } from '../config'
import db from '../database'

export function authenticate(masterOnly: boolean = false): Middleware<ServerState> {
    return (ctx, next) => {
        const header = ctx.get('Authorization')
        if (header.length === 0 || !header.startsWith('Bearer ')) {
            ctx.status = 403
            return
        }

        const key = header.substring(7)

        const isMasterKey = key === ctx.state.config.APP_MASTER_KEY
        const isValidApiKey = db.query('SELECT id FROM api_keys WHERE key = ?').get(key) !== null

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
