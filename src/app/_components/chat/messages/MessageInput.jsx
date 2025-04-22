"use client"
import { Send } from "lucide-react";
import { useState, useEffect, useRef, useCallback, memo } from "react";
import useSendMessage from "../../../../hooks/useSendMessage";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import emojiRegex from "emoji-regex";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import CloseIcon from "@mui/icons-material/Close";
import { useDropzone } from "react-dropzone";
import { Badge, Box, Button, Card, CardContent, IconButton, Tooltip, Typography } from "@mui/material";

const MessageInput = () => {
	const [message, setMessage] = useState("");
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const { loading, sendMessage } = useSendMessage();

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
		if (!message.trim() && files.length === 0) return;

		const trimmed = message.trim();
		const messageType = isOnlyEmoji(trimmed) ? "emoji" : "text";
		const whenfile = files.length > 0 ? "file" : messageType;

		setMessage("");
		setFiles([]);
		await sendMessage({ body: trimmed, type: whenfile, files: files });
	}, [message, sendMessage, files, isOnlyEmoji]);
	const removeFile = useCallback((index) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
	}, []);

	const clearFiles = useCallback(() => {
		setFiles([]);
	}, []);

	return (
		<>

			{files.length > 0 && (
				<Box className="px-4 mb-2 flex flex-wrap gap-3 justify-start">
					{files.map((file, idx) => {
						const isImage = file.type.startsWith("image/");
						const fileUrl = URL.createObjectURL(file);
						const fileExt = file.name.split('.').pop()?.toUpperCase();

						return (
							<Card key={idx} sx={{ width: 120, p: 1, position: "relative", display: "flex", flexDirection: "column" }}>
								<IconButton
									size="small"
									onClick={() => removeFile(idx)}
									sx={{ position: "absolute", top: 2, right: 2, zIndex: 10 }}
									color="error"
								>
									<CloseIcon fontSize="small" />
								</IconButton>
								<CardContent sx={{ p: 0, textAlign: "center" }}>
									{isImage ? (
										<img
											src={fileUrl}
											alt={file.name}
											style={{
												maxWidth: "100%",
												objectFit: "cover",
												borderRadius: "6px",
											}}
										/>
									) : (
										<Box
											sx={{
												width: "100%",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												bgcolor: "grey.100",
												borderRadius: "6px",
											}}
										>
											<Typography variant="body2" fontWeight="bold">
												{fileExt}
											</Typography>
										</Box>
									)}
									<Typography
										variant="caption"
										noWrap
										title={file.name}
										sx={{ mt: 0.5, display: "block" }}
									>
										{file.name}
									</Typography>
								</CardContent>
							</Card>
						);
					})}
					<Button size="small" variant="outlined" color="error" onClick={clearFiles}>
						Clear All
					</Button>
				</Box>
			)}

			<form className='px-4 mb-3 flex gap-4' onSubmit={handleSubmit}>
				<div ref={emojiPickerRef} style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
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
					<input {...getInputProps()} />
					<div className=''>
						<Tooltip title="Attach files">
							<IconButton color="primary" component="span" {...getRootProps()} disabled={`${files.length >= 3 ? "disabled" : ""}`}>
								<Badge badgeContent={files.length} color="secondary">
									<CloudUploadIcon fontSize="small" />
								</Badge>
							</IconButton>
						</Tooltip>
					</div>
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
