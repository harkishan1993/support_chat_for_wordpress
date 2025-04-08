"use client"
import { useEffect } from "react";
import { useSocketContext } from "../app/_context/SocketContext";
import { useSelector, useDispatch } from "react-redux";
import { setMessages } from "../redux/conversationSlice.js";
const notificationSound = '/sounds/notification.mp3';
const useListenMessages = () => {
	const { socket } = useSocketContext();
	const { messages } = useSelector((state) => state.conversation);
	const dispatch = useDispatch();
	useEffect(() => {
		socket?.on("newMessage", (newMessage) => {
			newMessage.shouldShake = true;
			const sound = new Audio(notificationSound);
			sound.play();
			dispatch(setMessages([...messages, newMessage]));
		});

		return () => {
			socket?.off("newMessage");
		};
	}, [socket, messages,dispatch]);
};
export default useListenMessages;
