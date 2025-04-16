"use client"
import { Send} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import useSendMessage from "../../../../hooks/useSendMessage";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import emojiRegex from "emoji-regex";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { IconButton } from "@mui/material";
const isOnlyEmoji = (text) => {
	const regex = emojiRegex();
	const matched = text.match(regex);
	return matched && matched.join('') === text;
};
const MessageInput = () => {
	const [message, setMessage] = useState("");
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const { loading, sendMessage } = useSendMessage();
	const emojiPickerRef = useRef(null);
	const handleEmojiClick = (emojiObject) => {
		setMessage((prev) => prev + emojiObject.native);
	};
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
				setShowEmojiPicker(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!message.trim()) return;
		const trimmed = message.trim();
		const messageType = isOnlyEmoji(trimmed) ? "emoji" : "text";
		await sendMessage({ body: trimmed, type: messageType });
		setMessage("");
	};
	return (
		<form className='px-4 mb-3 flex gap-2' onSubmit={handleSubmit}>
		 <div ref={emojiPickerRef} style={{ position: "relative" }}>
						<IconButton onClick={() => setShowEmojiPicker((prev) => !prev)}>
							<EmojiEmotionsIcon color="primary" />
						</IconButton>
						{showEmojiPicker && (
							<div
								style={{
									position: "absolute",
									bottom: "60px",
									left: "0",
									zIndex: 10,
									backgroundColor: "white",
									borderRadius: "8px",
									boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
								}}
							>
								 <Picker data={data} onEmojiSelect={handleEmojiClick} theme="light" />
							</div>
						)}
					</div>
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
