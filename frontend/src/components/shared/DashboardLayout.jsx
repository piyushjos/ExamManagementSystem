import React, { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export default function DashboardLayout({ children, title }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("email");
  const userInitials = userEmail ? userEmail[0]?.toUpperCase() : null;

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflowX: "hidden",
        backgroundColor: "transparent",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top left, rgba(79,70,229,0.18), transparent 55%), radial-gradient(circle at bottom right, rgba(6,182,212,0.18), transparent 45%)",
          zIndex: 0,
        },
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          zIndex: 2,
          borderRadius: 1.75,
          mt: { xs: 2, md: 3 },
          maxWidth: 1200,
          width: "100%",
          mx: { xs: 2, sm: "auto" },
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 84, md: 96 },
            px: { xs: 3, sm: 4, md: 5 },
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, fontStyle: "italic", letterSpacing: "-0.01em" }}
            >
              {title || "Dashboard"}
            </Typography>
            <Typography
              variant="body2"
              sx={{ opacity: 0.7, mt: 0.5 }}
            >
              Manage your exam experience with a clean, modern workspace.
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton
            color="inherit"
            onClick={handleProfileMenuOpen}
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.28)",
              },
            }}
          >
            <Avatar sx={{ bgcolor: "secondary.main" }}>
              {userInitials || <AccountCircleIcon fontSize="small" />}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: "1200px",
          width: "100%",
          mx: "auto",
          px: { xs: 2.5, md: 3.5 },
          pb: { xs: 8, md: 10 },
          pt: { xs: 4, md: 6 },
        }}
      >
        {children}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        elevation={2}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <MenuItem disabled>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {userEmail || "Guest"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Account options
            </Typography>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem>Profile</MenuItem>
        <MenuItem>Settings</MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </Box>
  );
}
