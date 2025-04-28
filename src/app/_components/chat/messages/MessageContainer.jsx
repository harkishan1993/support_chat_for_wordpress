"use client"
import MessageInput from "./MessageInput";
import Messages from "./Messages";
import { useSelector } from "react-redux";
import { MessageCircle } from "lucide-react";
import useListenMessages from "../../../../hooks/useListenMessages";
import { useAuthContext } from "../../../_context/AuthContext";
import { useState, useCallback } from "react";
import VoiceCallUI from "../../call/VoiceCallUI"
const NoChatSelected = () => {
	const { authUser } = useAuthContext();
	return (
		<div className='flex items-center justify-center w-full h-full'>
			<div className='px-4 text-center sm:text-lg md:text-xl text-gray-400 font-semibold flex flex-col items-center gap-2'>
				<p>Welcome 👋 {authUser?.username} ❄</p>
				<p>Select a chat to start messaging</p>
				<MessageCircle className='text-8xl text-center' width={50} height={50} />
			</div>
		</div>
	);
};
const MessageContainer = () => {
	const { selectedConversation } = useSelector((state) => state.conversation)
	const [replyTo, setReplyTo] = useState(null);

	const handleReply = useCallback((msg) => {
		setReplyTo(msg);
	}, []);
	useListenMessages();
	return (
		<div className='w-full flex flex-col'>
			{!selectedConversation ? (
				<NoChatSelected />
			) : (
				<>
					{/* Header */}
					<div className='border-b-1 border-slate-300 px-4 py-2 mb-2 flex justify-between items-center'>
						{/* <span className='label-text font-bold text-gray-600'>To:</span>{" "} */}
						<span className='text-slate-500 font-bold capitalize'>{selectedConversation.username}</span>
						<VoiceCallUI currentUser={selectedConversation} />
					</div>
					<Messages onReply={handleReply} />
					<MessageInput setReplyTo={setReplyTo} replyTo={replyTo} />
				</>
			)}
		</div>
	);
};
export default MessageContainer;


