"use client";
import { useState, useRef, useCallback, useEffect, memo } from "react";
import { IconButton, Tooltip, CircularProgress } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import { toast } from "react-hot-toast";
const notificationSound = '/sounds/click.wav';
const VoiceRecorderButton = ({ onRecorded }) => {
    const [recording, setRecording] = useState(false);
    const [elapsed, setElapsed] = useState(0);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);
    const timeoutRef = useRef(null);
    const timerRef = useRef(null);
    const gotDataRef = useRef(false); // <- Track if we got data

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            gotDataRef.current = false;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                    gotDataRef.current = true;
                }
            };

            mediaRecorder.onstop = () => {
                if (!gotDataRef.current) {
                    toast.error("Recording too short.");
                    cleanup();
                    return;
                }

                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                const file = new File([audioBlob], "voice_message.webm", {
                    type: "audio/webm",
                });
                onRecorded(file);
                cleanup();
            };

            mediaRecorder.start();
            setRecording(true);
            setElapsed(0);

            timerRef.current = setInterval(() => {
                setElapsed((prev) => prev + 1);
            }, 1000);

            timeoutRef.current = setTimeout(() => {
                stopRecording();
                toast("Max 60s reached");
            }, 60000);
        } catch (err) {
            if (typeof window !== "undefined") {
                const sound = new Audio(notificationSound);
                if (sound?.play && true) {
                    sound?.play()?.then(() => {
                    }
                    )?.catch((error) => {

                    });
                }
            }
            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                toast.error("Microphone access is blocked. Please allow it in browser settings.");
            } else {
                toast.error("Microphone access failed :- " + " " + "Please Check Your Microphone");
            }
            console.log(err);
         
            cleanup();
        }
    }, [onRecorded]);

    const stopRecording = useCallback(() => {
        const recorder = mediaRecorderRef.current;
        if (recorder && recorder.state === "recording") {
            recorder.stop();
        }
        setRecording(false);
    }, []);

    const cleanup = useCallback(() => {
        clearTimeout(timeoutRef.current);
        clearInterval(timerRef.current);
        setElapsed(0);
        setRecording(false);

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        mediaRecorderRef.current = null;
        audioChunksRef.current = [];
    }, []);

    useEffect(() => {
        return () => cleanup();
    }, [cleanup]);

    return (
        <div className="relative inline-flex items-center">
            <Tooltip title={recording ? "Stop Recording" : "Record Voice"} arrow>
                <IconButton
                    onClick={recording ? stopRecording : startRecording}
                    color={recording ? "error" : "primary"}
                >
                    {recording ? <StopIcon /> : <MicIcon />}
                </IconButton>
            </Tooltip>

            {recording && (

                <div className="relative w-10 h-10 flex items-center justify-center">
                    <CircularProgress
                        variant="determinate"
                        value={(elapsed / 60) * 100}
                        size={40}
                        thickness={5}
                        style={{ color: "#f87171", position: "absolute" }}
                    />
                    <span className="text-xs font-semibold text-red-600 z-10">
                        {elapsed}s
                    </span>
                </div>
            )}
        </div>
    );
};

export default memo(VoiceRecorderButton);
