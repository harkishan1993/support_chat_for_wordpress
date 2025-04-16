"use client"
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setMessages } from "../redux/conversationSlice.js";
import toast from "react-hot-toast";
import { origin } from "../utils/origin.js";
import { useAuthContext } from "../app/_context/AuthContext.jsx";
import { useSocketContext } from "../app/_context/SocketContext";
import useSendRequestForAsignAssistance from "./wp/useSendRequestForAsignAssistance.js"
import { store } from "../redux/store.js";
const useSendMessageforuser = () => {
	const [loading, setLoading] = useState(false);
	const { socket } = useSocketContext();
	const { messages } = useSelector((state) => state.conversation);
	const dispatch = useDispatch();
	const { userId, authUser } = useAuthContext();
	const { getUserDataWithAsingAssistance } = useSendRequestForAsignAssistance()
	useEffect(() => {
		socket?.on("acceptAproval", async ({ _, userId, asignId }) => {
			const res = await fetch(`${origin}/api/messages/send/${userId}?id=${asignId}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ message: "Welcome to the conversation", type: "welcome" }),
			});
			const data = await res.json();
			const conversationExists = messages.some(
				(conv) => conv.id === data.conversationId
			);
			let updatedConversations;
			if (conversationExists && data) {
				updatedConversations = messages.map((conversation) => {
					if (conversation.id === data.conversationId) {
						return {
							...conversation,
							messages: [...conversation.messages, data], // Append new message
						};
					}
					return conversation;
				});
			} else {
				updatedConversations = [
					...messages, {
						id: data.conversationId,
						messages: [data],
						participants: []
					}
				]
			}
		});

		return () => {
			socket?.off("acceptAproval");
		};
	}, [messages, dispatch, socket]);
	const sendMessage = async ({ body, type }) => {
		setLoading(true);
		let botId = "cm8wpc4hv0001dnnkhgmea0he"
		let receivedId = "cm8wpc4hv0001dnnkhgmea0he"
		let bot = false
		try {
			const resUser = await fetch(`${origin}/api/messages/userbyid?id=${userId}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				}
			});
			const userDataWithConve = await resUser.json()
		
			if (!!userDataWithConve?.assistanceId) {
				receivedId = userDataWithConve?.assistanceId
				bot = false
			} else {
				receivedId = botId
				bot = true
			}
			let updatedConversations;
			fetch(`${origin}/api/messages/send/${receivedId}?id=${userId}&user=${userId}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ message: body, type: type }),
			}).then(async (res) => {
				return await res.json()
			}).then(async (data) => {
				const conversationExists = messages.some(
					(conv) => conv.id === data.conversationId
				);
				if (conversationExists) {
					updatedConversations = messages.map((conversation) => {
						if (conversation.id === data.conversationId) {
							return {
								...conversation,
								messages: [...conversation.messages, data], // Append new message
							};
						}
						return conversation;
					});
				} else {
					updatedConversations = [
						...messages, {
							id: data.conversationId,
							messages: [data],
							participants: []
						}
					]
				}
				dispatch(setMessages(updatedConversations))
			}).catch((error) => {
				toast.error(error.message);
				console.log(error)
			}).finally(async () => {
				if (bot) {
					const res = await fetch(`${origin}/api/messages/send/${userId}?id=${receivedId}&user=${userId}`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							message: "We have received your request and will assign an agent shortly.",
							type: "text"
						}),
					});
					await fetch(`${origin}/api/messages/notification`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							type: "request",
							from: "user",
							to:"admin",
							userId: resUser.id,
							name: authUser.username,
						}),
					});
					const data = await res.json();

					// 🛑 Don't reuse `updatedConversations`, use current Redux state
					const updatedWithBot = (() => {
						const latestMessages = store.getState().conversation.messages; // or pass messages as fresh prop

						const conversationExists = latestMessages.some(
							(conv) => conv.id === data.conversationId
						);

						if (conversationExists) {
							return latestMessages.map((conversation) => {
								if (conversation.id === data.conversationId) {
									return {
										...conversation,
										messages: [...conversation.messages, data],
									};
								}
								return conversation;
							});
						} else {
							return [
								...latestMessages,
								{
									id: data.conversationId,
									messages: [data],
									participants: [],
								},
							];
						}
					})();

					setTimeout(() => {
						dispatch(setMessages(updatedWithBot));
					}, 500);
				}
				setLoading(false);
			});
			if(!userDataWithConve?.assistanceId){
				await getUserDataWithAsingAssistance()
			}
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
		
	};

	return { sendMessage, loading};
};
export default useSendMessageforuser;
