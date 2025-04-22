"use client";
import { useEffect } from "react";
import { useSocketContext } from "../app/_context/SocketContext";
import { useSelector, useDispatch } from "react-redux";
import { addMessage,incrementTopScrollUnseenCount } from "../redux/conversationSlice.js";
import { useAuthContext } from "../app/_context/AuthContext";

const notificationSound = '/sounds/notification.mp3';

const useListenMessages = () => {
	const { socket } = useSocketContext();
	const { messages, selectedConversation } = useSelector((state) => state.conversation);
	const dispatch = useDispatch();
	const { userId } = useAuthContext();

	useEffect(() => {
		socket?.on("newMessage", async (newMessage) => {
			newMessage.shouldShake = true;

			if (newMessage?.senderId === selectedConversation?.id) {
				dispatch(incrementTopScrollUnseenCount())
				try {
					const res = await fetch(`/api/messages/unseen/${selectedConversation?.id}?authid=${userId}`, {
						method: "POST",
						headers: { "Content-Type": "application/json" },
					});
					const data = await res.json();
					if (!res.ok || !data?.success) {
						console.error("Failed to mark messages as seen");
					} else {
						console.log("Messages marked as seen");
					}
				} catch (err) {
					console.error("Error marking messages as seen:", err);
				}
			}

			if (typeof window !== "undefined") {
				const sound = new Audio(notificationSound);
				if (sound?.play && true) {
					sound?.play()?.then(() => {
					}
					)?.catch((error) => {

					});
				}
			}
			const { body, type, sender, ...rest } = newMessage;
			const messageData = {
				type: "NEW_MESSAGE_NOTIFICATION",
				message: `${sender?.username}: ${body}`,
				user: {
					body,
					sender: { username: sender?.username }
				}
			};
			window.parent.postMessage(messageData, '*');
		
			if(newMessage?.senderId === selectedConversation?.id || newMessage?.senderId === selectedConversation?.assistanceId || newMessage?.sender?.role === "administrator") {
				dispatch(addMessage(newMessage));
			}
		});
	
		return () => {
			socket?.off("newMessage");
		};
	}, [socket, messages, dispatch, selectedConversation, userId]);
};

export default useListenMessages;
