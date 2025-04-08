"use client";

import { Box, CircularProgress, Typography } from "@mui/material";

export default function Loader() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      <CircularProgress color="primary" size={60} />
      <Typography variant="h6" color="textSecondary" mt={2}>
        Loading, please wait...
      </Typography>
    </Box>
  );
}
