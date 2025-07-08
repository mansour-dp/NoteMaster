// Service pour gérer le stockage local des données sur Vercel
export const localStorageService = {
  // Clés pour le localStorage
  QUIZ_HISTORY_KEY: 'notemaster_quiz_history',
  NOTES_KEY: 'notemaster_notes',

  // Gestion des quiz
  saveQuiz: (quizData) => {
    try {
      const existingHistory = localStorageService.getQuizHistory();
      const updatedHistory = [quizData, ...existingHistory];
      localStorage.setItem(localStorageService.QUIZ_HISTORY_KEY, JSON.stringify(updatedHistory));
      return quizData.id;
    } catch (error) {
      console.error('Erreur sauvegarde quiz localStorage:', error);
      return null;
    }
  },

  getQuizHistory: () => {
    try {
      const stored = localStorage.getItem(localStorageService.QUIZ_HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erreur lecture quiz localStorage:', error);
      return [];
    }
  },

  getQuizDetails: (quizId) => {
    try {
      const history = localStorageService.getQuizHistory();
      return history.find(quiz => quiz.id === quizId) || null;
    } catch (error) {
      console.error('Erreur lecture détails quiz localStorage:', error);
      return null;
    }
  },

  deleteQuiz: (quizId) => {
    try {
      const history = localStorageService.getQuizHistory();
      const filteredHistory = history.filter(quiz => quiz.id !== quizId);
      localStorage.setItem(localStorageService.QUIZ_HISTORY_KEY, JSON.stringify(filteredHistory));
      return true;
    } catch (error) {
      console.error('Erreur suppression quiz localStorage:', error);
      return false;
    }
  },

  // Gestion des notes (optionnel, pour permettre la création de notes personnalisées)
  saveNote: (noteData) => {
    try {
      const existingNotes = localStorageService.getNotes();
      const updatedNotes = [noteData, ...existingNotes.filter(n => n.title !== noteData.title)];
      localStorage.setItem(localStorageService.NOTES_KEY, JSON.stringify(updatedNotes));
      return true;
    } catch (error) {
      console.error('Erreur sauvegarde note localStorage:', error);
      return false;
    }
  },

  getNotes: () => {
    try {
      const stored = localStorage.getItem(localStorageService.NOTES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erreur lecture notes localStorage:', error);
      return [];
    }
  },

  deleteNote: (noteTitle) => {
    try {
      const notes = localStorageService.getNotes();
      const filteredNotes = notes.filter(note => note.title !== noteTitle);
      localStorage.setItem(localStorageService.NOTES_KEY, JSON.stringify(filteredNotes));
      return true;
    } catch (error) {
      console.error('Erreur suppression note localStorage:', error);
      return false;
    }
  },

  // Utilitaires
  clearAllData: () => {
    try {
      localStorage.removeItem(localStorageService.QUIZ_HISTORY_KEY);
      localStorage.removeItem(localStorageService.NOTES_KEY);
      return true;
    } catch (error) {
      console.error('Erreur nettoyage localStorage:', error);
      return false;
    }
  },

  exportData: () => {
    try {
      const quizHistory = localStorageService.getQuizHistory();
      const notes = localStorageService.getNotes();
      
      const exportData = {
        quizHistory,
        notes,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Erreur export données:', error);
      return null;
    }
  },

  importData: (jsonData) => {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.quizHistory && Array.isArray(data.quizHistory)) {
        localStorage.setItem(localStorageService.QUIZ_HISTORY_KEY, JSON.stringify(data.quizHistory));
      }
      
      if (data.notes && Array.isArray(data.notes)) {
        localStorage.setItem(localStorageService.NOTES_KEY, JSON.stringify(data.notes));
      }
      
      return true;
    } catch (error) {
      console.error('Erreur import données:', error);
      return false;
    }
  }
};

export default localStorageService;
