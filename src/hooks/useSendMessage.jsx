"use client"
import { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addMessage, removeLastMessage } from "../redux/conversationSlice.js";
import toast from "react-hot-toast";
import { origin } from "../utils/origin.js";
import { useAuthContext } from "../app/_context/AuthContext";
const useSendMessage = () => {
	const [loading, setLoading] = useState(false);
	const { selectedConversation } = useSelector((state) => state.conversation);
	const dispatch = useDispatch();
	const { userId, authUser } = useAuthContext();
	const sendMessage = useCallback(async ({ body, type, files, replyTo }) => {
		if (!selectedConversation) return;
		const tempId = `temp-${Date.now()}`;
		const fileMetadata = files.map(file => ({
			name: file.name,
			type: file.type,
			size: file.size,
			url: URL.createObjectURL(file), // or from server after upload
		}));
		const optimisticMessage = {
			id: tempId,
			conversationId: "", // we'll update if needed
			senderId: userId,
			body,
			files: fileMetadata,
			type,
			replyTo,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			sender: {
				username: authUser?.username,
				role: authUser?.role
			},
			messageStatus: [],
		};
		dispatch(addMessage(optimisticMessage))
		const formData = new FormData();
		files.forEach((file) => formData.append("files", file));
		formData.append("message", body);
		formData.append("type", type);
		formData.append("replyToMessageId", replyTo?.id)
		setLoading(true);
		try {
			const res = await fetch(`${origin}/api/messages/send/${selectedConversation.id}?id=${userId}`, {
				method: "POST",
				body: formData
			});
			if (!res.ok) {
				const text = await res.text();
				throw new Error(text || `Server responded with status ${res.status}`);
			}
			const data = await res.json();
			if (data) {
				setLoading(false);
			}
		} catch (error) {
			toast.custom((t) => (
				<div
					className={`bg-white shadow-lg rounded px-4 py-3 text-amber-800 border border-amber-600 ${t.visible ? "animate-enter" : "animate-leave"}`}
					dangerouslySetInnerHTML={{ __html: error.message || "Something went wrong." }}
				/>
			));
			dispatch(removeLastMessage())
			setLoading(false);
		}
	}, [selectedConversation, userId, dispatch, origin]);

	return { sendMessage, loading };
};
export default useSendMessage;
