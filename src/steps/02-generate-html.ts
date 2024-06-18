import { cp, readFile, writeFile } from 'fs/promises'
import { dirname, resolve } from 'path'
import rehypeComponents from 'rehype-components'
import rehypeDocument from 'rehype-document'
import rehypeFormat from 'rehype-format'
import rehypeStringify from 'rehype-stringify'
import remarkDirective from 'remark-directive'
import remarkDirectiveRehype from 'remark-directive-rehype'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { select } from 'unist-util-select'
import { build } from 'vite'
import { DirectiveTip, DirectiveWarning } from '../components/Directive'
import { DIRECTORY_OUTPUT, DIRECTORY_RESOURCES } from '../constants'
import type { Step } from '../types'
import remarkImgLinks from '../unified/remarkImgLinks'
import buildStylesheets from '../util/css'
import buildTree from '../util/tree'

const html: Step = async ({ spinner, input, vite }) => {
    spinner.text = 'Generating static website'

    const tree = await buildTree(input)
    const css = await buildStylesheets()

    const result = await unified()
        .use(remarkParse)
        .use(remarkImgLinks, {
            source: dirname(input),
            destination: DIRECTORY_OUTPUT,
        })
        .use(remarkGfm)
        .use(remarkDirective)
        .use(remarkDirectiveRehype)
        .use(remarkRehype)
        .use(rehypeComponents, {
            components: {
                tip: DirectiveTip,
                warning: DirectiveWarning,
            }
        })
        .use(rehypeDocument, {
            dir: 'ltr',
            title: select('text', tree)?.value,
            css: css.map(el => el.file),
            link: [
                {
                    rel: 'icon',
                    href: '/logo.png',
                },
            ],
        })
        .use(rehypeFormat, {
            indent: 4,
        })
        .use(rehypeStringify)
        .process(await readFile(input))

    await writeFile(resolve(DIRECTORY_OUTPUT, 'index.html'), result.value)
    await cp(DIRECTORY_RESOURCES, DIRECTORY_OUTPUT, { recursive: true })
    await build(vite)
}

export default html
