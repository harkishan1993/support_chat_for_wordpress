"use client"
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setMessages } from "../redux/conversationSlice.js";
import toast from "react-hot-toast";
import { origin } from "../utils/origin.js";
import { useAuthContext } from "../app/_context/AuthContext";
const useSendMessage = () => {
	const [loading, setLoading] = useState(false);
	const {messages,  selectedConversation} = useSelector((state) => state.conversation);
	const dispatch = useDispatch();
		const { userId } = useAuthContext();
	const sendMessage = async ({body,type}) => {
		if (!selectedConversation) return;
		setLoading(true);
		try {
			const res = await fetch(`${origin}/api/messages/send/${selectedConversation.id}?id=${userId}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ message: body, type: type }),
			});
			const data = await res.json();
			dispatch(setMessages([...messages, data]))
			
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return { sendMessage, loading };
};
export default useSendMessage;
