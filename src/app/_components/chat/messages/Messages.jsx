"use client"
import useChatScroll from "../../../../hooks/useChatScroll";
import useGetMessages from "../../../../hooks/useGetMessages";
import useListenMessages from "../../../../hooks/useListenMessages";
import MessageSkeleton from "../skeletons/MessageSkeleton";
import Message from "./Message";

const Messages = () => {
	const { loading, messages } = useGetMessages();
	useListenMessages();
	const ref = useChatScroll(messages)
	console.log(messages)
	return (
		<div className='px-4 flex-1 overflow-auto' ref={ref}>
			{loading && [...Array(3)].map((_, idx) => <MessageSkeleton key={idx} />)}

			{!loading && messages.map((message,idx) => <Message key={idx} message={message} />)}
			{!loading && messages.length === 0 && (
				<p className='flex d-block w-full h-full justify-center items-center text-slate-400'>Send a message to start the conversation</p>
			)}
		</div>
	);
};
export default Messages;
