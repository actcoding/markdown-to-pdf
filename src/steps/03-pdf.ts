import { writeFile } from 'fs/promises'
import { launch } from 'puppeteer'
import { preview } from 'vite'
import type { Step } from '../types'
import buildStylesheets from '../util/css'
import loadLogo from '../util/logo'

const pdf: Step = async ({ spinner, output, vite }) => {
    spinner.text = 'Creating PDF file'

    const css = await buildStylesheets()

    const server = await preview(vite)

    const browser = await launch({
        headless: true,
        userDataDir: './.puppeteer-data',
    })
    const page = await browser.newPage()

    await page.goto(server.resolvedUrls!.local[0], {
        waitUntil: 'networkidle2',
    })

    const logoSrc = await loadLogo()
    const pdf = await page.pdf({
        displayHeaderFooter: true,
        printBackground: true,
        outline: true,
        format: 'A4',
        margin: {
            bottom: '2cm',
            top: '2.5cm',
            left: '2.5cm',
            right: '2.5cm',
        },

        headerTemplate: `
        <style>
        ${css.map(file => file.content).join('\n')}
        </style>
        <section class="header">
            <img src="${logoSrc}">
        </section>
        `,
        footerTemplate: `
        <section class="footer">
            <div class="footer-left">
                <span>act coding GbR</span>
            </div>
            <div class="footer-center">
                Seite <span class="pageNumber"></span>
                von <span class="totalPages"></span>
            </div>
            <div class="footer-right">
                <span class="title"></span>
            </div>
        </section>
        `,
    })

    await writeFile(output, pdf)

    await browser.close()
    await server.close()
}

export default pdf
