"use client";
import React, { useEffect } from "react";
import { Box, Typography } from "@mui/material";
import TimelineRounded from "@mui/icons-material/InfoOutline";
import { origin } from "../../../../utils/origin.js";
import { useAuthContext } from "../../../_context/AuthContext";

export default function Chatnotice({message,time,userdata}) {
    const [useState, setUserData] = React.useState("");
    const { authUser } = useAuthContext();
     useEffect(() => {
        const getAssisatance = async () => {
            const resUser = await fetch(`${origin}/api/messages/userbyid?id=${authUser?.assistanceId}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				}
			});
			const userDataWithConve = await resUser.json()
            setUserData(userDataWithConve?.username)
        }
        if (!!authUser?.assistanceId) {
            getAssisatance()
        }
    }
    , [userdata]);
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
                justifyContent="center"
                gap={1}
                px={2}
                py={1}
            
            >
                <TimelineRounded sx={{ fontSize: 18, color: "#666" }} />
                <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "#666" }}>
                    {time} {!message ? `Our support agent ${useState} has joined the chat.`: message}
                </Typography>
            </Box>
        </Box>
    );
}
