"use client";
import React from "react";
import Link from "next/link";
import { AppBar, Toolbar, Typography, Box, Stack} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import VoiceCallUI from "../../call/VoiceCallUI";

export default function Topnav() {
    return (
        <AppBar position="static" sx={{ marginTop:"5px"}}>
            <Toolbar sx={{ justifyContent: "space-between", alignItems: "center" }}>
                {/* Left Section */}
                <VoiceCallUI currentUser={null}/>
                <Box display="flex" alignItems="center" gap={1}>
                 
                    <Stack direction="row" alignItems="center" gap={1}>
                        <FiberManualRecordIcon fontSize="small" sx={{ color: "limegreen" }} />
                        <Typography variant="h6" component="div" >
                            Live Chat Support
                        </Typography>
                    
                    </Stack>
                </Box>

                {/* Right Section */}
                <Box>
                    <Link
                        href="/support"
                        underline="none"
                        sx={{ display: "flex", alignItems: "center"}}
                    >
                        <HomeIcon sx={{ mr: 0.5 }} />
                    </Link>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
