import { program } from 'commander'

import { version } from '../package.json'

program.name('mdpdf')
    .description('📄 Generates a themed PDF file from Markdown input.')
    .version(version)

program.command('run')
    .description('Convert Markdown input to a themed PDF file.')
    .argument('<input>', 'The Markdown input file. Any referenced files (images, etc.) must be in the same directory.')
    .argument('<output>', 'The destination file name.')
    .action(async (input, output) => {
        const { default: runner } = await import('./pdf/runner')
        await runner(input, output)
    })

program.command('server')
    .description('Start an HTTP server for API-based conversion.')
    .action(async () => {
        const { default: startServer } = await import('./server')
        startServer()
    })

program.parse()
