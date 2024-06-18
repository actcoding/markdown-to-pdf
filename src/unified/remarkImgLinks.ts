import { cp } from 'fs/promises'
import { join, resolve } from 'path'
import type { Processor } from 'unified'
import { visit } from 'unist-util-visit'

interface Options {
    source: string
    destination: string
}

const remarkImgLinks = function (this: Processor, options: Options) {
    async function visitor(node) {
        // Sanitize URL by removing leading `/`
        const sourceFile = join(options.source, node.url)

        await cp(sourceFile, resolve(options.destination, node.url))

        node.url = join('./', node.url)
    }

    function transform(tree) {
        visit(tree, 'image', visitor)
    }

    return transform
}

export default remarkImgLinks
