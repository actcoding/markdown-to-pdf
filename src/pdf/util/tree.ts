import { readFile } from 'fs/promises'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

export default async function buildTree(file: string) {
    const contents = await readFile(file)

    return unified()
        .use(remarkParse)
        .parse(contents)
}
