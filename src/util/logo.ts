import { readFile } from 'fs/promises'
import { resolve } from 'path'

export default async function loadLogo(): Promise<string> {
    const data = await readFile(resolve('resources', 'logo.png'))
    const base64 = Buffer.from(data).toString('base64')
    return `data:image/png;charset=utf-8;base64,${base64}`
}
