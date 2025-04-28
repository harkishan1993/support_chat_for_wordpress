"use client"
import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { addMessage, removeLastMessage } from "../redux/conversationSlice.js";
import toast from "react-hot-toast";
import { origin } from "../utils/origin.js";
import { useAuthContext } from "../app/_context/AuthContext.jsx";
import { useSocketContext } from "../app/_context/SocketContext";
import useSendRequestForAsignAssistance from "./wp/useSendRequestForAsignAssistance.js"
const useSendMessageforuser = () => {
	const [loading, setLoading] = useState(false);
	const { socket } = useSocketContext();
	const { messages } = useSelector((state) => state.conversation);
	const dispatch = useDispatch();
	const { userId, authUser, setAuthUser } = useAuthContext();
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
			await res.json();
			const resUser = await fetch(`${origin}/api/messages/userbyid?id=${userId}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				}
			});
			const userDataWithConve = await resUser.json()
			setAuthUser(userDataWithConve)
		});
		return () => {
			socket?.off("acceptAproval");
		};
	}, [messages, dispatch, socket]);
	const sendMessage = useCallback(async ({ body, type, files, replyTo }) => {
		setLoading(true);
		let botId = "cm8wpc4hv0001dnnkhgmea0he"
		let receivedId = "cm8wpc4hv0001dnnkhgmea0he"
		let bot = false
		try {

			if (!!authUser?.assistanceId) {
				receivedId = authUser?.assistanceId
				bot = false
			} else {
				receivedId = botId
				bot = true
			}
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

			dispatch(addMessage(optimisticMessage));
			const formData = new FormData();
			files.forEach((file) => formData.append("files", file));
			formData.append("message", body);
			formData.append("type", type);
			formData.append("replyToMessageId", replyTo?.id)
			fetch(`${origin}/api/messages/send/${receivedId}?id=${userId}&user=${userId}`, {
				method: "POST",
				body: formData,
			})
				.then(async (res) => {
					if (!res.ok) {
						const text = await res.text();
						throw new Error(text || `Server responded with status ${res.status}`);
					}
					return res.json()
				})
				.then((_) => {
				})
				.catch((error) => {
					toast.custom((t) => (
						<div
							className={`bg-white shadow-lg rounded px-4 py-3 text-amber-800 border border-amber-600 ${t.visible ? "animate-enter" : "animate-leave"}`}
							dangerouslySetInnerHTML={{ __html: error.message || "Something went wrong." }}
						/>
					));
					dispatch(removeLastMessage());
					console.log(error);
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
								to: "admin",
								userId: authUser?.id,
								name: authUser.username,
							}),
						});
						const data = await res.json();
						(() => {
							dispatch(addMessage(data))
						})();

					}
					setLoading(false);
				});
			if (!authUser?.assistanceId) {
				await getUserDataWithAsingAssistance()
			}
		} catch (error) {
			toast.error(error.message);
		}

	}, [dispatch, authUser, userId, getUserDataWithAsingAssistance, origin]);

	return { sendMessage, loading };
};
export default useSendMessageforuser;

