"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { TextField, IconButton, Paper, Tooltip, Badge, Card, Box, CardContent, Typography, Button } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import { extractTime } from "../../../../utils/extractTime";
import CircularProgress from '@mui/material/CircularProgress';
import DownloadIcon from '@mui/icons-material/Download';
import useGetConversationsById from "../../../../hooks/useGetconversationbyuser";
import useListenMessagesforuser from "../../../../hooks/useListenMessagesforuser";
import useSendMessage from "../../../../hooks/useSendMessageforuser";
import { useAuthContext } from "../../../_context/AuthContext";
import emojiRegex from "emoji-regex";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import Topnav from "./Topnav";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { addUserChatboxOpen, setMessages, resetTopScrollUnseenCount } from "../../../../redux/conversationSlice"
import { useDispatch, useSelector } from "react-redux";
import Chatnotice from "../../chat/messages/Chatnotice";
import { groupMessagesByDate } from "../../../../utils/Dayfind";
import Loader from "../../Loader";
import LoaderMsg from "../../chat/messages/LoaderMsg";
import ImageWithLoader from "./ImageWithLoader"
import Linkify from "linkify-react";
import { formatFileSize } from "../../../../utils/formatFileSize"
import { useDropzone } from "react-dropzone";

export default function Chatuser() {
    const { convloading, messages } = useGetConversationsById();
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);
    const { userId, authUser } = useAuthContext();
    const [bottom, setBottom] = useState(null);
    const botId = "cm8wpc4hv0001dnnkhgmea0he";
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const emojiPickerRef = useRef(null);
    const [downloaded, setDownloaded] = useState({});  // { url: true }
    const [downloading, setDownloading] = useState(null);
    const { loading, sendMessage } = useSendMessage();
    const [showStickyDate, setShowStickyDate] = useState(false);
    const [hardloading, setHardloading] = useState(true);
    const [activeDate, setActiveDate] = useState("");
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const [files, setFiles] = useState([]);
    const ref = useRef(null);
    const { topScrollUnseenCount } = useSelector((state) => state.conversation)
    const onDrop = useCallback((acceptedFiles) => {
        setFiles((prev) => [...prev, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, rootRef } = useDropzone({
        onDrop,
        multiple: true,
    });
    const dispatch = useDispatch();
    let scrollTimeout = useRef(null);
    const handleEmojiClick = useCallback((emojiObject) => {
        setInput((prev) => prev + emojiObject.native);
    }, [setInput, input]);
    useEffect(() => {
        if (!ref.current || messages.length === 0) return;
        const scrollContainer = ref.current;
        if (messages.length <= 15) {
            const timeout = setTimeout(() => {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }, 0);

            return () => clearTimeout(timeout);
        }
    }, [messages]);

    useEffect(() => {
        const BOTTOM_THRESHOLD = 100;
        if (messages.length === 0) return;
        if (bottom <= BOTTOM_THRESHOLD) {
            const scrollContainer = ref.current;
            const images = scrollContainer?.querySelectorAll("img") || [];

            let loadedCount = 0;

            const checkAllImagesLoaded = () => {
                loadedCount++;
                if (loadedCount === images.length) {
                    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
                }
            };

            if (images.length === 0) {
                // No images, just scroll immediately
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
            } else {
                images.forEach((img) => {
                    if (img.complete) {
                        checkAllImagesLoaded();
                    } else {
                        img.addEventListener("load", checkAllImagesLoaded);
                        img.addEventListener("error", checkAllImagesLoaded);
                    }
                });
            }

            // Cleanup to avoid memory leaks
            return () => {
                images.forEach((img) => {
                    img.removeEventListener("load", checkAllImagesLoaded);
                    img.removeEventListener("error", checkAllImagesLoaded);
                });
            };
        }

    }, [messages]);


    useEffect(() => {
        const fetchUnseen = async () => {
            try {
                const res = await fetch(`/api/messages/unseen/${authUser?.assistanceId}?authid=${userId}&from=user`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                });
                const data = await res.json();

                if (!res.ok || !data?.success) {
                    console.error("Failed to mark messages as seen");
                } else {
                    // console.log("Messages marked as seen");
                }
            } catch (err) {
                console.error("Error marking messages as seen:", err);
            }
        }

        if (authUser?.assistanceId) {
            fetchUnseen();
        }
    }, [messages, authUser]);
    useEffect(() => {
        dispatch(addUserChatboxOpen(true));
        return () => {
            dispatch(addUserChatboxOpen(false));
        }
    }, [dispatch]);
    useEffect(() => {
        window?.parent?.postMessage({ type: "NEW_COUNT", count: 0 }, '*');
        setHardloading(false);
    }, []);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    useEffect(() => {
        const scrollContainer = document.querySelector(".chat-scroll-container");
        clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
            setShowStickyDate(false); // hide after scroll stops
        }, 1000);
        const handleScroll = async () => {
            // Get current visible date group
            const dateGroups = document.querySelectorAll("[data-date-group]");
            let currentDate = "";

            dateGroups.forEach((group) => {
                const rect = group.getBoundingClientRect();
                if (rect.top <= 100) {
                    currentDate = group.getAttribute("data-label");
                }
            });

            if (currentDate && currentDate !== activeDate) {
                setActiveDate(currentDate);
            }
            const distanceFromBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight;
            setBottom(distanceFromBottom);
            if (scrollContainer.scrollTop === 0 && !isFetchingMore && messages.length > 0) {
                setIsFetchingMore(true);
                const oldestMessage = messages[0];
                const prevHeight = scrollContainer.scrollHeight;

                try {
                    const res = await fetch(`${origin}/api/messages/oneconversation?id=${userId}&cursor=${oldestMessage.id}&limit=20`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                    });
                    const olderMessages = await res.json();
                    if (olderMessages.length === 0) setHasMore(true);
                    else {
                        dispatch(setMessages([...olderMessages, ...messages]));
                        await new Promise((resolve) => setTimeout(resolve, 0));
                        scrollContainer.scrollTop = scrollContainer.scrollHeight - prevHeight;
                    }
                } catch (err) {
                    console.error("Error fetching older messages:", err);
                } finally {
                    setIsFetchingMore(false);
                }
            }
            setShowStickyDate(true); // show during scroll

            clearTimeout(scrollTimeout.current);
            scrollTimeout.current = setTimeout(() => {
                setShowStickyDate(false); // hide after scroll stops
            }, 1000);
        };

        if (scrollContainer) {
            scrollContainer.addEventListener("scroll", handleScroll);
        }

        return () => {
            if (scrollContainer) {
                scrollContainer.removeEventListener("scroll", handleScroll);
            }
            clearTimeout(scrollTimeout.current);
        };
    }, [activeDate, messages, userId, isFetchingMore, dispatch, hasMore]);

    const isOnlyEmoji = useCallback((text) => {
        const regex = emojiRegex();
        const matched = text.match(regex);
        return matched && matched.join('') === text;
    }, []);
    const removeFile = useCallback((index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const clearFiles = useCallback(() => {
        setFiles([]);
    }, []);
    useEffect(() => {
        if (messages.length === 0) {
            setActiveDate("");
            setShowStickyDate(false);
        }
        const BOTTOM_THRESHOLD = 100;
        if (bottom <= BOTTOM_THRESHOLD) {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ block: "end" });
            }
        }
    }, [messages]);
    useEffect(() => {
        const BOTTOM_THRESHOLD = 100;
        if (bottom <= BOTTOM_THRESHOLD) {
            setShowScrollToBottom(false)
            dispatch(resetTopScrollUnseenCount())
        } else {
            setShowScrollToBottom(true)
        }
    }, [messages, bottom]);
    const handleImageDownload = useCallback(async (url, name) => {
        setDownloading(url);
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setDownloaded(prev => ({ ...prev, [url]: true }));
        } catch (err) {
            console.error("Download failed", err);
        }
        setDownloading(null);
    }, [setDownloaded]);
    const sendMessageRequest = useCallback(async (e) => {
        e.preventDefault();
        if (!input.trim() && files.length === 0) return;

        const trimmed = input.trim();
        const messageType = isOnlyEmoji(trimmed) ? "emoji" : "text";
        const whenfile = files.length > 0 ? "file" : messageType;

        setInput("");
        setFiles([]);
        await sendMessage({ body: trimmed, type: whenfile, files: files });
    }, [input, sendMessage, files, isOnlyEmoji]);

    useListenMessagesforuser();

    const groupedMessages = useMemo(() => {
        return groupMessagesByDate(messages);
    }, [messages]);

    return (
        <div className="w-full flex flex-col h-full">
            <Topnav />
            {!hardloading && <div className="px-4 flex-1 overflow-auto h-screen chat-scroll-container" ref={ref}>
                <div className="w-full flex justify-center sticky top-1 z-10 bg-transparent">
                    <div
                        className={`absolute  bg-gray-300 text-slate-700 text-xs px-4 py-1 rounded transition-transform duration-300 ${showStickyDate ? "opacity-100 translate-y-0" : "-translate-y-[120%]"
                            }`}
                    >
                        {activeDate}
                    </div>
                </div>
                {isFetchingMore && <LoaderMsg />}
                {Object.entries(groupedMessages).map(([label, msgs]) => (
                    <div key={label} data-label={label} data-date-group>
                        <div className="flex items-center gap-2 my-4 text-gray-500 text-xs">
                            <div className="flex-grow border-t border-gray-300"></div>
                            <span className="px-2 whitespace-nowrap">{label}</span>
                            <div className="flex-grow border-t border-gray-300"></div>
                        </div>

                        {msgs.map((message, idx) => (
                            <React.Fragment key={message.id || idx}>
                                {message.type === "welcome" && (
                                    <Chatnotice message="" time={extractTime(message.createdAt)} />
                                )}
                                {(message.type === "text" || message.type === "emoji" || message.type === "welcome") && (
                                    <div
                                        className={`flex items-start gap-2.5 my-3 ${message.senderId === authUser.id ? "flex-row-reverse" : "flex-col"
                                            }`}
                                    >
                                        <div>
                                            <div className={`flex items-center gap-[1] my-1 ${message.senderId === authUser.id ? "justify-end" : ""} space-x-2 rtl:space-x-reverse`}>
                                                {message.senderId !== authUser.id && (
                                                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                                        {message.senderId === botId ? "Bot" : "Assistance"}
                                                    </span>
                                                )}
                                                <span className={`text-[11px] font-normal text-gray-500 ${message.senderId === authUser.id ? "" : "leading-0"} dark:text-gray-400`}>
                                                    {extractTime(message.createdAt)}
                                                </span>
                                            </div>
                                            <div
                                                className={`flex flex-col w-full max-w-[320px] py-1 px-4 border-gray-200 rounded-xl ${message.senderId === authUser.id
                                                    ? message.type === "emoji" ? "bg-transparent" : "bg-sky-200 text-slate-700"
                                                    : message.type === "emoji" ? "bg-transparent" : "bg-gray-100 text-slate-700"
                                                    }`}
                                            >
                                                {message.type === "emoji" ? (
                                                    <p className="text-5xl font-semibold break-words leading-14">{message?.body}</p>
                                                ) : (
                                                    <p className="text-sm font-normal py-1 break-words">
                                                        <Linkify
                                                            options={{
                                                                target: "_blank",
                                                                rel: "noopener noreferrer",
                                                                className: "text-blue-600 hover:underline break-all",
                                                            }}
                                                        >
                                                            {message?.body}
                                                        </Linkify>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {message.type === "file" && (
                                    <div
                                        className={`flex items-start gap-2.5 my-3 ${message.senderId === authUser.id ? "flex-row-reverse" : "flex-col"
                                            }`}
                                    >
                                        <div>
                                            <div className={`flex items-center gap-[1] my-1 ${message.senderId === authUser.id ? "justify-end" : ""} space-x-2 rtl:space-x-reverse`}>
                                                {message.senderId !== authUser.id && (
                                                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                                        {message.senderId === botId ? "Bot" : "Assistance"}
                                                    </span>
                                                )}
                                                <span className={`text-[11px] font-normal text-gray-500 ${message.senderId === authUser.id ? "" : "leading-0"} dark:text-gray-400`}>
                                                    {extractTime(message.createdAt)}
                                                </span>
                                            </div>
                                            <div
                                                className={`flex flex-col w-full max-w-[320px] py-1 px-4 border-gray-200 rounded-xl ${message.senderId === authUser.id
                                                    ? "bg-sky-200 text-slate-700" : "bg-gray-100 text-slate-700"
                                                    }`}
                                            >
                                                {message.files?.map((file, idx) => {
                                                    const isImage = file.type?.startsWith("image");

                                                    return <div key={idx} className="relative">
                                                        {
                                                            isImage ? (
                                                                <ImageWithLoader
                                                                    src={file.url}
                                                                    className="w-full h-auto rounded-lg shadow mt-2"
                                                                />
                                                            ) : (
                                                                <div className="relative bg-white border border-gray-200 rounded-lg p-3 mt-2 shadow-sm">
                                                                    <ImageWithLoader
                                                                        type="file"
                                                                        className="w-full h-auto rounded-md shadow"
                                                                    />
                                                                    <div className="mt-2 flex justify-between items-center">
                                                                        <div>
                                                                            <p className="text-sm font-medium text-gray-800  break-words">{file.name}</p>
                                                                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        }
                                                        {
                                                            message.senderId !== authUser.id && !downloaded[file.url] && (
                                                                <button
                                                                    onClick={() => handleImageDownload(file.url, file.name)}
                                                                    className="absolute top-4 right-2 bg-white/80 hover:bg-white p-1 rounded-full"
                                                                >
                                                                    {downloading === file.url ? (
                                                                        <CircularProgress size={20} thickness={5} />
                                                                    ) : (
                                                                        <DownloadIcon fontSize="small" sx={{ cursor: "pointer" }} />
                                                                    )}
                                                                </button>
                                                            )
                                                        }
                                                    </div>
                                                })}
                                                <p className="text-sm font-normal py-1 break-words mt-1">{message.body}</p>

                                            </div>
                                        </div>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                ))}
                <div ref={messagesEndRef}></div>
            </div>}
            {
                hardloading && <Loader />
            }
            {files.length > 0 && (
                <Box className="px-4 mb-2 flex flex-wrap gap-3 justify-start">
                    {files.map((file, idx) => {
                        const isImage = file.type.startsWith("image/");
                        const fileUrl = URL.createObjectURL(file);
                        const fileExt = file.name.split('.').pop()?.toUpperCase();

                        return (
                            <Card key={idx} sx={{ width: 120, p: 1, position: "relative", display: "flex", flexDirection: "column" }}>
                                <IconButton
                                    size="small"
                                    onClick={() => removeFile(idx)}
                                    sx={{ position: "absolute", top: 2, right: 2, zIndex: 10 }}
                                    color="error"
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                                <CardContent sx={{ p: 0, textAlign: "center" }}>
                                    {isImage ? (
                                        <img
                                            src={fileUrl}
                                            alt={file.name}
                                            style={{
                                                maxWidth: "100%",
                                                objectFit: "cover",
                                                borderRadius: "6px",
                                            }}
                                        />
                                    ) : (
                                        <Box
                                            sx={{
                                                width: "100%",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                bgcolor: "grey.100",
                                                borderRadius: "6px",
                                            }}
                                        >
                                            <Typography variant="body2" fontWeight="bold">
                                                {fileExt}
                                            </Typography>
                                        </Box>
                                    )}
                                    <Typography
                                        variant="caption"
                                        noWrap
                                        title={file.name}
                                        sx={{ mt: 0.5, display: "block" }}
                                    >
                                        {file.name}
                                    </Typography>
                                </CardContent>
                            </Card>
                        );
                    })}
                    <Button size="small" variant="outlined" color="error" onClick={clearFiles}>
                        Clear All
                    </Button>
                </Box>
            )}
            {showScrollToBottom && (
                <div className="fixed bottom-20 right-4 z-20 animate-bounce-in">
                    <button
                        className="relative cursor-pointer bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-full shadow-xl hover:scale-110 hover:shadow-blue-500/50 transition-all duration-300 ease-in-out"
                        onClick={() => {
                            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 16.5l-6-6h4V3h4v7.5h4l-6 6z" />
                        </svg>
                        {topScrollUnseenCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-xs font-semibold text-white rounded-full px-1.5 py-0.5 shadow-md animate-fade-in">
                                {topScrollUnseenCount}
                            </span>
                        )}
                    </button>
                </div>

            )}
            <Paper
                sx={{
                    display: "flex",
                    p: 1,
                    borderTop: "1px solid #ccc",
                    alignItems: "center",
                    backgroundColor: "white",
                    width: "100vw",
                    position: "relative",
                }}
            >
                <div ref={emojiPickerRef} style={{ position: "relative" }}>
                    <IconButton onClick={() => setShowEmojiPicker((prev) => !prev)}>
                        <EmojiEmotionsIcon color="primary" />
                    </IconButton>
                    {showEmojiPicker && (
                        <div
                            style={{
                                position: "absolute",
                                bottom: "60px",
                                left: "0",
                                zIndex: 10,
                                backgroundColor: "white",
                                borderRadius: "8px",
                                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                            }}
                        >
                            <Picker data={data} onEmojiSelect={handleEmojiClick} theme="light" />
                        </div>
                    )}
                </div>
                <input {...getInputProps()} />
                <div className='mr-3'>
                    <Tooltip title="Attach files">
                        <IconButton color="primary" component="span" {...getRootProps()} disabled={`${files.length >= 3 ? "disabled" : ""}`}>
                            <Badge badgeContent={files.length} color="secondary">
                                <CloudUploadIcon fontSize="small" />
                            </Badge>
                        </IconButton>
                    </Tooltip>
                </div>
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessageRequest(e)}
                    placeholder="Type a message..."
                />
                <IconButton onClick={sendMessageRequest}>
                    <SendIcon color="primary" />
                </IconButton>
            </Paper>
        </div>
    );
}
