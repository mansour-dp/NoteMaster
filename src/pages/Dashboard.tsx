import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  useTheme,
  CardActionArea,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  NoteAdd as NoteAddIcon,
  Quiz as QuizIcon,
  Assessment as AssessmentIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";

const features = [
  {
    icon: <NoteAddIcon sx={{ fontSize: 40 }} />,
    title: "Prendre des notes",
    description:
      "Organisez vos notes efficacement avec notre éditeur intuitif. Créez, modifiez et structurez vos contenus facilement.",
    gradient: "linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)",
    path: "/notes",
  },
  {
    icon: <QuizIcon sx={{ fontSize: 40 }} />,
    title: "Générer des questions",
    description:
      "Testez vos connaissances avec des quiz générés automatiquement à partir de vos notes grâce à l'IA.",
    gradient: "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)",
    path: "/quiz",
  },
  {
    icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
    title: "Suivre vos progrès",
    description:
      "Visualisez votre progression et identifiez vos points forts et axes d'amélioration grâce aux statistiques détaillées.",
    gradient: "linear-gradient(135deg, #7F7FD5 0%, #86A8E7 50%, #91EAE4 100%)",
    path: "/performances",
  },
];

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: "100vw", overflow: "hidden" }}>
      <Box
        sx={{
          textAlign: "center",
          mb: { xs: 4, md: 6 },
          mt: { xs: 1, md: 2 },
          px: { xs: 1, sm: 0 },
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: 700,
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(45deg, #64B5F6 30%, #42A5F5 90%)"
                : "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 2,
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3.75rem" },
          }}
        >
          Bienvenue sur NoteMaster ⚡️
        </Typography>
        <Typography
          variant="h5"
          color="textSecondary"
          sx={{
            maxWidth: "800px",
            margin: "0 auto",
            lineHeight: 1.6,
            fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
            px: { xs: 2, sm: 0 },
          }}
        >
          Optimisez votre apprentissage grâce à l'Active Learning et à
          l'intelligence artificielle
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1, px: { xs: 0, sm: 2, md: 4 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            },
            gap: { xs: 2, sm: 3, md: 4 },
          }}
        >
          {features.map((feature, index) => (
            <Card
              key={index}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
                borderRadius: "16px",
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                transition: "all 0.3s ease-in-out",
                cursor: "pointer",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                  "& .arrow-icon": {
                    transform: "translateX(4px)",
                  },
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "100%",
                  background: feature.gradient,
                  opacity: 0.05,
                },
              }}
              onClick={() => handleCardClick(feature.path)}
            >
              <CardActionArea sx={{ height: "100%" }}>
                <CardContent
                  sx={{
                    p: 4,
                    flex: 1,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      mb: 3,
                      width: "80px",
                      height: "80px",
                      borderRadius: "20px",
                      background: feature.gradient,
                      margin: "0 auto",
                      color: "white",
                      transform: "rotate(-5deg)",
                      transition: "transform 0.3s ease",
                      "&:hover": {
                        transform: "rotate(0deg) scale(1.1)",
                      },
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    component="h3"
                    align="center"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    align="center"
                    sx={{
                      color: theme.palette.text.secondary,
                      lineHeight: 1.6,
                      flex: 1,
                      mb: 2,
                    }}
                  >
                    {feature.description}
                  </Typography>

                  {/* Indicateur cliquable */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      mt: "auto",
                      opacity: 0.7,
                      transition: "opacity 0.3s ease",
                      "&:hover": {
                        opacity: 1,
                      },
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: theme.palette.primary.main,
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Cliquer pour accéder
                    </Typography>
                    <ArrowForwardIcon
                      className="arrow-icon"
                      sx={{
                        fontSize: 16,
                        color: theme.palette.primary.main,
                        transition: "transform 0.3s ease",
                      }}
                    />
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
