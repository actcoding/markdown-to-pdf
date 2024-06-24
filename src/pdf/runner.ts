import chalk from 'chalk'
import { stat } from 'fs/promises'
import ora from 'ora'
import { resolve } from 'path'
import prettyBytes from 'pretty-bytes'
import prepare from './steps/01-prepare'
import html from './steps/02-generate-html'
import pdf from './steps/03-pdf'
import type { Config, Step } from '../types'
import { nanoid } from 'nanoid'

const spinner = ora({
    text: 'Initializing',
    suffixText: '…',
})

const steps: Step[] = [
    prepare,
    html,
    pdf,
]

export default async function run(inputFile: string, outputFile: string) {
    const workingDirectory = resolve('work', nanoid())

    const config: Config = {
        inputFile, outputFile,
        workingDirectory,

        spinner,

        vite: {
            root: workingDirectory,
            logLevel: 'warn',
        }
    }

    try {
        for await (const step of steps) {
            await step(config)
        }
    } catch (error) {
        console.error(error)
        spinner.fail(error instanceof Error ? error.message : undefined)
        process.exit(1)
    }

    const { size } = await stat(config.outputFile)

    spinner.suffixText = `( ${chalk.green(prettyBytes(size))} )`
    spinner.succeed()
}
