import React from "react";
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  NoteAdd as NoteAddIcon,
  Quiz as QuizIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

const Docs = () => {
  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {" "}
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}
      >
        Documentation
      </Typography>
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 3, sm: 4 } }}>
        {" "}
        <Typography
          variant="h6"
          gutterBottom
          sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
        >
          À propos de NoteMaster
        </Typography>
        <Typography
          variant="body1"
          paragraph
          sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
        >
          NoteMaster est une application d'apprentissage actif qui vous aide à
          mieux retenir vos cours en générant automatiquement des questions
          pertinentes à partir de vos notes.
        </Typography>
      </Paper>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography
            variant="h6"
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            Prise en main rapide
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: { xs: 2, sm: 3 } }}>
          <List dense>
            <ListItem sx={{ py: { xs: 0.5, sm: 1 } }}>
              <ListItemIcon sx={{ minWidth: { xs: 35, sm: 56 } }}>
                <NoteAddIcon />
              </ListItemIcon>
              <ListItemText
                primary="1. Créez une note"
                secondary="Commencez par créer une note dans la section 'Prise de Notes'. Donnez-lui un titre explicite et ajoutez votre contenu."
                primaryTypographyProps={{
                  sx: { fontSize: { xs: "0.9rem", sm: "1rem" } },
                }}
                secondaryTypographyProps={{
                  sx: { fontSize: { xs: "0.8rem", sm: "0.875rem" } },
                }}
              />
            </ListItem>
            <ListItem sx={{ py: { xs: 0.5, sm: 1 } }}>
              <ListItemIcon sx={{ minWidth: { xs: 35, sm: 56 } }}>
                <QuizIcon />
              </ListItemIcon>
              <ListItemText
                primary="2. Générez des questions"
                secondary="Allez dans la section 'Mode Quiz', sélectionnez votre note et cliquez sur 'Générer des questions'."
                primaryTypographyProps={{
                  sx: { fontSize: { xs: "0.9rem", sm: "1rem" } },
                }}
                secondaryTypographyProps={{
                  sx: { fontSize: { xs: "0.8rem", sm: "0.875rem" } },
                }}
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <AssessmentIcon />
              </ListItemIcon>
              <ListItemText
                primary="3. Suivez vos progrès"
                secondary="Consultez vos performances dans la section 'Performances' pour voir votre progression."
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Fonctionnalités détaillées</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="subtitle1" gutterBottom>
            Prise de Notes
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Création de notes"
                secondary="Donnez un titre unique à chaque note. Le contenu peut inclure du texte formaté."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Modification"
                secondary="Vous pouvez modifier vos notes à tout moment en cliquant sur 'Voir/Modifier'."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Suppression"
                secondary="La suppression d'une note effacera également les questions associées."
              />
            </ListItem>
          </List>

          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Mode Quiz
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Génération de questions"
                secondary="Les questions sont générées automatiquement en utilisant l'API DeepSeek."
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Évaluation des réponses"
                secondary="Vos réponses sont évaluées sur une échelle de 0 à 5 en fonction de leur pertinence."
              />
            </ListItem>
          </List>

          <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
            Performances
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Statistiques"
                secondary="Visualisez vos scores moyens, meilleurs scores et progression par sujet."
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Configuration avancée</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            <ListItem>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Configuration de l'API"
                secondary="Pour utiliser l'application, vous devez configurer votre clé API DeepSeek dans le fichier .env"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText
                primary="Stockage des données"
                secondary="Les notes sont stockées localement dans des fichiers texte, et les questions dans des fichiers JSON."
              />
            </ListItem>
          </List>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default Docs;
