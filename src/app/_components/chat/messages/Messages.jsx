"use client"
import { useEffect, useRef, useState, useMemo, memo } from "react";
import useGetMessages from "../../../../hooks/useGetMessages";
import Message from "./Message";
import { groupMessagesByDate } from "../../../../utils/Dayfind.js";
import { useAuthContext } from "../../../_context/AuthContext";
import { useSelector, useDispatch } from "react-redux";
import { setMessages,resetTopScrollUnseenCount } from "../../../../redux/conversationSlice";
import LoaderMsg from "./LoaderMsg";
const Messages = () => {
	const { selectedConversation, topScrollUnseenCount } = useSelector((state) => state.conversation)
	const { loading, messages } = useGetMessages();
	const [showStickyDate, setShowStickyDate] = useState(false);
	const [activeDate, setActiveDate] = useState("");
	const [isFetchingMore, setIsFetchingMore] = useState(false);
	const [showScrollToBottom, setShowScrollToBottom] = useState(false);
	const [hasMore, setHasMore] = useState(false);
	const [bottom, setBottom] = useState(null);
	const messagesEndRef = useRef(null);
	const dispatch = useDispatch();
	const { userId } = useAuthContext();
	let scrollTimeout = useRef(null);
	const ref = useRef(null);

	useEffect(() => {
		if (messages.length === 0) return;
		const BOTTOM_THRESHOLD = 100;
		if (bottom <= BOTTOM_THRESHOLD) {
			const scrollContainer = ref.current;
			const images = scrollContainer?.querySelectorAll("img") || [];

			let loadedCount = 0;

			const checkAllImagesLoaded = () => {
				loadedCount++;
				if (loadedCount === images.length) {
					messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
				}
			};

			if (images.length === 0) {
				messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
			} else {
				images.forEach((img) => {
					if (img.complete) {
						checkAllImagesLoaded();
					} else {
						img.addEventListener("load", checkAllImagesLoaded);
						img.addEventListener("error", checkAllImagesLoaded);
					}
				});
			}
			return () => {
				images.forEach((img) => {
					img.removeEventListener("load", checkAllImagesLoaded);
					img.removeEventListener("error", checkAllImagesLoaded);
				});
			};
		}
	}, [messages]);

	useEffect(() => {
		if (!ref.current || messages.length === 0) return;

		const scrollContainer = ref.current;
		if (messages.length <= 20) {
			const timeout = setTimeout(() => {
				scrollContainer.scrollTop = scrollContainer.scrollHeight;
			}, 0);

			return () => clearTimeout(timeout);
		}
	}, [selectedConversation, messages]);


	useEffect(() => {
		const scrollContainer = document.querySelector(".chat-scroll-container");
		clearTimeout(scrollTimeout.current);
		scrollTimeout.current = setTimeout(() => {
			setShowStickyDate(false); // hide after scroll stops
		}, 1000);
		const handleScroll = async () => {
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
			const distanceFromBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight;
			// Check if scrolled to the top
			setBottom(distanceFromBottom);
			if (scrollContainer.scrollTop === 0 && !isFetchingMore && messages.length > 0) {
				setIsFetchingMore(true);
				const oldestMessage = messages[0];
				const prevHeight = scrollContainer.scrollHeight;

				try {
					const res = await fetch(
						`${origin}/api/messages/${selectedConversation.id}?id=${userId}&cursor=${oldestMessage.id}&limit=20`
					);
					const olderMessages = await res.json();
					if (olderMessages.length === 0) setHasMore(true);
					else {
						dispatch(setMessages([...olderMessages, ...messages]));
						await new Promise((resolve) => setTimeout(resolve, 0));
						scrollContainer.scrollTop = scrollContainer.scrollHeight - prevHeight;
					}
				} catch (err) {
					console.error("Error fetching older messages:", err);
				} finally {
					setIsFetchingMore(false);
				}
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
	}, [activeDate, messages, selectedConversation, userId, isFetchingMore, hasMore, dispatch]);

	useEffect(() => {
		if (messages.length === 0) {
			setActiveDate("");
			setShowStickyDate(false);
		}
		const BOTTOM_THRESHOLD = 100;
		if (bottom <= BOTTOM_THRESHOLD) {
			if (messagesEndRef.current) {
				messagesEndRef.current.scrollIntoView({ block: "end" });
			}
		} else {
			setShowScrollToBottom(true)
		}
	}, [messages]);

	useEffect(() => {
		const BOTTOM_THRESHOLD = 100;
		if (bottom <= BOTTOM_THRESHOLD) {
			setShowScrollToBottom(false)
			dispatch(resetTopScrollUnseenCount())
		} else {
			setShowScrollToBottom(true)
		}
	}, [messages, bottom]);


	const lastSeenMessageId = useMemo(() => {
		return [...messages]
			.reverse()
			.find(
				(m) =>
					m.senderId === userId &&
					m.messageStatus?.some(
						(status) =>
							status.userId === selectedConversation?.id && status.seen
					)
			)?.id;
	}, [messages]);

	const groupedMessages = useMemo(() => {
		return groupMessagesByDate(messages);
	}, [messages]);

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

			{isFetchingMore && <LoaderMsg />}
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
								return <Message key={idx} message={message} premessage={msgs[idx - 1]} lastSeenMessageId={lastSeenMessageId} />
							})
						}
					</div>
				)
			})}
			<div ref={messagesEndRef}></div>
			{!loading && messages.length === 0 && (
				<p className='flex d-block w-full h-full justify-center items-center text-slate-400'>Send a message to start the conversation</p>
			)}
			{showScrollToBottom && (
				<div className="fixed bottom-20 right-4 z-20 animate-bounce-in">
					<button
						className="relative cursor-pointer bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-full shadow-xl hover:scale-110 hover:shadow-blue-500/50 transition-all duration-300 ease-in-out"
						onClick={() => {
							messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
						}}
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
							<path d="M12 16.5l-6-6h4V3h4v7.5h4l-6 6z" />
						</svg>
						{topScrollUnseenCount > 0 && (
							<span className="absolute -top-1.5 -right-1.5 bg-red-600 text-xs font-semibold text-white rounded-full px-1.5 py-0.5 shadow-md animate-fade-in">
								{topScrollUnseenCount}
							</span>
						)}
					</button>
				</div>

			)}

		</div>
	);
};
export default memo(Messages);
