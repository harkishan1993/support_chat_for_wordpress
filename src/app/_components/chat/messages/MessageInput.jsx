"use client"
import { Send } from "lucide-react";
import { useState } from "react";
import useSendMessage from "../../../../hooks/useSendMessage";

const MessageInput = () => {
	const [message, setMessage] = useState("");

	const { loading, sendMessage } = useSendMessage();

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!message.trim()) return;
		await sendMessage(message);
		setMessage("");
	};
	return (
		<form className='px-4 mb-3' onSubmit={handleSubmit}>
			<div className='w-full relative'>
				<input
					type='text'
					className=' text-sm rounded-full block w-full pl-6 pr-14 p-3  bg-gray-100  text-slate-800 outline-none'
					placeholder='Send a message'
					value={message}
					onChange={(e) => setMessage(e.target.value)}
				/>
				<button type='submit' className='absolute cursor-pointer inset-y-0 end-2 flex items-center pe-3'>
					{loading ? <span className='loading loading-spinner' /> : <Send className='w-6 h-6 text-slate-400' />}
				</button>
			</div>
		</form>
	);
};
export default MessageInput;
