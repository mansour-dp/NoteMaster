import axios from "axios";
import { localStorageService } from "./localStorage";

const API_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production" ? "/api" : "http://localhost:5000");

// Détecter si on est sur Vercel ou en production - forcer le localStorage
const useLocalStorage = process.env.NODE_ENV === "production" || window.location.hostname.includes('vercel.app');

export interface Question {
  text: string;
  reponse: string;
}

export interface QuizResult {
  questionIndex: number;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  score: number;
  isCorrect: boolean;
}

export interface QuizHistory {
  id: string;
  noteTitle: string;
  date: string;
  timestamp: number;
  totalScore: number;
  averageScore: number;
  questionsCount: number;
  correctAnswers: number;
}

export interface DetailedQuiz extends QuizHistory {
  questions: Question[];
  userAnswers: string[];
  results: QuizResult[];
}

export const aiService = {
  async generateQuestions(
    noteTitle: string,
    noteContent: string
  ): Promise<Question[]> {
    try {
      const response = await axios.post(`${API_URL}/generate-questions`, {
        title: noteTitle,
        content: noteContent,
      });
      return response.data;
    } catch (error) {
      console.error("Error generating questions:", error);
      throw error;
    }
  },

  async evaluateAnswer(
    question: string,
    userAnswer: string,
    correctAnswer: string
  ): Promise<number> {
    try {
      const response = await axios.post(`${API_URL}/evaluate-answer`, {
        question,
        user_answer: userAnswer,
        correct_answer: correctAnswer,
      });
      return response.data.score;
    } catch (error) {
      console.error("Error evaluating answer:", error);
      throw error;
    }
  },

  async saveQuiz(
    noteTitle: string,
    questions: Question[],
    userAnswers: string[],
    results: QuizResult[]
  ): Promise<string> {
    try {
      const totalScore = results.reduce((sum, result) => sum + result.score, 0);
      const averageScore = totalScore / results.length;
      const correctAnswers = results.filter(r => r.isCorrect).length;

      const quizData = {
        id: `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        noteTitle,
        date: new Date().toLocaleDateString('fr-FR'),
        timestamp: Date.now(),
        totalScore,
        averageScore,
        questionsCount: questions.length,
        correctAnswers,
        questions,
        userAnswers,
        results
      };

      if (useLocalStorage) {
        // Sur Vercel, utiliser localStorage
        const quizId = localStorageService.saveQuiz(quizData);
        if (quizId) {
          return quizId;
        } else {
          throw new Error("Erreur sauvegarde locale");
        }
      } else {
        // En développement, utiliser l'API
        const response = await axios.post(`${API_URL}/save-quiz`, {
          noteTitle,
          questions,
          userAnswers,
          results,
          totalScore,
          averageScore,
        });
        return response.data.quizId;
      }
    } catch (error) {
      console.error("Error saving quiz:", error);
      throw error;
    }
  },

  async getQuizHistory(): Promise<QuizHistory[]> {
    try {
      if (useLocalStorage) {
        // Sur Vercel, utiliser localStorage
        const history = localStorageService.getQuizHistory();
        return history.map(quiz => ({
          id: quiz.id,
          noteTitle: quiz.noteTitle,
          date: quiz.date,
          timestamp: quiz.timestamp,
          totalScore: quiz.totalScore,
          averageScore: quiz.averageScore,
          questionsCount: quiz.questionsCount,
          correctAnswers: quiz.correctAnswers,
        }));
      } else {
        // En développement, utiliser l'API
        const response = await axios.get(`${API_URL}/quiz-history`);
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching quiz history:", error);
      if (useLocalStorage) {
        // En cas d'erreur sur Vercel, retourner les données localStorage
        return localStorageService.getQuizHistory().map(quiz => ({
          id: quiz.id,
          noteTitle: quiz.noteTitle,
          date: quiz.date,
          timestamp: quiz.timestamp,
          totalScore: quiz.totalScore,
          averageScore: quiz.averageScore,
          questionsCount: quiz.questionsCount,
          correctAnswers: quiz.correctAnswers,
        }));
      }
      throw error;
    }
  },

  async getQuizDetails(quizId: string): Promise<DetailedQuiz> {
    try {
      if (useLocalStorage) {
        // Sur Vercel, utiliser localStorage
        const quiz = localStorageService.getQuizDetails(quizId);
        if (quiz) {
          return quiz;
        } else {
          throw new Error("Quiz non trouvé");
        }
      } else {
        // En développement, utiliser l'API
        const response = await axios.get(`${API_URL}/quiz-history/${quizId}`);
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching quiz details:", error);
      throw error;
    }
  },

  async deleteQuiz(quizId: string): Promise<void> {
    try {
      if (useLocalStorage) {
        // Sur Vercel, utiliser localStorage
        const success = localStorageService.deleteQuiz(quizId);
        if (!success) {
          throw new Error("Erreur lors de la suppression");
        }
      } else {
        // En développement, utiliser l'API
        await axios.delete(`${API_URL}/quiz-history/${quizId}`);
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
      throw error;
    }
  },
};
