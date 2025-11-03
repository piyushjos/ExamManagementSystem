import React from "react";
import { Paper, Typography, Button, Box } from "@mui/material";
import Grid from "@mui/material/Grid";

const DashboardCard = ({ title, description, buttonText, icon, onClick, bgColor }) => {
  return (
    <Grid item xs={12} md={6} lg={4}>
      <Paper
        sx={{
          height: "100%",
          minHeight: 220,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          overflow: "hidden",
          borderRadius: 3,
          p: 3,
          background: bgColor || "linear-gradient(135deg, #6366F1, #818CF8)",
          color: "#fff",
          boxShadow: "0 24px 45px rgba(79, 70, 229, 0.25)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 28px 50px rgba(79, 70, 229, 0.3)",
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255,255,255,0.1)",
            opacity: 0,
            transition: "opacity 0.3s ease",
          },
          "&:hover::before": {
            opacity: 1,
          },
          "&::after": {
            content: '""',
            position: "absolute",
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.12)",
            top: -60,
            right: -60,
            filter: "blur(0)",
          },
        }}
      >
        <Box
          sx={{
            mb: 2.5,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 56,
            height: 56,
            borderRadius: "18px",
            backgroundColor: "rgba(255,255,255,0.18)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
            color: "#fff",
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
          {description}
        </Typography>
        <Box sx={{ mt: "auto" }}>
          <Button
            variant="contained"
            onClick={onClick}
            sx={{
              bgcolor: "rgba(255,255,255,0.22)",
              backdropFilter: "blur(6px)",
              color: "#fff",
              fontWeight: 600,
              px: 3,
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.32)",
              },
            }}
          >
            {buttonText}
          </Button>
        </Box>
      </Paper>
    </Grid>
  );
};

export default DashboardCard;
