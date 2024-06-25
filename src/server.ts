import 'dotenv/config'

import Router from '@koa/router'
import Koa from 'koa'
import { config, type ServerContext, type ServerState } from './config'
import requestLog from './middleware/request-log'
import routesApiKeys from './api/api-keys'
import routesUpload from './api/upload'
import routesConvert from './api/convert'
import prisma from './database'

const app = new Koa<ServerState, ServerContext>()
const router = new Router<ServerState, ServerContext>()

routesApiKeys(router)
routesUpload(router)
routesConvert(router)

app.use((ctx, next) => {
    ctx.config = config
    ctx.db = prisma

    return next()
})

app.use(requestLog)
app.use(router.allowedMethods())
app.use(router.routes())

export default function startServer() {
    const port = 3000

    app.listen(port)

    console.log(`listening on port ${port}`)
}
