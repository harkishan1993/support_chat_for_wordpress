"use client";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { origin } from "../utils/origin.js";
import { useAuthContext } from "../app/_context/AuthContext";
import { useSocketContext } from "../app/_context/SocketContext.jsx";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedConversation, setConversations } from "../redux/conversationSlice.js";


const useGetConversations = () => {
	const [loading, setLoading] = useState(false);
	const { userId } = useAuthContext();
	const { socket } = useSocketContext();
	const dispatch = useDispatch();
	const { selectedConversation, conversations} = useSelector((state) => state.conversation);

	// ✅ Stable getConversations function
	const getConversations = useCallback(async () => {
		if (!userId) return;

		setLoading(true);
		try {
			const res = await fetch(`${origin}/api/messages/conversations?id=${userId}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
			});
			const data = await res.json();
			data.map((conversation) => {
				if (conversation?.id === selectedConversation?.id) {
					conversation.unseenCount = 0;
				}
				return conversation;
			}
			);
			dispatch(setConversations(data));
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	}, [userId, dispatch, selectedConversation]);

	// ✅ Call it once on mount or userId change
	useEffect(() => {
		getConversations();
	}, [getConversations]);

	// ✅ Handle socket event once
	useEffect(() => {
		if (!socket) return;

		const handleApproval = ({ assingOrNot, userId: approvalUserId }) => {
		
			if (assingOrNot) {
				toast.error("removed from conversation");
				if (selectedConversation?.id === approvalUserId) {
					dispatch(setSelectedConversation(null));
				}
			} else {
				toast.success("added to conversation");
			}
			getConversations();
		};

		socket.on("acceptAproval", handleApproval);
		return () => {
			socket.off("acceptAproval", handleApproval);
		};
	}, [socket, getConversations, selectedConversation, dispatch]);
	useEffect(() => {
		if (!socket) return;
		const handleNewConversation = () => {
			getConversations()
		};
		socket.on("unread", handleNewConversation);
		return () => {
			socket.off("unread", handleNewConversation);
		};
	}, [socket, getConversations]);
	return { loading, conversations};
};

export default useGetConversations;
