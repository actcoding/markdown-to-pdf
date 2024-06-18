import chalk from 'chalk'
import { stat } from 'fs/promises'
import ora from 'ora'
import prettyBytes from 'pretty-bytes'
import { DIRECTORY_OUTPUT } from './constants'
import prepare from './steps/01-prepare'
import html from './steps/02-generate-html'
import pdf from './steps/03-pdf'
import type { Config, Step } from './types'

const spinner = ora({
    text: 'Initializing',
    suffixText: '…',
}).start()

const config: Config = {
    input: 'input/ubungen.md',
    output: 'output.pdf',

    spinner,

    vite: {
        root: DIRECTORY_OUTPUT,
        assetsInclude: [
            'input/**/*'
        ],
        logLevel: 'warn',
    }
}

const steps: Step[] = [
    prepare,
    html,
    pdf,
]

try {
    for await (const step of steps) {
        await step(config)
    }
} catch (error) {
    console.error(error)
    spinner.fail(error instanceof Error? error.message : undefined)
    process.exit(1)
}

const { size } = await stat(config.output)

spinner.suffixText = `( ${chalk.green(prettyBytes(size))} )`
spinner.succeed()
