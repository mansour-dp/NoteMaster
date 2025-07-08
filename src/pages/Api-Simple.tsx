import React from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  useTheme,
} from "@mui/material";

const ApiDocs = () => {
  const theme = useTheme();

  // Styles communs pour les blocs de code
  const codeBlockStyle = {
    bgcolor: theme.palette.mode === "dark" ? "grey.800" : "grey.100",
    color: theme.palette.mode === "dark" ? "grey.100" : "grey.900",
    p: 2,
    borderRadius: 1,
    overflow: "auto",
    border: theme.palette.mode === "dark" ? "1px solid #555" : "1px solid #ddd",
    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
    fontSize: "0.875rem",
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}
      >
        Documentation de l'API
      </Typography>

      <Alert severity="info" sx={{ mb: { xs: 2, sm: 3 } }}>
        <Typography sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
          L'API NoteMaster utilise l'API Groq (gratuit) ou DeepSeek pour la
          génération de questions et l'évaluation des réponses.
        </Typography>
      </Alert>

      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 3, sm: 4 } }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
        >
          Configuration de l'API
        </Typography>
        <Typography
          variant="body1"
          paragraph
          sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
        >
          Pour utiliser l'API, vous devez configurer votre clé API dans le
          fichier server/.env :
        </Typography>
        <Box
          component="pre"
          sx={{
            ...codeBlockStyle,
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
            p: { xs: 1.5, sm: 2 },
          }}
        >
          {`# Groq (GRATUIT)
GROQ_API_KEY=votre_clé_groq
AI_PROVIDER=groq

# Ou DeepSeek (payant)
DEEPSEEK_API_KEY=votre_clé_deepseek
AI_PROVIDER=deepseek`}
        </Box>
      </Paper>

      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
        >
          Points d'accès disponibles
        </Typography>

        <TableContainer
          sx={{
            bgcolor:
              theme.palette.mode === "dark" ? "grey.900" : "background.paper",
            border:
              theme.palette.mode === "dark"
                ? `1px solid ${theme.palette.grey[700]}`
                : `1px solid ${theme.palette.grey[300]}`,
            borderRadius: 1,
            overflowX: "auto",
            "& .MuiTableCell-root": {
              borderColor:
                theme.palette.mode === "dark" ? "grey.700" : "divider",
              color: theme.palette.text.primary,
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              p: { xs: 1, sm: 2 },
            },
            "& .MuiTableHead-root .MuiTableCell-root": {
              bgcolor: theme.palette.mode === "dark" ? "grey.800" : "grey.50",
              fontWeight: "bold",
              color: theme.palette.mode === "dark" ? "grey.100" : "grey.900",
              fontSize: { xs: "0.8rem", sm: "0.875rem" },
            },
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Méthode</TableCell>
                <TableCell>Endpoint</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>POST</TableCell>
                <TableCell>/api/notes</TableCell>
                <TableCell>Créer une nouvelle note</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>GET</TableCell>
                <TableCell>/api/notes</TableCell>
                <TableCell>Récupérer toutes les notes</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>POST</TableCell>
                <TableCell>/api/questions/generate</TableCell>
                <TableCell>Générer des questions à partir d'une note</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>POST</TableCell>
                <TableCell>/api/quiz/evaluate</TableCell>
                <TableCell>Évaluer les réponses d'un quiz</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>GET</TableCell>
                <TableCell>/api/quiz/history</TableCell>
                <TableCell>Récupérer l'historique des quiz</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ApiDocs;
