"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import { origin } from "../utils/origin.js";
import { setMessages } from "../redux/conversationSlice.js";
import { useAuthContext } from "../app/_context/AuthContext";
const useGetConversationsById = () => {
	const [loading, setLoading] = useState(false);
	const {messages} = useSelector((state) => state.conversation);
	const dispatch = useDispatch();
	const { userId } = useAuthContext();
    useEffect(() => {
        const getConversations = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${origin}/api/messages/oneconversation?id=${userId}`,{
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                });
                const data = await res.json();
                dispatch(setMessages(data));
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        getConversations();
    }, [userId, dispatch]);

    return { loading, messages };
};
export default useGetConversationsById;
