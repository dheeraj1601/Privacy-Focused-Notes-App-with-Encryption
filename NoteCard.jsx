import React from 'react'

export default function NoteCard({ note, onEdit, onDelete, onTogglePin, onToggleArchive }) {
  return (
    <div className="border rounded p-3 bg-white shadow-sm flex flex-col">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold">{note.title}</h3>
        <div className="text-sm flex gap-2">
          <button onClick={() => onTogglePin(note.id)} className="text-yellow-600">{note.pinned ? 'Unpin' : 'Pin'}</button>
          <button onClick={() => onToggleArchive(note.id)} className="text-indigo-600">{note.archived ? 'Unarchive' : 'Archive'}</button>
          <button onClick={() => onDelete(note.id)} className="text-red-600">Delete</button>
        </div>
      </div>
      <div className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{note.body}</div>
      <div className="text-xs text-gray-400 mt-3">{new Date(note.updatedAt || note.createdAt).toLocaleString()}</div>
      <div className="mt-2 flex gap-2">
        <button onClick={() => onEdit(note)} className="text-blue-600 text-sm">Edit</button>
      </div>
    </div>
  )
}
