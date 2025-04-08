"use client";
import React from "react";
import Link from "next/link";
import { AppBar, Toolbar, Typography, Box, Stack} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

export default function Topnav() {
    return (
        <AppBar position="static" sx={{ backgroundColor: "gray",marginTop:"5px"}}>
            <Toolbar sx={{ justifyContent: "space-between", alignItems: "center" }}>
                {/* Left Section */}
                <Box display="flex" alignItems="center" gap={1}>
                 
                    <Stack direction="row" alignItems="center" gap={1}>
                        <FiberManualRecordIcon fontSize="small" sx={{ color: "limegreen" }} />
                        <Typography variant="h6" component="div" sx={{ color: "#fff" }}>
                            Live Chat Support
                        </Typography>
                    
                    </Stack>
                </Box>

                {/* Right Section */}
                <Box>
                    <Link
                        href="/support"
                        underline="none"
                        sx={{ display: "flex", alignItems: "center", color: "#fff" }}
                    >
                        <HomeIcon sx={{ mr: 0.5 }} />
                    </Link>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
