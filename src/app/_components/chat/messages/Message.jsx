"use client"
import { useAuthContext } from "../../../_context/AuthContext";
import { extractTime } from "../../../../utils/extractTime.js";
import Chatnotice from "./Chatnotice";
// import { useState, useEffect, useRef } from "react";

const Message = ({ message }) => {
	const { userId } = useAuthContext();
	// const [dropdownOpen, setDropdownOpen] = useState(false);
	// const dropdownRef = useRef(null);
	const fromMe = message?.senderId === userId;
	const chatClass = fromMe ? "flex-row-reverse" : "";
	const bubbleBg = fromMe ? "bg-sky-200 text-slate-700" : "bg-gray-100 text-slate-700 dark:bg-gray-700 dark:text-white";

	// Close dropdown when clicking outside
	// useEffect(() => {
	// 	const handleClickOutside = (event) => {
	// 		if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
	// 			setDropdownOpen(false);
	// 		}
	// 	};

	// 	document.addEventListener("mousedown", handleClickOutside);
	// 	return () => {
	// 		document.removeEventListener("mousedown", handleClickOutside);
	// 	};
	// }, []);
	console.log(message)
	return (
		<>
		{
			message.type == "welcome" && <Chatnotice message={`Chat accepted by admin`} time={extractTime(message?.createdAt)} />
		}
		{(message.type == "text" || message.type == "welcome") && <div className={`flex items-start gap-2.5 my-3 ${chatClass}`}>
			{/* <Image className="w-8 h-8 rounded-full" src={img} width={32} height={32} alt="User Image" /> */}
			<div className="flex flex-col gap-[2px]">

				<div className={`flex items-center ${fromMe?"justify-end":"justify-start"}  space-x-2 rtl:space-x-reverse`}>
					<span className="text-sm text-gray-500">{message?.sender?.username},</span>
					<span className="text-xs font-normal text-gray-500 dark:text-gray-400">{extractTime(message?.createdAt)}</span>
				</div>
				<div className={`flex flex-col w-full max-w-[320px] leading-1.5 py-2 px-3 ${fromMe?"rounded-t-lg rounded-l-lg":"rounded-b-lg rounded-r-lg"} border-gray-200 ${bubbleBg}`}>
					<p className="text-sm font-semibold">{message?.body}</p>
				</div>
			</div>

			{/* Show Dropdown only for left bubble (received messages) */}
			{!fromMe && (
				<></>
				// <div className="relative" ref={dropdownRef}>
				// 	<button
				// 		onClick={() => setDropdownOpen((prev) => !prev)}
				// 		className="inline-flex cursor-pointer self-center items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 dark:focus:ring-gray-600"
				// 		type="button"
				// 	>
				// 		<svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 4 15">
				// 			<path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
				// 		</svg>
				// 	</button>

				// 	{/* Dropdown Menu */}
				// 	{dropdownOpen && (
				// 		<div className="absolute right-0 top-[30px] z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-40 dark:bg-gray-700 dark:divide-gray-600">
				// 			<ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
				// 				<li>
				// 					<button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Reply</button>
				// 				</li>
				// 			</ul>
				// 		</div>
				// 	)}
				// </div>
			)}
		</div>}
		</>
	);
};

export default Message;
