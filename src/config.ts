import type { Middleware } from 'koa'
import { z } from 'zod'

const configSchema = z.object({
    APP_SECRET: z.string().min(32),
    APP_MASTER_KEY: z.string().min(16),
})

export const config = await configSchema.parseAsync(process.env)

export type ServerConfig = typeof config
export type ServerState = {
}

export type ServerContext = {
    config: ServerConfig
    db: PrismaClient
}

export type ServerMiddleware = Middleware<ServerState, ServerContext>
