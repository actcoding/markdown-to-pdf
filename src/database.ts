import { Database } from 'bun:sqlite'

const db = new Database('data.db', {
    create: true,
    readwrite: true,
})

db.exec('PRAGMA journal_mode = WAL;')

process.on('beforeExit', () => db.close(false))


type Migration = () => void

const migrations: Migration[] = [
    async () => db.exec(`
    CREATE TABLE IF NOT EXISTS api_keys (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        key TEXT NOT NULL
    );
    `)
]

for (const migration of migrations) {
    migration()
}

export default db
