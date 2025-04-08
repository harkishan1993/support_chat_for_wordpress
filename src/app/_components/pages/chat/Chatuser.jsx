"use client";
import React, { useState, useEffect, useRef } from "react";
import { TextField, IconButton, Paper } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import EmojiPicker from "emoji-picker-react";
import useChatScroll from "../../../../hooks/useChatScroll";
import { extractTime } from "../../../../utils/extractTime";
import useGetConversationsById from "../../../../hooks/useGetconversationbyuser";
import useListenMessagesforuser from "../../../../hooks/useListenMessagesforuser";
import useSendMessage from "../../../../hooks/useSendMessageforuser";
import { useAuthContext } from "../../../_context/AuthContext";
import emojiRegex from "emoji-regex";
import Topnav from "./Topnav";
import Chatnotice from "../../chat/messages/Chatnotice";
const regex = emojiRegex();


export default function Chatuser() {
    const { convloading, messages } = useGetConversationsById();
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);
    const { userId } = useAuthContext();
    const botId = "cm8wpc4hv0001dnnkhgmea0he";
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);
    const { loading, sendMessage } = useSendMessage();
    const regex = emojiRegex();

    const [authUser, setAuthUser] = useState({
        profilePic: "not",
        id: userId,
    });

    const handleEmojiClick = (emojiObject) => {
        setInput((prev) => prev + emojiObject.emoji);
        setShowEmojiPicker(false);
    };

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
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessageRequest = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const messageType = regex.test(input.trim()) ? "emoji" : "text";

        await sendMessage({ body: input.trim(), type: messageType });
        setInput("");
    };

    useListenMessagesforuser();
    const ref = useChatScroll(messages);

    const sortedMessages = messages
        ?.flatMap((conver) => conver.messages)
        .filter((msg) => msg)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    return (
        <div className="w-full flex flex-col h-full">
             <Topnav />
            <div className="px-4 flex-1 overflow-auto h-screen" ref={ref}>
                {sortedMessages.map((message,idx) => (
                    <React.Fragment key={idx}>
                    {
                        message.type =="welcome" && <Chatnotice message={`Chat accepted by admin`} time={extractTime(message?.createdAt)} />
                    }
                       {(message.type =="text" || message.type =="welcome") && <div
                        key={message.id}
                        className={`flex items-start gap-2.5 my-3 ${
                            message.senderId === authUser.id ? "flex-row-reverse" : "flex-col"
                        }`}
                    >
                        <div>
                            <div className="flex gap-2 my-1">
                                {message.senderId !== authUser.id && (
                                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                        {message.senderId == botId ? "Bot" : "Assistance"}
                                    </span>
                                )}
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                                    {extractTime(message.createdAt)}
                                </span>
                            </div>
                            <div
                                className={`flex flex-col w-full max-w-[320px] py-1 px-4 border-gray-200 rounded-xl ${
                                    message.senderId === authUser.id
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                                }`}
                            >
                                {message.type === "emoji" ? (
                                    <p className="text-5xl py-2 text-center">{message.body}</p>
                                ) : (
                                    <p className="text-sm font-normal py-2.5">{message.body}</p>
                                )}
                            </div>
                        </div>
                    </div>}
                    </React.Fragment>
                 
                ))}
                <div ref={messagesEndRef}></div>
            </div>

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
                            <EmojiPicker onEmojiClick={handleEmojiClick} />
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
