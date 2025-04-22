"use client"
import { useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addMessage } from "../redux/conversationSlice.js";
import toast from "react-hot-toast";
import { origin } from "../utils/origin.js";
import { useAuthContext } from "../app/_context/AuthContext";
const useSendMessage = () => {
	const [loading, setLoading] = useState(false);
	const {selectedConversation} = useSelector((state) => state.conversation);
	const dispatch = useDispatch();
		const { userId,authUser } = useAuthContext();
	const sendMessage = useCallback(async ({body, type, files}) => {
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
			files:fileMetadata,
			type,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			sender: {
			  username: authUser?.username ,
			  role: authUser?.role
			},
			messageStatus: [],
		  };
		dispatch(addMessage(optimisticMessage))
		const formData = new FormData();
		files.forEach((file) => formData.append("files", file));
		formData.append("message", body);
		formData.append("type", type);
		setLoading(true);
		try {
			const res = await fetch(`${origin}/api/messages/send/${selectedConversation.id}?id=${userId}`, {
				method: "POST",
				body: formData
			});
			await res.json();
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	},[selectedConversation,userId,dispatch,origin]);

	return { sendMessage, loading };
};
export default useSendMessage;
