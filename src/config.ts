import type { Middleware } from '@koa/router'
import type { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const configSchema = z.object({
    NODE_ENV: z.enum(['local', 'test', 'production']).default('production'),

    APP_SECRET: z.string().min(32),
    APP_MASTER_KEY: z.string().min(16),

    SERVER_PORT: z.coerce.number().min(0).max(65535).default(3000),
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
