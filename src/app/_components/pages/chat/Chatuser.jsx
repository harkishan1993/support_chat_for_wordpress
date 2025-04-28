"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { TextField, IconButton, Paper, Tooltip, Badge, Card, Box, CardContent, Typography, Button } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import { extractTime } from "../../../../utils/extractTime";
import CircularProgress from '@mui/material/CircularProgress';
import DownloadIcon from '@mui/icons-material/Download';
import useGetConversationsById from "../../../../hooks/useGetconversationbyuser";
import ReplyIcon from "@mui/icons-material/Reply";
import useListenMessagesforuser from "../../../../hooks/useListenMessagesforuser";
import useSendMessage from "../../../../hooks/useSendMessageforuser";
import { useAuthContext } from "../../../_context/AuthContext";
import emojiRegex from "emoji-regex";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import Topnav from "./Topnav";
import ReplyPreview from "./ReplyPreview"
import FileSelectedViews from "../../chat/messages/FileSelectedViews"
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
import VoiceRecorderButton from "../../../../hooks/VoiceRecorderButton";
import VoicePreview from "../../chat/messages/VoicePreview";
import VideoWithLoader from "../../chat/messages/VideoWithLoader";
import { getYoutubeVideoId } from "../../../../utils/getYoutubeVideoId";

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
    const [voiceFile, setVoiceFile] = useState(null);
    const ref = useRef(null);
    const dispatch = useDispatch();
    let scrollTimeout = useRef(null);
    const [replyTo, setReplyTo] = useState(null);
    const { topScrollUnseenCount } = useSelector((state) => state.conversation)
    const onDrop = useCallback((acceptedFiles) => {
        setFiles((prev) => [...prev, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, rootRef } = useDropzone({
        onDrop,
        multiple: true,
    });

    const handleReply = useCallback((msg) => {
        setReplyTo(msg);
    }, []);
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
    }, [activeDate, messages, userId, isFetchingMore, dispatch, hasMore, scrollTimeout]);

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
        const allFiles = [...files, ...(voiceFile ? [voiceFile] : [])];
        if (!input.trim() && allFiles.length === 0) return;

        const trimmed = input.trim();
        const messageType = isOnlyEmoji(trimmed) ? "emoji" : "text";
        const whenfile = allFiles.length > 0 ? "file" : messageType;

        setInput("");
        setFiles([]);
        setVoiceFile(null);
        setReplyTo(null);
        await sendMessage({ body: trimmed, type: whenfile, files: allFiles, replyTo });
    }, [input, sendMessage, files, voiceFile, isOnlyEmoji, replyTo]);

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
                                        <div className="flex">
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
                                                    {message?.replyTo && <ReplyPreview reply={message?.replyTo} />}
                                                    {message.type === "emoji" ? (
                                                        <p className="text-5xl font-semibold break-words leading-14">{message?.body}</p>
                                                    ) : (
                                                        <>
                                                            {
                                                                !!getYoutubeVideoId(message?.body) && <div className="rounded overflow-hidden py-1">
                                                                    <iframe
                                                                        className="w-full aspect-video rounded"
                                                                        src={`https://www.youtube.com/embed/${getYoutubeVideoId(message?.body)}`}
                                                                        frameBorder="0"
                                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                        allowFullScreen
                                                                    />
                                                                </div>
                                                            }
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
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {message.senderId !== authUser.id && (
                                                <Tooltip title="Reply" arrow>
                                                    <IconButton
                                                        onClick={() => handleReply(message)}
                                                        size="small"
                                                        className="self-center"
                                                    >
                                                        <ReplyIcon sx={{ fontSize: "16px" }} />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {message.type === "file" && (
                                    <div
                                        className={`flex items-start gap-2.5 my-3 ${message.senderId === authUser.id ? "flex-row-reverse" : "flex-col"
                                            }`}
                                    >
                                        <div className="flex">
                                            <div>
                                                <div className={`flex items-center gap-[1] ${message.senderId === authUser.id ? "justify-end" : ""} space-x-2 rtl:space-x-reverse`}>

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
                                                    className={`flex flex-col w-full gap-2 p-2 max-w-[320px] border-gray-200 rounded-xl ${message.senderId === authUser.id
                                                        ? "bg-sky-200 text-slate-700" : "bg-gray-100 text-slate-700"
                                                        }`}
                                                >
                                                    {message?.replyTo && <ReplyPreview reply={message?.replyTo} />}
                                                    {message.files?.map((file, idx) => {
                                                        const isImage = file.type?.startsWith("image");
                                                        const isAudio = file.type?.startsWith("audio");
                                                        const isVideo = file.type?.startsWith("video");
                                                        return <div key={idx} className="relative">
                                                            {
                                                                isImage ? (
                                                                    <ImageWithLoader
                                                                        src={file.url}
                                                                        className="w-full h-auto rounded-lg shadow"
                                                                    />
                                                                ) : !isAudio && !isVideo && (
                                                                    <div className="relative bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
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
                                                            {isAudio && (
                                                                <div className="flex justify-center items-center">
                                                                    <audio
                                                                        controls
                                                                        controlsList="nodownload noplaybackrate nofullscreen"
                                                                        onContextMenu={(e) => e.preventDefault()}
                                                                        src={file.url}
                                                                    />
                                                                </div>
                                                            )}
                                                            {isVideo && (
                                                                <VideoWithLoader src={file.url} />
                                                            )}

                                                            {
                                                                message.senderId !== authUser.id && !downloaded[file.url] && !isAudio && !isVideo && (
                                                                    <button
                                                                        onClick={() => handleImageDownload(file.url, file.name)}
                                                                        className="absolute top-4 right-2 bg-white/80 hover:bg-white p-1 rounded-full"
                                                                    >
                                                                        {downloading === file.url ? (
                                                                            <CircularProgress size={20} thickness={5} />
                                                                        ) : (
                                                                            <Tooltip title="Download" arrow>
                                                                                <DownloadIcon fontSize="small" sx={{ cursor: "pointer" }} />
                                                                            </Tooltip>
                                                                        )}
                                                                    </button>
                                                                )
                                                            }
                                                        </div>
                                                    })}
                                                    {message?.body && <p className="text-sm font-normal py-1 break-words mt-1">{message.body}</p>}

                                                </div>
                                            </div>
                                            {message.senderId !== authUser.id && (
                                                <Tooltip title="Reply" arrow>
                                                    <IconButton
                                                        onClick={() => handleReply(message)}
                                                        size="small"
                                                        className="self-center"
                                                    >
                                                        <ReplyIcon sx={{ fontSize: "16px" }} />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
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
            {files.length > 0 && <FileSelectedViews files={files} clearFiles={clearFiles} removeFile={removeFile} />}
            {replyTo && (
                <div className="flex items-center justify-between w-1/2 max-md:w-5/6 border-l-4 border-sky-500 bg-sky-100 p-2 rounded-md mb-2">
                    <div className="flex items-start gap-2 overflow-hidden">
                        {/* Optional visual preview */}
                        {replyTo?.files?.[0]?.type?.startsWith("image") && (
                            <img
                                src={replyTo.files[0].url}
                                alt="replied-image"
                                className="w-12 h-12 object-cover rounded border"
                            />
                        )}
                        {replyTo?.files?.[0]?.type && !replyTo.files[0].type.startsWith("image") && (
                            <div className="w-12 h-12 bg-gray-200 flex items-center justify-center text-xs text-gray-600 rounded border">
                                {replyTo.files[0].name.split(".").pop().toUpperCase()}
                            </div>
                        )}

                        {/* Message preview */}
                        <div className="flex flex-col overflow-hidden">
                            <p className="text-[12px] text-gray-500">
                                Replying to <strong>{replyTo?.sender?.username || "User"}</strong>
                            </p>
                            {replyTo.body && (
                                <p className="text-sm font-medium text-slate-800 truncate">
                                    {replyTo.body}
                                </p>
                            )}
                            {!replyTo.body && replyTo.files?.length && (
                                <p className="text-sm italic text-gray-600">
                                    {replyTo.files[0]?.type?.startsWith("image") ? "📷 Image" : `📎 ${replyTo.files[0]?.name}`}
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => setReplyTo(null)}
                        className="ml-2 text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
                        title="Cancel reply"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
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
            <VoicePreview voiceFile={voiceFile} setVoiceFile={setVoiceFile} />
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
                    <Tooltip title="Emoji" arrow>
                        <IconButton onClick={() => setShowEmojiPicker((prev) => !prev)}>
                            <EmojiEmotionsIcon color="primary" />
                        </IconButton>
                    </Tooltip>
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
                <div>
                    <Tooltip title="Attach files" arrow>
                        <IconButton color="primary" component="span" {...getRootProps()} disabled={`${files.length >= 3 ? "disabled" : ""}`}>
                            <Badge badgeContent={files.length} color="secondary">
                                <CloudUploadIcon fontSize="small" />
                            </Badge>
                        </IconButton>
                    </Tooltip>
                </div>
                {!voiceFile && (
                    <VoiceRecorderButton
                        onRecorded={(file) => setVoiceFile(file)}
                    />
                )}
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={input}
                    sx={{ marginLeft: "8px" }}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessageRequest(e)}
                    placeholder="Type a message..."
                />

                <IconButton onClick={sendMessageRequest} disabled={loading}>
                    {loading ? (
                        <CircularProgress size={24} />
                    ) : (
                        <SendIcon color="primary" />
                    )}
                </IconButton>
            </Paper>
        </div>
    );
}
