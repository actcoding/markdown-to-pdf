import type Router from '@koa/router'
import type { Part } from 'multiparty'
import type { Ora } from 'ora'
import type { UserConfig } from 'vite'
import type { ServerContext, ServerState } from './config'

export interface Config {
    inputFile: string
    outputFile: string
    workingDirectory: string

    vite: UserConfig

    spinner?: Ora
}

export type Step = (config: Config) => Promise<void>

export type RouteRegistrar = (router: Router<ServerState, ServerContext>) => void

export type Fields = Record<string, string[]>
export type File = {
    originalName: string
    headers: Record<string, string>
    size: number
    content: Buffer
}
export type Files = Record<string, File>

declare module 'koa' {
    interface Request {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        body?: Record<string, any>
        files?: Files
    }
}
