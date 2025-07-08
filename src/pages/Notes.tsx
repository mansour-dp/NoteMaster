import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { useNotes } from "../hooks/useNotes";

interface Note {
  title: string;
  content: string;
}

const Notes = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const { loadNotes, saveNote, deleteNote, updateNote } = useNotes();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const loadedNotes = await loadNotes();
        setNotes(loadedNotes);
      } catch (err) {
        setError("Erreur lors du chargement des notes");
      }
    };
    fetchNotes();
  }, [loadNotes]);

  const handleSaveNote = async () => {
    if (!newNoteTitle || !newNoteContent) {
      setError("Veuillez fournir un titre et un contenu pour votre note.");
      return;
    }

    try {
      await saveNote(newNoteTitle, newNoteContent);
      const updatedNotes = await loadNotes();
      setNotes(updatedNotes);
      setNewNoteTitle("");
      setNewNoteContent("");
      setSuccess("Note sauvegardée avec succès !");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Erreur lors de la sauvegarde de la note");
    }
  };

  const handleDeleteNote = async (title: string) => {
    try {
      await deleteNote(title);
      const updatedNotes = await loadNotes();
      setNotes(updatedNotes);
      if (editingNote?.title === title) {
        setEditingNote(null);
      }
      setSuccess("Note supprimée avec succès !");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Erreur lors de la suppression de la note");
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote) return;

    try {
      await updateNote(editingNote.title, editingNote.content);
      const updatedNotes = await loadNotes();
      setNotes(updatedNotes);
      setEditingNote(null);
      setSuccess("Note mise à jour avec succès !");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Erreur lors de la mise à jour de la note");
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography
        variant={isMobile ? "h5" : "h4"}
        gutterBottom
        sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}
      >
        Prise de Notes
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 3, sm: 4 } }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
        >
          Vos notes :
        </Typography>
        <List>
          {notes.map((note) => (
            <React.Fragment key={note.title}>
              <ListItem>
                <ListItemText
                  primary={note.title}
                  primaryTypographyProps={{
                    sx: { fontSize: { xs: "0.9rem", sm: "1rem" } },
                  }}
                  secondary={
                    editingNote?.title === note.title ? (
                      <TextField
                        fullWidth
                        multiline
                        rows={isMobile ? 3 : 4}
                        value={editingNote.content}
                        onChange={(e) =>
                          setEditingNote({
                            ...editingNote,
                            content: e.target.value,
                          })
                        }
                        sx={{ mt: 1 }}
                        size={isMobile ? "small" : "medium"}
                      />
                    ) : null
                  }
                />
                <ListItemSecondaryAction sx={{ right: { xs: 8, sm: 16 } }}>
                  {editingNote?.title === note.title ? (
                    <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 1 } }}>
                      <IconButton
                        edge="end"
                        aria-label="save"
                        onClick={handleUpdateNote}
                        color="primary"
                      >
                        <SaveIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="cancel"
                        onClick={() => setEditingNote(null)}
                      >
                        <CancelIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", gap: { xs: 0.5, sm: 1 } }}>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => setEditingNote(note)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteNote(note.title)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>

      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
        >
          Créer une nouvelle note
        </Typography>
        <TextField
          fullWidth
          label="Titre de la note"
          value={newNoteTitle}
          onChange={(e) => setNewNoteTitle(e.target.value)}
          sx={{ mb: 2 }}
          size={isMobile ? "small" : "medium"}
        />
        <TextField
          fullWidth
          multiline
          rows={isMobile ? 3 : 4}
          label="Contenu de la note"
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          sx={{ mb: 2 }}
          size={isMobile ? "small" : "medium"}
        />
        <Button
          variant="contained"
          onClick={handleSaveNote}
          disabled={!newNoteTitle || !newNoteContent}
          fullWidth={isMobile}
          size={isMobile ? "medium" : "large"}
        >
          Sauvegarder
        </Button>
      </Paper>
    </Box>
  );
};

export default Notes;
