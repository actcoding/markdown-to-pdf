import pino from 'pino'
import { config } from './config'
import PinoPretty from 'pino-pretty'

const logger = pino(
    {
        level: config.NODE_ENV === 'production' ? 'info' : 'trace',
    },
    config.NODE_ENV === 'production' ? process.stdout : PinoPretty({ colorize: true, sync: false, }),
)

export default logger
