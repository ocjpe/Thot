'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [noteContent, setNoteContent] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentNoteId, setCurrentNoteId] = useState(null);

  console.log(notes);

  // Fonction pour récupérer les notes
  const fetchNotes = async () => {
    try {
      const response = await fetch('http://localhost:8000/getNotes');
      if (response.ok) {
        const notesData = await response.json();
        setNotes(notesData.response);
        console.log('Notes récupérées:', notesData);
      } else {
        console.error('Erreur lors de la récupération des notes');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des notes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour sauvegarder
  const saveNote = async (content) => {
    try {
      const response = await fetch('http://localhost:8000/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          note: content,
          noteId: currentNoteId 
        }),
      });
      
      if (response.ok) {
        setLastSaved(new Date());
        console.log('Note sauvegardée automatiquement');
        // Rafraîchir la liste des notes après sauvegarde
        fetchNotes();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  // Fonction pour sélectionner une note
  const selectNote = (note) => {
    setCurrentNoteId(note.id);
    setNoteContent(note.content || '');
  };

  // Fonction pour créer une nouvelle note
  const createNewNote = () => {
    setCurrentNoteId(null);
    setNoteContent('');
  };

  // Récupérer les notes au chargement du composant
  useEffect(() => {
    fetchNotes();
  }, []);

  // Auto-save toutes les 10 secondes
  useEffect(() => {
    if (noteContent.trim()) { // Ne sauvegarde que si il y a du contenu
      const interval = setInterval(() => {
        saveNote(noteContent);
      }, 10000); // 10 secondes

      return () => clearInterval(interval);
    }
  }, [noteContent]);

  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    fetch('/some-api', { method: e.target.method, body: formData });
    const formJson = Object.fromEntries(formData.entries());
    console.log(formJson);
  }

  const handleTextareaChange = (e) => {
    setNoteContent(e.target.value);
  };

  return (
    <div className="font-sans">
      <main>
        {/* Barre latérale avec la liste des notes existantes, un bouton pour une nouvelle note, un bouton pour supprimer la note */}
        <aside id="default-sidebar" className="fixed border border-gray-800 top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0" aria-label="Sidebar">
          <div className="h-full px-3 py-4 overflow-y-auto bg-[#627C85]">
            <div className="flex self-center justify-center pb-5 pt-3">
              <span className="text-black text-2xl font-semibold whitespace-nowrap">THOT</span>
            </div>
            <div className="flex justify-center">
              <button 
                type="button" 
                onClick={createNewNote}
                className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 me-2 mb-2"
              >
                Nouvelle Note
              </button>
            </div>
            {loading ? (
              <div className="text-center text-black">Chargement...</div>
            ) : (
              <ul className="max-w-md space-y-1 text-gray-500 list-none">
                {notes.length === 0 ? (
                  <li className="text-black text-center p-4">Aucune note trouvée</li>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="grid grid-cols-2 p-5 items-center">
                      <li 
                        className={`text-lg cursor-pointer hover:underline ${
                          currentNoteId === note.id ? 'text-blue-800 font-bold' : 'text-black'
                        }`}
                        onClick={() => selectNote(note)}
                      >
                        {note.title || `Note ${note.id}`}
                      </li>
                      <button 
                        type="button" 
                        className="m-auto bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 rounded-full p-2.5"
                        onClick={() => {
                          // Ici vous pouvez ajouter la logique de suppression
                          console.log('Supprimer note:', note.id);
                        }}
                      >
                        <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                          <path d="M136.7 5.9L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-8.7-26.1C306.9-7.2 294.7-16 280.9-16L167.1-16c-13.8 0-26 8.8-30.4 21.9zM416 144L32 144 53.1 467.1C54.7 492.4 75.7 512 101 512L347 512c25.3 0 46.3-19.6 47.9-44.9L416 144z"/>
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </ul>
            )}
          </div>
        </aside>
        <form className="p-4 sm:ml-64" method="post" onSubmit={handleSubmit}>
          <textarea 
            id="note" 
            name="note" 
            rows={40} 
            cols={34} 
            value={noteContent}
            onChange={handleTextareaChange}
            className="p-5 block w-full h-full text-sm text-white focus:outline-none resize-none" 
            placeholder="Ecris ce que tu penses ici..."
          />
        </form>
      </main>
      <footer className="m-4">
        <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
          <span className="text-sm text-gray-500">
            Caractères: {noteContent.length}
            {lastSaved && (
              <span className="ml-4 text-green-600">
                Dernière sauvegarde: {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </span>
          <span className="text-sm text-gray-500 sm:text-center">© 2025 <a href="https://ocejpe.fr/" className="hover:underline">THOT™</a>. All Rights Reserved.</span>
        </div>
      </footer>
    </div>
  );
}