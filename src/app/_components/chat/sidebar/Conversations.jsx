"use client"
import useGetConversations from "../../../../hooks/useGetConversations";
import { getRandomEmoji } from "../../../../utils/emojis.js";
import Conversation from "./Conversation";

const Conversations = () => {
	const { conversations, loading } = useGetConversations();
	return (
		<div className='py-2 flex flex-col overflow-auto'>
			{conversations?.map((conversation) => (
				<Conversation key={conversation.id} conversation={conversation} emoji={getRandomEmoji()} />
			))}
			{!loading && conversations.length === 0 && (
				<p className='flex d-block w-full h-full justify-center items-center text-slate-400'>No Found the conversation</p>
			)}
			{loading ? <span className='loading loading-spinner mx-auto' /> : null}
		</div>
	);
};
export default Conversations;
