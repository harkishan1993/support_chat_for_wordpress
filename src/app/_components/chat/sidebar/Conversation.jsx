"use client";
import { useSocketContext } from "../../../_context/SocketContext";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedConversation, updateConversation } from "../../../../redux/conversationSlice.js";
import { useAuthContext } from "../../../_context/AuthContext";
import { useEffect, useState } from "react";

const Conversation = ({ conversation, emoji }) => {
	const dispatch = useDispatch();
	const { selectedConversation } = useSelector((state) => state.conversation);
	const [online, setOnline] = useState(false);
	const isSelected = selectedConversation?.id === conversation.id;
	const { onlineUsers } = useSocketContext();
	useEffect(() => {
		const isOnline = onlineUsers.includes(conversation.id);
		if (isOnline) {
			setOnline(true);
		} else {
			setOnline(false);
		}
	}, [onlineUsers]);
	const { userId } = useAuthContext();
	const handleClick = async () => {
		const updatedConversation = { ...conversation, unseenCount: 0 };
		dispatch(setSelectedConversation(updatedConversation));
		dispatch(updateConversation(updatedConversation));
		try {
			const res = await fetch(`/api/messages/unseen/${conversation.id}?authid=${userId}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
			});
			const data = await res.json();
			if (!res.ok || !data?.success) {
				console.error("Failed to mark messages as seen");
			} else {
			}
		} catch (err) {
			console.error("Error marking messages as seen:", err);
		}
	};

	return (
		<>
			<div
				className={`flex gap-2 items-center hover:bg-sky-200 rounded p-2 py-1 cursor-pointer ${isSelected ? "bg-sky-200" : ""
					}`}
				onClick={handleClick}
			>
				<div className='flex flex-col flex-1'>
					<div className='flex gap-3 justify-between items-center py-1 px-2'>
						<div className='flex gap-2'>
							<span
								className={`text-xs w-[24px] ${conversation.unseenCount > 99 ? "w-[30px]" : "w-[24px]"} h-[24px] rounded-full flex items-center justify-center 
		                       text-white font-semibold
		                        ${conversation?.unseenCount > 0
										? "bg-slate-600"
										: "border border-gray-400 text-transparent"}
	                            `}
							>
								{conversation?.unseenCount > 0 && (conversation.unseenCount > 99 ? "99+" : conversation.unseenCount)}
							</span>
							<p className='font-semibold text-gray-600 text-sm md:text-md'>
								{conversation?.username}
							</p>
						</div>
						<span className='md:inline-block relative w-2 h-2'>
							<span
								className={`absolute top-0 left-0 w-2 h-2 rounded-full ${online ? "bg-green-500" : ""
									}`}
							></span>
							{
								online && (
									<span className='absolute top-0 left-0 w-2 h-2 rounded-full bg-green-400 animate-ping'></span>
								)
							}
						</span>
					</div>
				</div>
			</div>
			<div className='divider my-0 py-0 h-1' />
		</>
	);
};

export default Conversation;
