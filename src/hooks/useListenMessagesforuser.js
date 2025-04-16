"use client";
import { useEffect } from "react";
import { useSocketContext } from "../app/_context/SocketContext";
import { useSelector, useDispatch } from "react-redux";
import { setMessages } from "../redux/conversationSlice.js";

const notificationSound = "/sounds/notification.mp3";

const useListenMessagesForUser = () => {
    const { socket } = useSocketContext();
    const { messages } = useSelector((state) => state.conversation);
    const dispatch = useDispatch();

    useEffect(() => {
        socket?.on("newMessage", (newMessage) => {
            newMessage.shouldShake = true;

   

            // Check if conversation already exists
            const conversationExists = messages.some(
                (conv) => conv.id === newMessage.conversationId
            );

            let updatedConversations;
            if (conversationExists) {
                // Update existing conversation
                updatedConversations = messages.map((conversation) =>
                    conversation.id === newMessage.conversationId
                        ? {
                              ...conversation,
                              messages: [...conversation.messages, newMessage],
                          }
                        : conversation
                );
            } else {
                // Create new conversation entry
                updatedConversations = [
                    ...messages,
                    {
                        id: newMessage.conversationId,
                        messages: [newMessage],
                        participants: [], // You may need to fetch this data
                    },
                ];
            }

            dispatch(setMessages(updatedConversations));
        });

        return () => {
            socket?.off("newMessage");
        };
    }, [socket, messages, dispatch]);

    return null;
};

export default useListenMessagesForUser;
