import React, { useState } from 'react';

function AddServiceNotes() {
  // State to store the service notes
  const [notes, setNotes] = useState([
    { id: 1, text: "Changed oil on 20/09/2024" },
    { id: 2, text: "Replaced brake pads on 15/08/2024" }
  ]);

  const [newNote, setNewNote] = useState('');
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');

  // Add a new note
  const handleAddNote = () => {
    if (newNote.trim() === '') return;
    
    setNotes([...notes, { id: Date.now(), text: newNote }]);
    setNewNote('');
  };

  // Delete a note
  const handleDeleteNote = (id) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    setNotes(updatedNotes);
  };

  // Start editing a note
  const handleEditNote = (note) => {
    setEditId(note.id);
    setEditText(note.text);
  };

  // Save the edited note
  const handleSaveEdit = () => {
    const updatedNotes = notes.map(note =>
      note.id === editId ? { ...note, text: editText } : note
    );
    setNotes(updatedNotes);
    setEditId(null);
    setEditText('');
  };

  return (
    <div>
      <h1>View/Add/Delete Service Notes</h1>
      <ul>
        {notes.map(note => (
          <li key={note.id}>
            {editId === note.id ? (
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
            ) : (
              <span>{note.text}</span>
            )}
            
            {editId === note.id ? (
              <button onClick={handleSaveEdit}>Save</button>
            ) : (
              <button onClick={() => handleEditNote(note)}>Edit</button>
            )}
            <button onClick={() => handleDeleteNote(note.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <div>
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Enter new service note"
        />
        <button onClick={handleAddNote}>Add Note</button>
      </div>
    </div>
  );
}

export default AddServiceNotes;
