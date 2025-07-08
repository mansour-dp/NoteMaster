import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
  Divider,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Quiz as QuizIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useNotes } from "../hooks/useNotes";
import {
  aiService,
  QuizHistory,
  DetailedQuiz,
} from "../services/aiService";

interface Note {
  title: string;
  content: string;
}

interface PerformanceStats {
  totalNotes: number;
  totalQuizzes: number;
  averageScore: number;
  totalCorrectAnswers: number;
  totalQuestions: number;
}

const Performance = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const [notes, setNotes] = useState<Note[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<DetailedQuiz | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [stats, setStats] = useState<PerformanceStats>({
    totalNotes: 0,
    totalQuizzes: 0,
    averageScore: 0,
    totalCorrectAnswers: 0,
    totalQuestions: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const { loadNotes } = useNotes();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Charger les notes
        const loadedNotes = await loadNotes();
        setNotes(loadedNotes);

        // Charger l'historique des quiz
        const history = await aiService.getQuizHistory();
        setQuizHistory(history);

        // Calculer les statistiques
        const totalNotes = loadedNotes.length;
        const totalQuizzes = history.length;
        const totalCorrectAnswers = history.reduce(
          (sum, quiz) => sum + quiz.correctAnswers,
          0
        );
        const totalQuestions = history.reduce(
          (sum, quiz) => sum + quiz.questionsCount,
          0
        );
        const averageScore =
          totalQuestions > 0
            ? (history.reduce((sum, quiz) => sum + quiz.totalScore, 0) /
                totalQuestions) *
              5
            : 0;

        setStats({
          totalNotes,
          totalQuizzes,
          averageScore,
          totalCorrectAnswers,
          totalQuestions,
        });
      } catch (err) {
        setError("Erreur lors du chargement des données");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [loadNotes]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Charger les notes
      const loadedNotes = await loadNotes();
      setNotes(loadedNotes);

      // Charger l'historique des quiz
      const history = await aiService.getQuizHistory();
      setQuizHistory(history);

      // Calculer les statistiques
      const totalNotes = loadedNotes.length;
      const totalQuizzes = history.length;
      const totalCorrectAnswers = history.reduce(
        (sum, quiz) => sum + quiz.correctAnswers,
        0
      );
      const totalQuestions = history.reduce(
        (sum, quiz) => sum + quiz.questionsCount,
        0
      );
      const averageScore =
        totalQuestions > 0
          ? (history.reduce((sum, quiz) => sum + quiz.totalScore, 0) /
              totalQuestions) *
            5
          : 0;

      setStats({
        totalNotes,
        totalQuizzes,
        averageScore,
        totalCorrectAnswers,
        totalQuestions,
      });
    } catch (err) {
      setError("Erreur lors du chargement des données");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewQuizDetails = async (quizId: string) => {
    try {
      setLoading(true);
      const quiz = await aiService.getQuizDetails(quizId);
      setSelectedQuiz(quiz);
      setOpenDialog(true);
    } catch (err) {
      setError("Erreur lors du chargement des détails du quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleRetakeQuiz = (noteTitle: string) => {
    navigate("/quiz", { state: { selectedNote: noteTitle } });
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      await aiService.deleteQuiz(quizId);
      await fetchData(); // Recharger les données
    } catch (err) {
      setError("Erreur lors de la suppression du quiz");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "success";
    if (percentage >= 60) return "warning";
    return "error";
  };

  if (loading && quizHistory.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: { xs: 2, sm: 3 },
          gap: { xs: 1, sm: 0 },
        }}
      >
        <Typography
          variant={isMobile ? "h5" : "h4"}
          gutterBottom={!isMobile}
          sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}
        >
          📊 Mes Performances
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchData}
          disabled={loading}
          size={isMobile ? "small" : "medium"}
          sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
        >
          Actualiser
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Statistiques Globales */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                gutterBottom
                color="primary"
                sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
              >
                📚 Notes Créées
              </Typography>
              <Typography
                variant={isMobile ? "h4" : "h3"}
                color="text.primary"
                sx={{ fontSize: { xs: "1.75rem", sm: "3rem" } }}
              >
                {stats.totalNotes}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
              >
                Notes disponibles
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                gutterBottom
                color="secondary"
                sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
              >
                🎯 Quiz Effectués
              </Typography>
              <Typography
                variant={isMobile ? "h4" : "h3"}
                color="text.primary"
                sx={{ fontSize: { xs: "1.75rem", sm: "3rem" } }}
              >
                {stats.totalQuizzes}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
              >
                Sessions de quiz
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                gutterBottom
                color="success.main"
                sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
              >
                ✅ Réponses Correctes
              </Typography>
              <Typography
                variant={isMobile ? "h4" : "h3"}
                color="text.primary"
                sx={{ fontSize: { xs: "1.75rem", sm: "3rem" } }}
              >
                {stats.totalCorrectAnswers}/{stats.totalQuestions}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
              >
                Taux de réussite:{" "}
                {stats.totalQuestions > 0
                  ? (
                      (stats.totalCorrectAnswers / stats.totalQuestions) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant={isMobile ? "subtitle1" : "h6"}
                gutterBottom
                color="info.main"
                sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
              >
                📈 Score Moyen
              </Typography>
              <Typography
                variant={isMobile ? "h4" : "h3"}
                color="text.primary"
                sx={{ fontSize: { xs: "1.75rem", sm: "3rem" } }}
              >
                {stats.averageScore.toFixed(1)}/5
              </Typography>
              <Box sx={{ mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={(stats.averageScore / 5) * 100}
                  sx={{
                    height: { xs: 6, sm: 8 },
                    borderRadius: 4,
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="secondary">
                Questions potentielles
              </Typography>
              <Typography variant="h3" color="text.primary">
                {stats.totalQuestions}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Questions générables (≈5 par note)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="success.main">
                Score moyen estimé
              </Typography>
              <Typography variant="h3" color="text.primary">
                {stats.averageScore}/5
              </Typography>
              <Box sx={{ mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={(stats.averageScore / 5) * 100}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Mes Notes
        </Typography>
        {notes.length > 0 ? (
          <Grid container spacing={2}>
            {notes.map((note, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      {note.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {note.content.substring(0, 100)}
                      {note.content.length > 100 ? "..." : ""}
                    </Typography>
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{ mt: 1 }}
                    >
                      ≈ 5 questions générables
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="text.secondary" align="center">
            Aucune note disponible. Créez des notes pour commencer !
          </Typography>
        )}
      </Paper>

      {/* Historique des Quiz */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          🎯 Historique des Quiz
        </Typography>

        {quizHistory.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <QuizIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Aucun quiz effectué
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Commencez par créer des notes et générer votre premier quiz !
            </Typography>
            <Button
              variant="contained"
              startIcon={<QuizIcon />}
              onClick={() => navigate("/quiz")}
            >
              Commencer un Quiz
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {quizHistory.map((quiz, index) => (
              <Grid item xs={12} key={quiz.id}>
                <Card
                  sx={{
                    border:
                      theme.palette.mode === "dark"
                        ? `1px solid ${theme.palette.grey[700]}`
                        : `1px solid ${theme.palette.grey[300]}`,
                    "&:hover": {
                      boxShadow: theme.palette.mode === "dark" ? 4 : 2,
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          📝 {quiz.noteTitle}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          📅 {formatDate(quiz.date)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", gap: 1, alignItems: "center" }}
                      >
                        <Chip
                          label={`${quiz.correctAnswers}/${quiz.questionsCount}`}
                          color={getScoreColor(
                            quiz.correctAnswers,
                            quiz.questionsCount
                          )}
                          size="small"
                        />
                        <Chip
                          label={`${quiz.averageScore.toFixed(1)}/5`}
                          color={getScoreColor(quiz.averageScore, 5)}
                          size="small"
                        />
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Progression:
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={
                          (quiz.correctAnswers / quiz.questionsCount) * 100
                        }
                        sx={{ height: 6, borderRadius: 3, mb: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {(
                          (quiz.correctAnswers / quiz.questionsCount) *
                          100
                        ).toFixed(1)}
                        % de réussite
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleViewQuizDetails(quiz.id)}
                      >
                        Voir Détails
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<RefreshIcon />}
                        onClick={() => handleRetakeQuiz(quiz.noteTitle)}
                      >
                        Refaire Quiz
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteQuiz(quiz.id)}
                      >
                        Supprimer
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Dialog pour les détails du quiz */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor:
              theme.palette.mode === "dark" ? "grey.900" : "background.paper",
          },
        }}
      >
        <DialogTitle>📊 Détails du Quiz: {selectedQuiz?.noteTitle}</DialogTitle>
        <DialogContent>
          {selectedQuiz && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Date:
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedQuiz.date)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Score Total:
                    </Typography>
                    <Typography variant="body1">
                      {selectedQuiz.totalScore}/
                      {selectedQuiz.questionsCount * 5} (
                      {selectedQuiz.averageScore.toFixed(1)}/5)
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Questions et Réponses:
              </Typography>

              {selectedQuiz.results.map((result, index) => (
                <Accordion key={index} sx={{ mb: 1 }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                      bgcolor: result.isCorrect
                        ? theme.palette.mode === "dark"
                          ? "success.dark"
                          : "success.light"
                        : theme.palette.mode === "dark"
                        ? "error.dark"
                        : "error.light",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                        mr: 2,
                      }}
                    >
                      <Typography variant="subtitle1">
                        Question {index + 1}
                      </Typography>
                      <Chip
                        label={`${result.score}/5`}
                        color={result.isCorrect ? "success" : "error"}
                        size="small"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        📝 Question:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          mb: 2,
                          p: 1,
                          bgcolor: "action.hover",
                          borderRadius: 1,
                        }}
                      >
                        {result.question}
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" gutterBottom>
                            🙋 Votre réponse:
                          </Typography>
                          <Paper
                            sx={{
                              p: 2,
                              bgcolor:
                                theme.palette.mode === "dark"
                                  ? "grey.800"
                                  : "grey.100",
                              border: `2px solid ${
                                result.isCorrect
                                  ? theme.palette.success.main
                                  : theme.palette.warning.main
                              }`,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ color: theme.palette.text.primary }}
                            >
                              {result.userAnswer}
                            </Typography>
                          </Paper>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle2" gutterBottom>
                            ✅ Réponse attendue:
                          </Typography>
                          <Paper
                            sx={{
                              p: 2,
                              bgcolor:
                                theme.palette.mode === "dark"
                                  ? "grey.800"
                                  : "grey.100",
                              border: `2px solid ${theme.palette.info.main}`,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ color: theme.palette.text.primary }}
                            >
                              {result.correctAnswer}
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Fermer</Button>
          {selectedQuiz && (
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => {
                setOpenDialog(false);
                handleRetakeQuiz(selectedQuiz.noteTitle);
              }}
            >
              Refaire ce Quiz
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Performance;
