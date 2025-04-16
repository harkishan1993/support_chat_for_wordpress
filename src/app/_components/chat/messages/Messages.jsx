"use client"
import { useEffect, useRef, useState } from "react";
import useChatScroll from "../../../../hooks/useChatScroll";
import useGetMessages from "../../../../hooks/useGetMessages";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import Message from "./Message";
import { groupMessagesByDate } from "../../../../utils/Dayfind.js";
import { useAuthContext } from "../../../_context/AuthContext";
import { useSelector } from "react-redux";
const Messages = () => {
	const { selectedConversation } = useSelector((state) => state.conversation)
	const { loading, messages } = useGetMessages();
	const [showStickyDate, setShowStickyDate] = useState(false);
	const [activeDate, setActiveDate] = useState("");
	const { userId } = useAuthContext();
	let scrollTimeout = useRef(null);
	useEffect(() => {
		const scrollContainer = document.querySelector(".chat-scroll-container");
		clearTimeout(scrollTimeout.current);
		scrollTimeout.current = setTimeout(() => {
			setShowStickyDate(false); // hide after scroll stops
		}, 1000);
		const handleScroll = () => {
			// Get current visible date group
			const dateGroups = document.querySelectorAll("[data-date-group]");
			let currentDate = "";

			dateGroups.forEach((group) => {
				const rect = group.getBoundingClientRect();
				if (rect.top <= 100) {
					currentDate = group.getAttribute("data-label");
				}
			});

			if (currentDate && currentDate !== activeDate) {
				setActiveDate(currentDate);
			}

			setShowStickyDate(true); // show during scroll

			clearTimeout(scrollTimeout.current);
			scrollTimeout.current = setTimeout(() => {
				setShowStickyDate(false); // hide after scroll stops
			}, 1000);
		};

		if (scrollContainer) {
			scrollContainer.addEventListener("scroll", handleScroll);
		}

		return () => {
			if (scrollContainer) {
				scrollContainer.removeEventListener("scroll", handleScroll);
			}
			clearTimeout(scrollTimeout.current);
		};
	}, [activeDate]);
	useEffect(() => {
		if (messages.length === 0) {
			setActiveDate("");
			setShowStickyDate(false);
		}
	}, [messages]);

	const lastSeenMessageId = [...messages]
	.reverse()
	.find(
	  (m) =>
		m.senderId === userId &&
		m.messageStatus?.some(
		  (status) =>
			status.userId === selectedConversation?.id && status.seen
		)
	)?.id;
	const ref = useChatScroll(messages)
	const groupedMessages = groupMessagesByDate(messages);
	return (
		<div className='px-4 flex-1 overflow-auto chat-scroll-container mb-3' ref={ref} >
			{activeDate && <div className="w-full flex justify-center sticky top-1 z-10 bg-transparent">
				<div
					className={`absolute  bg-gray-300 text-slate-700 text-xs px-4 py-1 rounded transition-transform duration-300 ${showStickyDate ? "opacity-100 translate-y-0" : "-translate-y-[120%]"
						}`}
				>
					{activeDate}
				</div>
			</div>}
			{loading && [...Array(3)].map((_, idx) => <MessageSkeleton key={idx} />)}

			{!loading && Object.entries(groupedMessages).map(([label, msgs]) => {
				return (
					<div key={label} data-label={label} data-date-group>
						<div className="flex items-center gap-2 my-4 text-gray-500 text-xs">
							<div className="flex-grow border-t border-gray-300"></div>
							<span className="px-2 whitespace-nowrap">{label}</span>
							<div className="flex-grow border-t border-gray-300"></div>
						</div>
						{
							msgs.map((message, idx) => {
								return <Message key={idx} message={message} premessage={msgs[idx -1]} lastSeenMessageId={lastSeenMessageId} />
							})
						}
					</div>
				)
			})}
			{!loading && messages.length === 0 && (
				<p className='flex d-block w-full h-full justify-center items-center text-slate-400'>Send a message to start the conversation</p>
			)}
		</div>
	);
};
export default Messages;
