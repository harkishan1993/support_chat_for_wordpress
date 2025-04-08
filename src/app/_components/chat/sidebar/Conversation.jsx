"use client"
import { useSocketContext } from "../../../_context/SocketContext";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedConversation } from "../../../../redux/conversationSlice.js";
const Conversation = ({ conversation, emoji }) => {
	const dispatch = useDispatch()
	const { selectedConversation } = useSelector(state => state.conversation);
	const isSelected = selectedConversation?.id === conversation.id;
	const { onlineUsers } = useSocketContext();
	const isOnline = onlineUsers.includes(conversation.id);

	return (
		<>
			<div
				className={`flex gap-2 items-center hover:bg-sky-200 rounded p-2
				py-1 cursor-pointer ${isSelected ? "bg-sky-200" : ""}`}
				onClick={() => dispatch(setSelectedConversation(conversation))}
			>
				{/* <div className={`avatar ${isOnline ? "online" : ""}`}>
					<div className='w-8 md:w-12 rounded-full'>
						<Image src={conversation?.profilePic} alt='user avatar' width={30} height={30} priority={true} />
					</div>
				</div> */}
				<div className='flex flex-col flex-1'>
					<div className='flex gap-3 justify-between items-center py-1 px-2'>
						<p className='font-semibold text-gray-600 text-sm md:text-md'>
							{conversation?.username}
						</p>

						{/* Wave effect status dot */}
						<span className='hidden md:inline-block relative w-3 h-3'>
							<span
								className={`absolute top-0 left-0 w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'
									}`}
							></span>
							{isOnline && (
								<span className='absolute top-0 left-0 w-3 h-3 rounded-full bg-green-400 animate-ping'></span>
							)}
						</span>
					</div>
				</div>


			</div>
			<div className='divider my-0 py-0 h-1' />
		</>
	);
};
export default Conversation;
