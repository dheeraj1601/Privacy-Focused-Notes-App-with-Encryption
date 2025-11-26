import React, { useEffect, useState } from 'react'
import NoteEditor from './components/NoteEditor'
import NoteList from './components/NoteList'
import { addNote, deleteNote, getAllNotes, getNote, bulkPut } from './utils/db'
import { encryptText, decryptText } from './utils/crypto'

function App() {
  const [notes, setNotes] = useState([]) // decrypted notes for UI
  const [editing, setEditing] = useState(null)
  const [query, setQuery] = useState('')
  const [archivedView, setArchivedView] = useState(false)
  const [passphrase, setPassphrase] = useState(() => sessionStorage.getItem('notes_pass') || '')

  useEffect(() => {
    if (!passphrase) return
    loadNotes()
  }, [passphrase])

  async function loadNotes() {
    const all = await getAllNotes()
    // decrypt each note
    const decrypted = all.map(item => {
      try {
        const plain = decryptText(item.encrypted, passphrase)
        const parsed = JSON.parse(plain)
        return parsed
      } catch (e) {
        // if decryption fails, skip or return minimal object
        return { id: item.id, title: '🔒 Unable to decrypt', body: '', pinned: false, archived: false, createdAt: item.createdAt, updatedAt: item.updatedAt }
      }
    })
    // filter out archived depending on view
    const filtered = decrypted.filter(n => archivedView ? n.archived : !n.archived)
    // apply search
    const q = query.trim().toLowerCase()
    const visible = filtered.filter(n => !q || (n.title + ' ' + n.body).toLowerCase().includes(q))
    // pinned ordering handled in NoteList
    setNotes(visible.sort((a,b) => (b.pinned - a.pinned) || (b.updatedAt - a.updatedAt)))
  }

  function requirePassphrase() {
    const p = prompt('Enter master passphrase for notes (session only):')
    if (p) {
      sessionStorage.setItem('notes_pass', p)
      setPassphrase(p)
    }
  }

  async function handleSave(note) {
    if (!passphrase) {
      alert('Set a master passphrase first (click "Set Passphrase")')
      return
    }
    // merge with existing if editing
    const existing = notes.find(n => n.id === note.id)
    const full = {
      ...note,
      createdAt: existing?.createdAt || note.createdAt || Date.now(),
      updatedAt: Date.now()
    }
    // encrypt JSON string
    const json = JSON.stringify(full)
    const encrypted = encryptText(json, passphrase)
    // store encrypted blob in IndexedDB (store fields: id, encrypted, createdAt, updatedAt)
    await addNote({ id: full.id, encrypted, createdAt: full.createdAt, updatedAt: full.updatedAt })
    await loadNotes()
    setEditing(null)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this note?')) return
    await deleteNote(id)
    await loadNotes()
  }

  async function handleEdit(note) {
    setEditing(note)
  }

  async function togglePin(id) {
    // find, modify then re-encrypt the whole note
    const dbNote = await getNote(id)
    if (!dbNote) return
    // decrypt
    const plain = decryptText(dbNote.encrypted, passphrase)
    const parsed = JSON.parse(plain)
    parsed.pinned = !parsed.pinned
    parsed.updatedAt = Date.now()
    const encrypted = encryptText(JSON.stringify(parsed), passphrase)
    await addNote({ id: parsed.id, encrypted, createdAt: parsed.createdAt, updatedAt: parsed.updatedAt })
    await loadNotes()
  }

  async function toggleArchive(id) {
    const dbNote = await getNote(id)
    if (!dbNote) return
    const plain = decryptText(dbNote.encrypted, passphrase)
    const parsed = JSON.parse(plain)
    parsed.archived = !parsed.archived
    parsed.updatedAt = Date.now()
    const encrypted = encryptText(JSON.stringify(parsed), passphrase)
    await addNote({ id: parsed.id, encrypted, createdAt: parsed.createdAt, updatedAt: parsed.updatedAt })
    await loadNotes()
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Privacy Notes (Client-side AES)</h1>
          <div className="flex gap-2 items-center">
            <input className="border p-2" placeholder="Search..." value={query} onChange={e => { setQuery(e.target.value); setTimeout(loadNotes, 0) }} />
            <button className="px-3 py-1 border rounded" onClick={() => { sessionStorage.removeItem('notes_pass'); setPassphrase(''); alert('Passphrase cleared from session') }}>Clear Passphrase</button>
            <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={() => requirePassphrase()}>{passphrase ? 'Passphrase set' : 'Set Passphrase'}</button>
            <button className="px-3 py-1 border rounded" onClick={() => { setArchivedView(v => !v); setTimeout(loadNotes, 0) }}>{archivedView ? 'Show Active' : 'Show Archived'}</button>
          </div>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <NoteEditor onSave={handleSave} editingNote={editing} passphrase={passphrase} />
          </div>

          <div className="md:col-span-2">
            <NoteList notes={notes} query={query} onEdit={handleEdit} onDelete={handleDelete} onTogglePin={togglePin} onToggleArchive={toggleArchive} />
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
