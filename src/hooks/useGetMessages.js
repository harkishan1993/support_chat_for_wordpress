"use client"
import { useEffect, useState } from "react";

import { useSelector, useDispatch } from "react-redux";
import { setMessages } from "../redux/conversationSlice.js";
import toast from "react-hot-toast";
import { origin } from "../utils/origin.js";
import { useAuthContext } from "../app/_context/AuthContext";
const useGetMessages = () => {
	const [loading, setLoading] = useState(false);
	const {messages, selectedConversation} = useSelector((state) => state.conversation);
	const dispatch = useDispatch();
	const { userId } = useAuthContext();
	useEffect(() => {
		const getMessages = async () => {
			if (!selectedConversation) return;
			setLoading(true);
			dispatch(setMessages([]));
			try {
				const res = await fetch(`${origin}/api/messages/${selectedConversation.id}?id=${userId}`);
				const data = await res.json();
				dispatch(setMessages(data));
			} catch (error) {
				toast.error(error.message);
			} finally {
				setLoading(false);
			}
		};
		getMessages();
	}, [selectedConversation,dispatch,userId]);

	return { messages, loading };
};
export default useGetMessages;
