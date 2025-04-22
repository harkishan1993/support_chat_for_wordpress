"use client";
import { useEffect } from "react";
import { useSocketContext } from "../app/_context/SocketContext";
import { useSelector, useDispatch } from "react-redux";
import { addMessage,incrementTopScrollUnseenCount } from "../redux/conversationSlice.js";

const useListenMessagesForUser = () => {
    const { socket } = useSocketContext();
    const { messages } = useSelector((state) => state.conversation);
    const dispatch = useDispatch();

    useEffect(() => {
        socket?.on("newMessage", (newMessage) => {
            newMessage.shouldShake = true;
            dispatch(incrementTopScrollUnseenCount())
            dispatch(addMessage(newMessage));
        });

        return () => {
            socket?.off("newMessage");
        };
    }, [socket, messages, dispatch]);

    return null;
};

export default useListenMessagesForUser;
