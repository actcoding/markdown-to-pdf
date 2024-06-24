import { cp } from 'fs/promises'
import type { Image } from 'mdast'
import { join, resolve } from 'path'
import type { Processor } from 'unified'
import type { Node } from 'unist'
import { visit, type Visitor } from 'unist-util-visit'

interface Options {
    source: string
    destination: string
}

const remarkImgLinks = function (this: Processor, options: Options) {
    const promises: Promise<unknown>[] = []

    const visitor: Visitor<Image> = function (node) {
        // Sanitize URL by removing leading `/`
        const sourceFile = join(options.source, node.url)

        promises.push(
            cp(sourceFile, resolve(options.destination, node.url))
        )

        node.url = join('./', node.url)
    }

    // https://github.com/syntax-tree/unist-util-visit-parents/issues/8
    async function transform(tree: Node) {
        visit(tree, 'image', visitor)

        await Promise.all(promises)
    }

    return transform
}

export default remarkImgLinks
