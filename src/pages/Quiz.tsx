import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Grid,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { useNotes } from "../hooks/useNotes";
import { aiService, Question } from "../services/aiService";

interface Note {
  title: string;
  content: string;
}

interface QuizResult {
  questionIndex: number;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  score: number;
  isCorrect: boolean;
}

const Quiz = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<string>("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const { loadNotes } = useNotes();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const loadedNotes = await loadNotes();
        setNotes(loadedNotes);

        // Vérifier si une note est présélectionnée via la navigation
        const state = location.state as { selectedNote?: string } | null;
        if (state?.selectedNote) {
          setSelectedNote(state.selectedNote);
        }
      } catch (err) {
        setError("Erreur lors du chargement des notes");
      }
    };
    fetchNotes();
  }, [loadNotes, location.state]);

  const handleGenerateQuestions = async () => {
    if (!selectedNote) return;

    const note = notes.find((n) => n.title === selectedNote);
    if (!note) return;

    setLoading(true);
    setError("");
    setIsSubmitted(false);
    setQuizResults([]);

    try {
      const generatedQuestions = await aiService.generateQuestions(
        note.title,
        note.content
      );
      setQuestions(generatedQuestions);
      setUserAnswers(new Array(generatedQuestions.length).fill(""));
      setSuccess(
        "Questions générées avec succès ! Répondez à toutes les questions puis cliquez sur 'Soumettre le quiz'."
      );
    } catch (err) {
      setError("Erreur lors de la génération des questions");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[questionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const handleSubmitQuiz = async () => {
    if (userAnswers.some((answer) => !answer.trim())) {
      setError("Veuillez répondre à toutes les questions avant de soumettre.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const results: QuizResult[] = [];

      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const userAnswer = userAnswers[i];

        try {
          const score = await aiService.evaluateAnswer(
            question.text,
            userAnswer,
            question.reponse
          );

          results.push({
            questionIndex: i,
            question: question.text,
            userAnswer: userAnswer,
            correctAnswer: question.reponse,
            score: score,
            isCorrect: score >= 4, // Considéré correct si score >= 4
          });
        } catch (evalError) {
          // En cas d'erreur d'évaluation, donner un score basique
          const basicScore = userAnswer.length > 10 ? 3 : 2;
          results.push({
            questionIndex: i,
            question: question.text,
            userAnswer: userAnswer,
            correctAnswer: question.reponse,
            score: basicScore,
            isCorrect: basicScore >= 4,
          });
        }
      }

      setQuizResults(results);
      setIsSubmitted(true);

      const totalScore = results.reduce((sum, result) => sum + result.score, 0);
      const averageScore = (totalScore / (results.length * 5)) * 100;
      const correctAnswers = results.filter((r) => r.isCorrect).length;

      // Sauvegarder automatiquement le quiz dans l'historique
      try {
        await aiService.saveQuiz(
          selectedNote,
          questions,
          userAnswers,
          results
        );
        console.log("Quiz sauvegardé dans l'historique avec succès");
      } catch (saveError) {
        console.warn("Erreur lors de la sauvegarde du quiz:", saveError);
        // On continue même si la sauvegarde échoue
      }

      setSuccess(
        `Quiz terminé ! Score: ${totalScore}/${
          results.length * 5
        } (${averageScore.toFixed(1)}%) - ${correctAnswers}/${
          results.length
        } réponses correctes. Le quiz a été sauvegardé dans vos performances.`
      );
    } catch (err) {
      setError("Erreur lors de l'évaluation du quiz");
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setQuestions([]);
    setUserAnswers([]);
    setQuizResults([]);
    setIsSubmitted(false);
    setSuccess("");
    setError("");
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography
        variant={isMobile ? "h5" : "h4"}
        gutterBottom
        sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}
      >
        Mode Quiz
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
        <FormControl fullWidth sx={{ mb: { xs: 2, sm: 3 } }}>
          <InputLabel>Choisissez une note</InputLabel>
          <Select
            value={selectedNote}
            onChange={(e) => setSelectedNote(e.target.value)}
            label="Choisissez une note"
            size={isMobile ? "small" : "medium"}
          >
            {notes.map((note) => (
              <MenuItem key={note.title} value={note.title}>
                <Typography sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                  {note.title}
                </Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={handleGenerateQuestions}
          disabled={!selectedNote || loading}
          fullWidth
          size={isMobile ? "medium" : "large"}
          sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
        >
          Générer des questions
        </Button>
      </Paper>

      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {questions.length > 0 && !loading && !isSubmitted && (
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
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
              variant={isMobile ? "h6" : "h5"}
              sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
            >
              Quiz: {selectedNote}
            </Typography>
            <Chip
              label={`${questions.length} questions`}
              color="primary"
              size={isMobile ? "small" : "medium"}
            />
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: { xs: 2, sm: 3 },
              fontSize: { xs: "0.8rem", sm: "0.875rem" },
            }}
          >
            Répondez à toutes les questions ci-dessous, puis cliquez sur
            "Soumettre le quiz" pour obtenir votre correction.
          </Typography>

          {questions.map((question, index) => (
            <Card
              key={index}
              sx={{
                mb: { xs: 2, sm: 3 },
                border:
                  theme.palette.mode === "dark"
                    ? `1px solid ${theme.palette.grey[700]}`
                    : `1px solid ${theme.palette.grey[300]}`,
                bgcolor:
                  theme.palette.mode === "dark"
                    ? "grey.900"
                    : "background.paper",
                "& .MuiCardContent-root": {
                  bgcolor: "transparent",
                  p: { xs: 2, sm: 3 },
                },
              }}
            >
              <CardContent>
                <Typography
                  variant={isMobile ? "subtitle1" : "h6"}
                  gutterBottom
                  color="primary"
                  sx={{
                    color:
                      theme.palette.mode === "dark"
                        ? theme.palette.primary.light
                        : theme.palette.primary.main,
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                  }}
                >
                  Question {index + 1}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 2,
                    fontWeight: 500,
                    color: theme.palette.text.primary,
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                  }}
                >
                  {question.text}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={isMobile ? 3 : 4}
                  label="Votre réponse"
                  value={userAnswers[index] || ""}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  variant="outlined"
                  placeholder="Tapez votre réponse ici..."
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor:
                        theme.palette.mode === "dark"
                          ? "grey.800"
                          : "background.paper",
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      "& fieldset": {
                        borderColor:
                          theme.palette.mode === "dark"
                            ? theme.palette.grey[600]
                            : theme.palette.grey[300],
                      },
                      "&:hover fieldset": {
                        borderColor:
                          theme.palette.mode === "dark"
                            ? theme.palette.grey[500]
                            : theme.palette.grey[400],
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: theme.palette.primary.main,
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: theme.palette.text.secondary,
                    },
                    "& .MuiOutlinedInput-input": {
                      color: theme.palette.text.primary,
                    },
                  }}
                />
              </CardContent>
            </Card>
          ))}

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: { xs: 1, sm: 2 },
              mt: { xs: 2, sm: 3 },
            }}
          >
            <Button
              variant="contained"
              size={isMobile ? "medium" : "large"}
              onClick={handleSubmitQuiz}
              disabled={
                userAnswers.some((answer) => !answer?.trim()) || loading
              }
              sx={{
                flex: 1,
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              Soumettre le quiz
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={resetQuiz}
              disabled={loading}
            >
              Recommencer
            </Button>
          </Box>
        </Paper>
      )}

      {isSubmitted && quizResults.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom color="primary">
            🎯 Résultats et Corrections
          </Typography>

          <Box sx={{ mb: 3 }}>
            {quizResults.map((result, index) => (
              <Card
                key={index}
                sx={{
                  mb: 3,
                  border: result.isCorrect
                    ? `2px solid ${theme.palette.success.main}`
                    : `2px solid ${theme.palette.error.main}`,
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? "grey.900"
                      : "background.paper",
                  "& .MuiCardContent-root": {
                    bgcolor: "transparent",
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
                    <Typography variant="h6" sx={{ flex: 1 }}>
                      Question {index + 1}
                    </Typography>
                    <Chip
                      label={`${result.score}/5`}
                      color={result.isCorrect ? "success" : "error"}
                      size="small"
                    />
                  </Box>

                  <Typography
                    variant="body1"
                    sx={{
                      mb: 2,
                      fontWeight: 500,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {result.question}
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        🙋 Votre réponse:
                      </Typography>
                      <Paper
                        sx={{
                          p: 2,
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "grey.800"
                              : "grey.100",
                          border: `1px solid ${
                            theme.palette.mode === "dark"
                              ? theme.palette.grey[600]
                              : theme.palette.grey[300]
                          }`,
                          borderLeft: `4px solid ${
                            result.isCorrect
                              ? theme.palette.success.main
                              : theme.palette.warning.main
                          }`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.primary,
                            fontWeight: 500,
                          }}
                        >
                          {result.userAnswer}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        ✅ Réponse attendue:
                      </Typography>
                      <Paper
                        sx={{
                          p: 2,
                          bgcolor:
                            theme.palette.mode === "dark"
                              ? "grey.800"
                              : "grey.100",
                          border: `1px solid ${
                            theme.palette.mode === "dark"
                              ? theme.palette.grey[600]
                              : theme.palette.grey[300]
                          }`,
                          borderLeft: `4px solid ${theme.palette.info.main}`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.primary,
                            fontWeight: 500,
                          }}
                        >
                          {result.correctAnswer}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {!result.isCorrect && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      💡 <strong>Conseil:</strong> Comparez votre réponse avec
                      la réponse attendue pour identifier les points à
                      améliorer.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="contained" onClick={resetQuiz} size="large">
              Nouveau Quiz
            </Button>
            <Button
              variant="outlined"
              onClick={() => setSelectedNote("")}
              size="large"
            >
              Changer de note
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default Quiz;
