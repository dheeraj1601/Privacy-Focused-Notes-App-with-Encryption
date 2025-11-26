import { openDB } from 'idb'

const DB_NAME = 'privacy-notes-db'
const STORE_NAME = 'notes'
const VERSION = 1

export async function getDb() {
  return openDB(DB_NAME, VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('pinned', 'pinned', { unique: false })
        store.createIndex('archived', 'archived', { unique: false })
        store.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }
  })
}

export async function addNote(note) {
  const db = await getDb()
  await db.put(STORE_NAME, note)
}

export async function deleteNote(id) {
  const db = await getDb()
  await db.delete(STORE_NAME, id)
}

export async function getNote(id) {
  const db = await getDb()
  return db.get(STORE_NAME, id)
}

export async function getAllNotes() {
  const db = await getDb()
  return db.getAllFromIndex(STORE_NAME, 'createdAt') // returns all, sort may vary
}

export async function bulkPut(notes) {
  const db = await getDb()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  for (const n of notes) tx.store.put(n)
  await tx.done
}
