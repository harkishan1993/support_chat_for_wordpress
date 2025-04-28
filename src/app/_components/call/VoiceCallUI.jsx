import React, { useEffect, useState, useRef } from "react";
import { useSocketContext } from "../../_context/SocketContext";
import { useAuthContext } from "../../_context/AuthContext";
import { Dialog, DialogTitle, DialogContent, Typography, IconButton, Box, Slide, Button } from "@mui/material";
import { PhoneInTalk, Call, CallEnd } from "@mui/icons-material";
import DraggableDialog from "../../../hooks/DraggableDialog";

const notificationSound = "/sounds/ring.mp3";

const VoiceCallUI = ({ currentUser }) => {
    const { socket } = useSocketContext();
    const { authUser } = useAuthContext();
    const [incomingCall, setIncomingCall] = useState(null);
    const [callStatus, setCallStatus] = useState("idle"); // idle | ringing | in-call
    const [callTimer, setCallTimer] = useState(0);
    const [isCaller, setIsCaller] = useState(false);
    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);
    const remoteStreamRef = useRef(null);
    const ringtoneRef = useRef(null);
    const timerRef = useRef(null);
    const autoRejectTimeoutRef = useRef(null);
    const startPeerConnection = async (createOffer) => {
        peerConnectionRef.current = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        });
        peerConnectionRef.current.addEventListener('icecandidate', event => {
            if (event.candidate) {
                socket.emit("ice-candidate", {
                    to: incomingCall?.id || currentUser?.id,
                    candidate: event.candidate,
                });
            }
        });
        peerConnectionRef.current.ontrack = (event) => {
            console.log("ontrack event triggered");
            if (event.streams && event.streams[0]) {
                remoteStreamRef.current = event.streams[0];
                console.log("Received remote stream", event.streams[0]);
            }
        };
        const localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = localStream;
        localStream.getTracks().forEach(track => {
            peerConnectionRef.current.addTrack(track, localStream);
        });
        if (createOffer) {
            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);

            socket.emit("offer", {
                to: incomingCall?.id || currentUser?.id,
                offer,
            });
        }
    };
    useEffect(() => {
        if (typeof window !== "undefined") {
            ringtoneRef.current = new Audio(notificationSound);
            ringtoneRef.current.volume = 1;
            ringtoneRef.current.loop = true;
        }
    }, []);

    useEffect(() => {
        if (!socket) return;
        socket.on("incomingVoiceCall", async ({ from }) => {
            setIncomingCall(from);
            setCallStatus("ringing");
            setIsCaller(false);
            if (ringtoneRef.current) ringtoneRef.current.play();

            autoRejectTimeoutRef.current = setTimeout(() => {
                if (callStatus === "ringing") handleReject();
            }, 30000);
        });
        socket.on("call-accepted", async () => {
            clearTimeout(autoRejectTimeoutRef.current);
            setCallStatus("in-call");
            startTimer();
            stopRingtone();
            await startPeerConnection(true);
        });
        socket.on("call-rejected", () => {
            resetCall();
        });
        socket.on("call-ended", () => {
            resetCall();
        });
        socket.on("ice-candidate", async ({ candidate }) => {
            if (peerConnectionRef.current && candidate) {
                try {
                    await peerConnectionRef.current.addIceCandidate(candidate);
                } catch (e) {
                    console.error('Error adding received ice candidate', e);
                }
            }
        });

        socket.on("offer", async ({ offer, from }) => {
            await startPeerConnection(false); // false => callee
            try {
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
                const answer = await peerConnectionRef.current.createAnswer();
                await peerConnectionRef.current.setLocalDescription(answer);
                socket.emit("answer", { to: from.id, answer });
            } catch (err) {
                console.error("Error handling offer", err);
            }
        });

        socket.on("answer", async ({ answer }) => {
            if (peerConnectionRef.current) {
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });

        return () => {
            socket.off("incomingVoiceCall");
            socket.off("call-accepted");
            socket.off("call-rejected");
            socket.off("call-ended");
            socket.off("ice-candidate");
            socket.off("offer");
            socket.off("answer");
        };
    }, [socket, callStatus]);

    const handleStartCall = () => {
        socket.emit("incomingVoiceCall", {
            to: authUser?.role === "user" ? authUser?.assistanceId : currentUser?.id,
            from: { id: authUser.id, username: authUser.username },
        });
        setIncomingCall(authUser.role === "user" ? authUser : currentUser);
        setCallStatus("ringing");
        setIsCaller(true);
    };

    const handleAccept = () => {
        socket.emit("accept-call", { to: incomingCall?.id });
        setCallStatus("in-call");
        startTimer();
        stopRingtone();
    };

    const handleReject = () => {
        socket.emit("reject-call", { to: incomingCall?.id });
        resetCall();
    };

    const handleEndCall = () => {
        socket.emit("end-call", { to: incomingCall?.id });
        resetCall();
    };

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setCallTimer((prev) => prev + 1);
        }, 1000);
    };

    const stopRingtone = () => {
        if (ringtoneRef.current) {
            ringtoneRef.current.pause();
            ringtoneRef.current.currentTime = 0;
        }
    };

    const resetCall = () => {
        clearInterval(timerRef.current);
        setCallTimer(0);
        setIncomingCall(null);
        setCallStatus("idle");
        setIsCaller(false);
        stopRingtone();
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        remoteStreamRef.current = null;
    };

    return (
        <>
            {callStatus === "idle" && (
                <IconButton
                    onClick={handleStartCall}
                    sx={{
                        backgroundColor: "#4CAF50",
                        color: "white",
                        "&:hover": { backgroundColor: "#45a049" },
                        borderRadius: "50%",
                        padding: "12px",
                    }}
                >
                    <Call />
                </IconButton>
            )}

            <Dialog
                open={callStatus === "ringing"}
                onClose={handleReject}
                TransitionComponent={Slide}
                keepMounted
                sx={{ "& .MuiDialog-paper": { borderRadius: "12px", padding: "20px" } }}
            >
                <DialogTitle>
                    {isCaller ? `Calling ${incomingCall?.username}` : `${incomingCall?.username} is calling...`}
                </DialogTitle>
                <DialogContent>
                    <Box display="flex" justifyContent="center" gap={2}>
                        {!isCaller && (
                            <IconButton
                                color="success"
                                onClick={handleAccept}
                                sx={{ backgroundColor: "#d0f5e6", "&:hover": { backgroundColor: "#81c784" } }}
                            >
                                <PhoneInTalk />
                            </IconButton>
                        )}
                        <IconButton
                            color="error"
                            onClick={handleReject}
                            sx={{ backgroundColor: "#fddede", "&:hover": { backgroundColor: "#f44336" } }}
                        >
                            <PhoneInTalk />
                        </IconButton>
                    </Box>
                </DialogContent>
            </Dialog>

            {callStatus === "in-call" && (
                <DraggableDialog>
                    <Box
                        sx={{
                            padding: "16px",
                            backgroundColor: "#f4f4f4",
                            color: "black",
                            borderRadius: "12px",
                            boxShadow: 3,
                            textAlign: "center",
                        }}
                    >
                        <Typography variant="h6">
                            In Call with {incomingCall?.username}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                            ⏱ Duration: {callTimer}s
                        </Typography>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleEndCall}
                            startIcon={<CallEnd />}
                            sx={{
                                mt: 2,
                                borderRadius: "50px",
                                fontWeight: "bold",
                                textTransform: "none",
                            }}
                        >
                            End Call
                        </Button>
                    </Box>
                </DraggableDialog>
            )}
        </>
    );
};

export default VoiceCallUI;
