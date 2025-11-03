import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#4f46e5",
      light: "#6366f1",
      dark: "#3730a3",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#06b6d4",
      light: "#22d3ee",
      dark: "#0e7490",
      contrastText: "#0f172a",
    },
    background: {
      default: "#f4f6fb",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#5f6b84",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
    },
    body1: {
      lineHeight: 1.6,
    },
    body2: {
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            "linear-gradient(135deg, rgba(79,70,229,0.08), rgba(6,182,212,0.12))",
          backgroundAttachment: "fixed",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          background:
            "linear-gradient(120deg, rgba(79,70,229,0.95), rgba(37,99,235,0.9))",
          boxShadow: "0 16px 32px rgba(79,70,229,0.25)",
          padding: 0,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.92), rgba(255,255,255,0.75))",
          backdropFilter: "blur(16px)",
          boxShadow: "0 20px 45px rgba(15, 23, 42, 0.08)",
          border: "1px solid rgba(99, 102, 241, 0.12)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          textTransform: "none",
          fontWeight: 600,
          paddingLeft: 20,
          paddingRight: 20,
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 16px 24px rgba(79, 70, 229, 0.25)",
            transform: "translateY(-1px)",
          },
        },
        outlined: {
          borderWidth: 2,
          "&:hover": {
            borderWidth: 2,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
          padding: "4px 2px",
          boxShadow: "0 32px 56px rgba(15, 23, 42, 0.18)",
          border: "1px solid rgba(15, 23, 42, 0.06)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(79, 70, 229, 0.08)",
          "& .MuiTableCell-root": {
            fontWeight: 600,
            color: "#1e293b",
            textTransform: "uppercase",
            fontSize: "0.75rem",
            letterSpacing: "0.08em",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme; 
