import React, { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

export default function NoteEditor({ onSave, editingNote, passphrase }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title || '')
      setBody(editingNote.body || '')
    } else {
      setTitle('')
      setBody('')
    }
  }, [editingNote])

  function handleSave() {
    if (!title.trim() && !body.trim()) return
    const payload = {
      id: editingNote?.id || uuidv4(),
      title: title.trim(),
      body: body.trim(),
      pinned: editingNote?.pinned || false,
      archived: editingNote?.archived || false,
      createdAt: editingNote?.createdAt || Date.now(),
      updatedAt: Date.now()
    }
    onSave(payload)
    setTitle('')
    setBody('')
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <input className="w-full border p-2 mb-2" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      <textarea className="w-full border p-2 h-40 mb-2" placeholder="Write your note..." value={body} onChange={e => setBody(e.target.value)} />
      <div className="flex gap-2 justify-end">
        <button className="px-3 py-1 border rounded" onClick={() => { setTitle(''); setBody('') }}>Clear</button>
        <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={handleSave}>Save</button>
      </div>
    </div>
  )
}
