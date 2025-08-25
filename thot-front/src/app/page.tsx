'use client';
import { useState, useEffect, useCallback } from 'react';

interface Note {
  id: string;
  title: string;
  content: string;
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isNewNote, setIsNewNote] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [currentNoteId, setCurrentNoteId] = useState<string>('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  {/* Fonction pour récupérer les notes */ }
  const fetchNotes = useCallback(async () => { 
    try {
      const response = await fetch('http://localhost:8000/getNotes');
      if (response.ok) {
        const notesData = await response.json();
        setNotes(notesData.response);
        console.log('Notes récupérées:', notesData.response);
      } else {
        console.error('Erreur lors de la récupération des notes');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des notes:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  {/* Fonction pour générer le titre à partir du contenu */ }
  const generateTitle = (content: string) => {
    if (!content || content.trim() === '') {
      return 'Note vide';
    }

    const title = content.trim().replace(/\n/g, ' ').substring(0, 20);
    
    return content.length > 20 ? title + '...' : title;
  };

  {/* Fonction pour sélectionner une note existante */ }
  const selectNote = (note: Note) => {
    setCurrentNoteId(note.id);
    setNoteContent(note.content || '');
    setIsNewNote(false);
  };

  {/* Fonction pour créer une nouvelle note */}
  const createNewNote = () => {
    setCurrentNoteId('');
    setNoteContent('');
    setLastSaved(null);
    setIsNewNote(true);
  };

  {/* Fonction pour créer une nouvelle note */ }
  const createNote = useCallback(async (title: string, content: string) => {
    try {
      const response = await fetch('http://localhost:8000/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
          content: content,
        }),
      });
    
      if (response.ok) {
        const result = await response.json();
        console.log('Nouvelle note créée:', result);
        
        if (result.id) {
          setCurrentNoteId(result.id);
          setIsNewNote(false);
        }
        
        setLastSaved(new Date());
        fetchNotes();
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  }, [fetchNotes]);

  {/* Fonction pour modifier une note */ }
  const updateNote = useCallback(async (id: string, title: string, content: string) => {
    try {
      const response = await fetch(`http://localhost:8000/updateNote/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
          content: content,
        }),
      });
    
      if (response.ok) {
        setLastSaved(new Date());
        fetchNotes();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  }, [fetchNotes]);

 {/* Fonction principale de sauvegarde qui décide de la création ou de la modification d'une note */ }
  const saveNote = useCallback(async (id: string, title: string, content: string) => {
    if (!content.trim()) {
      return; 
    }

    if (isNewNote || !currentNoteId) {
      // Créer une nouvelle note
      await createNote(title, content);
    } else {
      // Mettre à jour une note existante
      await updateNote(id, title, content);
    }
  }, [isNewNote, currentNoteId, createNote, updateNote]);

  {/* Fonction pour supprimer une note */ }
  const deleteNote = useCallback(async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/delete/${id}`, {
        method: 'DELETE',
      });
    
      if (response.ok) {
        if (currentNoteId === id) {
          createNewNote();
        }
        
        fetchNotes(); 
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  }, [currentNoteId, fetchNotes]);


  {/* Récupérer les notes au chargement du composant */ }
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  {/* Fonction pour sauvegarder manuellement */ }
  const handleManualSave = useCallback(() => {
    if (noteContent.trim()) {
      saveNote(currentNoteId, generateTitle(noteContent), noteContent);
    }
  }, [currentNoteId, noteContent, saveNote]);

  {/* Gestion du CTRL + S */ }
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleManualSave]);

  return (
    <div className="font-sans">
      <main>
        {/* Barre latérale */}
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
                  <li className="text-black text-sm text-center p-4">Aucune note trouvée</li>
                ) : (
                  notes.map((note: Note) => (
                    <div key={note.id} className="flex grid grid-cols-2 p-2">
                      <li 
                        className={`flex text-sm cursor-pointer hover:underline ${
                          currentNoteId === note.id ? 'text-blue-800 font-bold' : 'text-black'
                        }`}
                        onClick={() => selectNote(note)}
                        title={note.title || ''}
                      >
                        {note.title}
                      </li>
                      <button 
                        type="button" 
                        className="m-auto flex hover:text-red-600"
                        onClick={() => deleteNote(note.id)}
                        title="Supprimer cette note"
                      >
                        <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                          <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/>
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </ul>
            )}
          </div>
        </aside>

        {/* Textarea */ }
        <div className="sm:ml-64 flex flex-col h-screen">
          <div className="flex-1">
            <textarea 
              id="note" 
              name="note" 
              rows={40} 
              cols={34} 
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="p-4 block w-full h-full text-sm text-white bg-gray-900 focus:outline-none resize-none" 
              placeholder="Écris ce que tu penses ici... (Ctrl+S pour sauvegarder manuellement)"
            />
          </div>
          
          {/* Indicateur de statut */}
          <div className="grid grid-cols-2 p-2 text-center bg-[#627C85] border border-gray-800">
            <span className="text-sm text-gray-600">
            Caractères: {noteContent.length}
            {lastSaved && (
              <span className="ml-4 text-gray-600">
                Dernière sauvegarde: {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </span>
            <span className="text-sm text-gray-600">
              {isNewNote ? 'Nouvelle note' : currentNoteId ? `Note: ${currentNoteId}` : 'Aucune note sélectionnée'}
            </span>
          </div>
        </div>
      </main>

      {/* Footer */ }
      <footer className="sm:ml-64">
        <div className="w-full mx-auto max-w-screen-xl p-4">
          <span className="flex justify-center text-sm text-gray-500 sm:text-center">© 2025. <a href="https://ocejpe.fr/" className="hover:underline">THOT™</a>. All Rights Reserved.</span>
        </div>
      </footer>
    </div>
  );
}