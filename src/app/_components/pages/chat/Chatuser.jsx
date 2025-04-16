"use client";
import React, { useState, useEffect, useRef } from "react";
import { TextField, IconButton, Paper } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import { extractTime } from "../../../../utils/extractTime";
import useGetConversationsById from "../../../../hooks/useGetconversationbyuser";
import useListenMessagesforuser from "../../../../hooks/useListenMessagesforuser";
import useSendMessage from "../../../../hooks/useSendMessageforuser";
import { useAuthContext } from "../../../_context/AuthContext";
import emojiRegex from "emoji-regex";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import Topnav from "./Topnav";
import { addUserChatboxOpen } from "../../../../redux/conversationSlice"
import { useDispatch } from "react-redux";
import Chatnotice from "../../chat/messages/Chatnotice";
import { groupMessagesByDate } from "../../../../utils/Dayfind";
import Loader from "../../Loader";
const isOnlyEmoji = (text) => {
    const regex = emojiRegex();
    const matched = text.match(regex);
    return matched && matched.join('') === text;
};
export default function Chatuser() {
    const { convloading, messages } = useGetConversationsById();
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);
    const { userId, authUser } = useAuthContext();
    const botId = "cm8wpc4hv0001dnnkhgmea0he";
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);
    const { loading, sendMessage } = useSendMessage();
    const [showStickyDate, setShowStickyDate] = useState(false);
    const [hardloading, setHardloading] = useState(true);
    const [activeDate, setActiveDate] = useState("");
    const dispatch = useDispatch();
    let scrollTimeout = useRef(null);
    const handleEmojiClick = (emojiObject) => {
        setInput((prev) => prev + emojiObject.native);
    };
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
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ block: "end" });
        }
    }, [messages]);


    useEffect(() => {
        const scrollContainer = document.querySelector(".chat-scroll-container");
        clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
            setShowStickyDate(false); // hide after scroll stops
        }, 1000);
        const handleScroll = () => {
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
    }, [activeDate]);



    const sendMessageRequest = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const trimmed = input.trim();
        const messageType = isOnlyEmoji(trimmed) ? "emoji" : "text";

        await sendMessage({ body: trimmed, type: messageType });
        setInput("");
    };

    useListenMessagesforuser();

    const sortedMessages = messages
        ?.flatMap((conver) => conver.messages)
        .filter((msg) => msg)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const groupedMessages = groupMessagesByDate(sortedMessages);

    return (
        <div className="w-full flex flex-col h-full">
            <Topnav />
            {!hardloading && <div className="px-4 flex-1 overflow-auto h-screen chat-scroll-container">
                <div className="w-full flex justify-center sticky top-1 z-10 bg-transparent">
                    <div
                        className={`absolute  bg-gray-300 text-slate-700 text-xs px-4 py-1 rounded transition-transform duration-300 ${showStickyDate ? "opacity-100 translate-y-0" : "-translate-y-[120%]"
                            }`}
                    >
                        {activeDate}
                    </div>
                </div>

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
                                                    <p className="text-sm font-normal py-1 break-words">{message.body}</p>
                                                )}
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
            <Paper
                sx={{
                    display: "flex",
                    p: 1,
                    borderTop: "1px solid #ccc",
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
