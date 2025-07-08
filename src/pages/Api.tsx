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

  const inlineCodeStyle = {
    bgcolor: theme.palette.mode === "dark" ? "grey.800" : "grey.100",
    color: theme.palette.mode === "dark" ? "grey.100" : "grey.900",
    p: 1,
    borderRadius: 0.5,
    fontSize: "0.75rem",
    display: "block",
    whiteSpace: "pre",
    border: theme.palette.mode === "dark" ? "1px solid #555" : "1px solid #ddd",
    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
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
                <TableCell>Endpoint</TableCell>
                <TableCell>Méthode</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Paramètres</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>/notes</TableCell>
                <TableCell
                  sx={{
                    color:
                      theme.palette.mode === "dark"
                        ? "success.light"
                        : "success.main",
                    fontWeight: "bold",
                  }}
                >
                  GET
                </TableCell>
                <TableCell>Récupérer toutes les notes</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>/notes</TableCell>
                <TableCell
                  sx={{
                    color:
                      theme.palette.mode === "dark"
                        ? "info.light"
                        : "info.main",
                    fontWeight: "bold",
                  }}
                >
                  POST
                </TableCell>
                <TableCell>Créer une nouvelle note</TableCell>
                <TableCell>
                  <Box component="code" sx={inlineCodeStyle}>
                    {`{
  "title": "string",
  "content": "string"
}`}
                  </Box>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>/notes/:title</TableCell>
                <TableCell
                  sx={{
                    color:
                      theme.palette.mode === "dark"
                        ? "warning.light"
                        : "warning.main",
                    fontWeight: "bold",
                  }}
                >
                  PUT
                </TableCell>
                <TableCell>Mettre à jour une note</TableCell>
                <TableCell>
                  <Box component="code" sx={inlineCodeStyle}>
                    {`{
  "content": "string"
}`}
                  </Box>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>/notes/:title</TableCell>
                <TableCell
                  sx={{
                    color:
                      theme.palette.mode === "dark"
                        ? "error.light"
                        : "error.main",
                    fontWeight: "bold",
                  }}
                >
                  DELETE
                </TableCell>
                <TableCell>Supprimer une note</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>/generate-questions</TableCell>
                <TableCell
                  sx={{
                    color:
                      theme.palette.mode === "dark"
                        ? "info.light"
                        : "info.main",
                    fontWeight: "bold",
                  }}
                >
                  POST
                </TableCell>
                <TableCell>Générer des questions pour une note</TableCell>
                <TableCell>
                  <Box component="code" sx={inlineCodeStyle}>
                    {`{
  "title": "string",
  "content": "string"
}`}
                  </Box>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>/evaluate-answer</TableCell>
                <TableCell
                  sx={{
                    color:
                      theme.palette.mode === "dark"
                        ? "info.light"
                        : "info.main",
                    fontWeight: "bold",
                  }}
                >
                  POST
                </TableCell>
                <TableCell>Évaluer une réponse</TableCell>
                <TableCell>
                  <Box component="code" sx={inlineCodeStyle}>
                    {`{
  "question": "string",
  "user_answer": "string",
  "correct_answer": "string"
}`}
                  </Box>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>/stats</TableCell>
                <TableCell
                  sx={{
                    color:
                      theme.palette.mode === "dark"
                        ? "success.light"
                        : "success.main",
                    fontWeight: "bold",
                  }}
                >
                  GET
                </TableCell>
                <TableCell>Récupérer les statistiques</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Exemples d'utilisation
        </Typography>

        <Typography variant="subtitle1" gutterBottom>
          Créer une note :
        </Typography>
        <Box
          component="pre"
          sx={{
            ...codeBlockStyle,
            mb: 3,
          }}
        >
          {`fetch('http://localhost:5000/notes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Ma note',
    content: 'Contenu de ma note'
  })
})`}
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          Générer des questions :
        </Typography>
        <Box component="pre" sx={codeBlockStyle}>
          {`fetch('http://localhost:5000/generate-questions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'Ma note',
    content: 'Contenu de ma note'
  })
})`}
        </Box>
      </Paper>
    </Box>
  );
};

export default ApiDocs;
