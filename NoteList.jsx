import React from 'react'
import NoteCard from './NoteCard'

export default function NoteList({ notes, query, onEdit, onDelete, onTogglePin, onToggleArchive }) {
  // filter by query and archived flag already managed by parent
  if (!notes || notes.length === 0) {
    return <div className="text-gray-500">No notes found.</div>
  }

  // pinned notes first
  const pinned = notes.filter(n => n.pinned && !n.archived)
  const others = notes.filter(n => !n.pinned && !n.archived)

  return (
    <div className="space-y-4">
      {pinned.length > 0 && (
        <>
          <h4 className="text-sm font-semibold">Pinned</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pinned.map(n => <NoteCard key={n.id} note={n} onEdit={onEdit} onDelete={onDelete} onTogglePin={onTogglePin} onToggleArchive={onToggleArchive} />)}
          </div>
        </>
      )}
      <h4 className="text-sm font-semibold">Notes</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {others.map(n => <NoteCard key={n.id} note={n} onEdit={onEdit} onDelete={onDelete} onTogglePin={onTogglePin} onToggleArchive={onToggleArchive} />)}
      </div>
    </div>
  )
}
