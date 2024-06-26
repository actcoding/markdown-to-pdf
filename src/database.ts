import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

await prisma.$connect()

// await prisma.$executeRawUnsafe('PRAGMA journal_mode = WAL;')

export default prisma
