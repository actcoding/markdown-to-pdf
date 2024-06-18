import type { Ora } from 'ora'
import type { UserConfig } from 'vite'

export interface Config {
    input: string
    output: string

    vite: UserConfig

    spinner: Ora
}

export type Step = (config: Config) => Promise<void>
