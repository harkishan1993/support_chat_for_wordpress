"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import TimelineRounded from "@mui/icons-material/InfoOutline";

export default function Chatnotice({message,time}) {
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            width="100%"
            my={2}
        >
            <Box
                display="flex"
                alignItems="center"
                gap={1}
                px={2}
                py={1}
            
            >
                <TimelineRounded sx={{ fontSize: 18, color: "#666" }} />
                <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "#666" }}>
                    {time} {message}
                </Typography>
            </Box>
        </Box>
    );
}
