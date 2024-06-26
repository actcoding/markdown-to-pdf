import { mkdir, rm } from 'fs/promises'
import type { Step } from '../../types'

const prepare: Step = async ({ workingDirectory, spinner }) => {
    if (spinner) {
        spinner.text = 'Preparing'
    }

    await rm(workingDirectory, { recursive: true, force: true })
    await mkdir(workingDirectory, { recursive: true })
}

export default prepare
