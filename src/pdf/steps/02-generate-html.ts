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
import type { Literal } from 'unist'
import { build } from 'vite'
import { DIRECTORY_RESOURCES } from '../../constants'
import type { Step } from '../../types'
import { select } from '../../util/select'
import { DirectiveTip, DirectiveWarning } from '../components/Directive'
import remarkImgLinks from '../unified/remarkImgLinks'
import buildStylesheets from '../util/css'
import buildTree from '../util/tree'

const html: Step = async ({ inputFile, workingDirectory, spinner, vite }) => {
    if (spinner) {
        spinner.text = 'Generating static website'
    }

    const tree = await buildTree(inputFile)
    const css = await buildStylesheets()

    const result = await unified()
        .use(remarkParse)
        .use(remarkImgLinks, {
            source: dirname(inputFile),
            destination: workingDirectory,
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
            title: select<Literal>('text', tree)?.value as string,
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
        .process(await readFile(inputFile))

    await writeFile(resolve(workingDirectory, 'index.html'), result.value)
    await cp(DIRECTORY_RESOURCES, workingDirectory, { recursive: true })
    await build(vite)
}

export default html
