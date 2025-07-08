import { useCallback } from "react";
import axios from "axios";
import { localStorageService } from "../services/localStorage";

const API_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production" ? "/api" : "http://localhost:5000");

// Détecter si on est sur Vercel ou en production - forcer le localStorage
const useLocalStorage = process.env.NODE_ENV === "production" || (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app'));

interface Note {
  title: string;
  content: string;
}

export const useNotes = () => {
  const loadNotes = useCallback(async (): Promise<Note[]> => {
    try {
      if (useLocalStorage) {
        // Sur Vercel, utiliser localStorage avec des notes de démo si vide
        const notes = localStorageService.getNotes();
        if (notes.length === 0) {
          // Créer des notes de démo si aucune n'existe
          const demoNotes = [
            {
              title: "Linux",
              content: "Linux est un système d'exploitation open-source basé sur Unix. Il est largement utilisé dans les serveurs, les ordinateurs personnels et les appareils mobiles.\n\nCommandes de base :\n- ls : lister les fichiers\n- cd : changer de répertoire\n- pwd : afficher le répertoire courant\n- mkdir : créer un répertoire\n- rm : supprimer un fichier\n- sudo : exécuter en tant que superutilisateur\n\nGestion des paquets :\n- apt (Debian/Ubuntu) : apt install, apt update, apt upgrade\n- yum (Red Hat/CentOS) : yum install, yum update\n- pacman (Arch) : pacman -S, pacman -Syu\n\nFichiers de configuration importants :\n- /etc/hosts : configuration des noms d'hôtes\n- /etc/passwd : informations sur les utilisateurs\n- /etc/fstab : configuration des systèmes de fichiers"
            },
            {
              title: "JavaScript",
              content: "JavaScript est un langage de programmation interprété, principalement utilisé pour le développement web côté client et serveur.\n\nTypes de données :\n- Primitifs : number, string, boolean, null, undefined, symbol\n- Objets : object, array, function\n\nFonctions :\n- Déclaration : function nom() {}\n- Expression : const nom = function() {}\n- Flèche : const nom = () => {}\n\nPromises et async/await :\n- Promise : new Promise((resolve, reject) => {})\n- async/await : async function() { await promise; }\n\nManipulation DOM :\n- document.getElementById()\n- document.querySelector()\n- element.addEventListener()\n- element.innerHTML"
            }
          ];
          
          demoNotes.forEach(note => {
            localStorageService.saveNote(note);
          });
          
          return demoNotes;
        }
        return notes;
      } else {
        // En développement, utiliser l'API
        const response = await axios.get(`${API_URL}/notes`);
        return response.data;
      }
    } catch (error) {
      console.error("Error loading notes:", error);
      if (useLocalStorage) {
        // En cas d'erreur sur Vercel, retourner au moins les notes localStorage
        return localStorageService.getNotes();
      }
      throw error;
    }
  }, []);

  const saveNote = useCallback(
    async (title: string, content: string): Promise<void> => {
      try {
        if (useLocalStorage) {
          // Sur Vercel, utiliser localStorage
          const success = localStorageService.saveNote({ title, content });
          if (!success) {
            throw new Error("Erreur lors de la sauvegarde de la note");
          }
        } else {
          // En développement, utiliser l'API
          await axios.post(`${API_URL}/notes`, { title, content });
        }
      } catch (error) {
        console.error("Error saving note:", error);
        throw error;
      }
    },
    []
  );

  const deleteNote = useCallback(async (title: string): Promise<void> => {
    try {
      if (useLocalStorage) {
        // Sur Vercel, utiliser localStorage
        const success = localStorageService.deleteNote(title);
        if (!success) {
          throw new Error("Erreur lors de la suppression de la note");
        }
      } else {
        // En développement, utiliser l'API
        await axios.delete(`${API_URL}/notes/${encodeURIComponent(title)}`);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      throw error;
    }
  }, []);

  const updateNote = useCallback(
    async (title: string, content: string): Promise<void> => {
      try {
        if (useLocalStorage) {
          // Sur Vercel, utiliser localStorage (même fonction que saveNote)
          const success = localStorageService.saveNote({ title, content });
          if (!success) {
            throw new Error("Erreur lors de la mise à jour de la note");
          }
        } else {
          // En développement, utiliser l'API
          await axios.put(`${API_URL}/notes/${encodeURIComponent(title)}`, {
            content,
          });
        }
      } catch (error) {
        console.error("Error updating note:", error);
        throw error;
      }
    },
    []
  );

  return {
    loadNotes,
    saveNote,
    deleteNote,
    updateNote,
  };
};
