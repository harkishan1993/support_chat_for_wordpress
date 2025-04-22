"use client"
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setMessages, upsertMessage } from "../redux/conversationSlice.js";
import { useSocketContext } from "../app/_context/SocketContext";
import toast from "react-hot-toast";
import { origin } from "../utils/origin.js";
import { useAuthContext } from "../app/_context/AuthContext";
const useGetMessages = () => {
	const { socket } = useSocketContext();
	const [loading, setLoading] = useState(false);
	const {messages, selectedConversation} = useSelector((state) => state.conversation);
	const dispatch = useDispatch();
	const { userId } = useAuthContext();
	useEffect(() => {
		const getMessages = async () => {
			if (!selectedConversation) return;
			setLoading(true);
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
		const getLatsMessages = async () => {
			if (!selectedConversation) return;
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
		socket?.on("seenmsg", async () => {
			getLatsMessages();
		});
		return () => {
			socket?.off("seenmsg");
		}
	}, [selectedConversation,dispatch,userId, socket]);

	return { messages, loading };
};
export default useGetMessages;
