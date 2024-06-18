import { mkdir } from 'fs/promises'
import { rimraf } from 'rimraf'
import { DIRECTORY_OUTPUT } from '../constants'
import type { Step } from '../types'

const prepare: Step = async ({ spinner }) => {
    spinner.text = 'Preparing'

    await rimraf(DIRECTORY_OUTPUT)
    await mkdir(DIRECTORY_OUTPUT)
}

export default prepare
