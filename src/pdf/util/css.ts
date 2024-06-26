import { readFile } from 'fs/promises'
import { resolve } from 'path'

export default async function buildStylesheets() {
    const entries = [
        'pdf.css',
    ]
        .map(file => resolve('resources', file))
        .map(file => ({
            file,
            content: '',
        }))

    for await (const entry of entries) {
        entry.content = (await readFile(entry.file, { encoding: 'utf-8' })).toString()
    }

    return entries
}
