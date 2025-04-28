"use client"
import { Send } from "lucide-react";
import { useState, useEffect, useRef, useCallback, memo } from "react";
import useSendMessage from "../../../../hooks/useSendMessage";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import emojiRegex from "emoji-regex";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import FileSelectedViews from "./FileSelectedViews"
import { useDropzone } from "react-dropzone";
import { Badge, IconButton, Tooltip } from "@mui/material";
import VoiceRecorderButton from "../../../../hooks/VoiceRecorderButton"
import VoicePreview from "./VoicePreview"
const MessageInput = ({ setReplyTo, replyTo }) => {
	const [message, setMessage] = useState("");
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const { loading, sendMessage } = useSendMessage();
	const [voiceFile, setVoiceFile] = useState(null);
	const [files, setFiles] = useState([]);
	const emojiPickerRef = useRef(null);
	const handleEmojiClick = useCallback((emojiObject) => {
		setMessage((prev) => prev + emojiObject.native);
	}, [setMessage, message]);
	const onDrop = useCallback((acceptedFiles) => {
		setFiles((prev) => [...prev, ...acceptedFiles]);
	}, []);

	const { getRootProps, getInputProps, rootRef } = useDropzone({
		onDrop,
		multiple: true,
	});
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
	const isOnlyEmoji = useCallback((text) => {
		const regex = emojiRegex();
		const matched = text.match(regex);
		return matched && matched.join('') === text;
	}, []);
	const handleSubmit = useCallback(async (e) => {
		e.preventDefault();
		const hasText = message.trim();
		const allFiles = [...files, ...(voiceFile ? [voiceFile] : [])];

		if (!hasText && allFiles.length === 0) return;

		const trimmed = message.trim();
		const messageType = isOnlyEmoji(trimmed) ? "emoji" : "text";
		const finalType = allFiles.length > 0 ? "file" : messageType;

		setMessage("");
		setFiles([]);
		setVoiceFile(null);
		setReplyTo(null);
         console.log(allFiles)
		await sendMessage({ body: trimmed, type: finalType, files: allFiles, replyTo });
	}, [message, sendMessage, files, voiceFile, isOnlyEmoji, replyTo]);


	const removeFile = useCallback((index) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
	}, []);

	const clearFiles = useCallback(() => {
		setFiles([]);
	}, []);

	return (
		<>
			{files.length > 0 && < FileSelectedViews files={files} clearFiles={clearFiles} removeFile={removeFile} />}

			{replyTo && (
				<div className="flex items-center justify-between w-1/2 max-md:w-full border-l-4 border-sky-500 bg-sky-50 dark:bg-slate-700/40 p-2 rounded-md mb-2">
					<div className="flex items-start gap-2 overflow-hidden">
						{/* Optional visual preview */}
						{replyTo?.files?.[0]?.type?.startsWith("image") && (
							<img
								src={replyTo.files[0].url}
								alt="replied-image"
								className="w-12 h-12 object-cover rounded border"
							/>
						)}
						{replyTo?.files?.[0]?.type && !replyTo.files[0].type.startsWith("image") && (
							<div className="w-12 h-12 bg-gray-200 dark:bg-slate-600 flex items-center justify-center text-xs text-gray-600 dark:text-white rounded border">
								{replyTo.files[0].name.split(".").pop().toUpperCase()}
							</div>
						)}

						{/* Message preview */}
						<div className="flex flex-col overflow-hidden">
							<p className="text-[12px] text-gray-500 dark:text-gray-300">
								Replying to <strong>{replyTo?.sender?.username || "User"}</strong>
							</p>
							{replyTo.body && (
								<p className="text-sm font-medium text-slate-800 dark:text-white truncate">
									{replyTo.body}
								</p>
							)}
							{!replyTo.body && replyTo.files?.length && (
								<p className="text-sm italic text-gray-600 dark:text-gray-300">
									{replyTo.files[0]?.type?.startsWith("image") ? "📷 Image" : `📎 ${replyTo.files[0]?.name}`}
								</p>
							)}
						</div>
					</div>

					<button
						onClick={() => setReplyTo(null)}
						className="ml-2 text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
						title="Cancel reply"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={2}
						>
							<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			)}
			<VoicePreview voiceFile={voiceFile} setVoiceFile={setVoiceFile} />

			<form className='px-4 mb-3 flex gap-4' onSubmit={handleSubmit}>
				<div ref={emojiPickerRef} style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
					<Tooltip title="Emoji" arrow>
						<IconButton onClick={() => setShowEmojiPicker((prev) => !prev)}>
							<EmojiEmotionsIcon color="primary" />
						</IconButton>
					</Tooltip>
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
					<input {...getInputProps()} />
					<div className=''>
						<Tooltip title="Attach files" arrow>
							<IconButton color="primary" component="span" {...getRootProps()} disabled={`${files.length >= 3 ? "disabled" : ""}`}>
								<Badge badgeContent={files.length} color="secondary">
									<CloudUploadIcon fontSize="small" />
								</Badge>
							</IconButton>
						</Tooltip>
					</div>
					{!voiceFile && (
						<VoiceRecorderButton
							onRecorded={(file) => setVoiceFile(file)}
						/>
					)}

				</div>
				<div className='w-full relative flex items-center' >

					<input
						type='text'
						className=' text-sm rounded-full block w-full pl-6 pr-14 p-3  bg-gray-100  text-slate-800 outline-none'
						placeholder='Send a message'
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						ref={rootRef}
					/>

					<button type='submit' className='absolute cursor-pointer inset-y-0 end-2 flex items-center pe-3'>
						{loading ? <span className='loading loading-spinner' /> : <Send className='w-6 h-6 text-slate-400' />}
					</button>
				</div>

			</form>
		</>
	);
};
export default memo(MessageInput);
