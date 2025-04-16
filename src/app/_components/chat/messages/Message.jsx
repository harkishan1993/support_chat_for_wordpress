"use client"
import { useAuthContext } from "../../../_context/AuthContext";
import { extractTime } from "../../../../utils/extractTime.js";
import Chatnotice from "./Chatnotice";

const Message = ({ message, premessage, lastSeenMessageId }) => {
	const { userId } = useAuthContext();
	const fromMe = message?.senderId === userId;
	const chatClass = fromMe ? "flex-row-reverse" : "";
	const bubbleBg = fromMe ? "bg-sky-200 text-slate-700" : "bg-gray-100 text-slate-700 dark:bg-gray-700 dark:text-white";
	const sameSender = message?.senderId === premessage?.senderId;
	const sameTime = extractTime(message?.createdAt) === extractTime(premessage?.createdAt);
	const isGroupedMessage = sameSender && sameTime;
	const separateMessageyTime = (extractTime(message?.createdAt) != extractTime(premessage?.createdAt) || (message?.senderId !== premessage?.senderId))
	const isLastSeenMessage = message.id === lastSeenMessageId;
	return (
		<>
			{
				message.type == "welcome" && <Chatnotice message={`Chat accepted by admin`} time={extractTime(message?.createdAt)} />
			}
			{
				(message.type == "text" || message.type == "welcome") && <div className={`flex items-start my-[1px] ${chatClass}`}>
					<div className="flex flex-col gap-[2px]">
						{
							separateMessageyTime && <div className={`flex items-center ${fromMe ? "justify-end" : "justify-start"} mt-4  space-x-2 rtl:space-x-reverse`}>
								{
									!fromMe && <span className="text-sm text-gray-500">{message?.sender?.username},</span>
								}
								<span className="text-xs font-normal text-gray-500 dark:text-gray-400">{extractTime(message?.createdAt)}</span>
							</div>
						}
						<div className={`flex flex-col w-full max-w-[375px] leading-1.5 py-2 px-3 border-gray-200 ${bubbleBg} 
                      ${fromMe
								? isGroupedMessage
									? "rounded-l-lg rounded-bl-lg"
									: "rounded-t-lg rounded-l-lg"
								: isGroupedMessage
									? "rounded-r-lg rounded-br-lg"
									: "rounded-b-lg rounded-r-lg"
							}`}>
							<p className="text-sm font-semibold break-words">{message?.body}</p>
						</div>
						{
							isLastSeenMessage && <span className="flex justify-end text-[11px] text-slate-400 h-[16px] mb-2">seen</span>
						}
					</div>
				</div>
			}
			{
				message.type === "emoji" && <div className={`flex items-start my-[1px] ${chatClass}`}>
					<div className="flex flex-col gap-[2px]">
						{
							separateMessageyTime && <div className={`flex items-center ${fromMe ? "justify-end" : "justify-start"} mt-4  space-x-2 rtl:space-x-reverse`}>
								{
									!fromMe && <span className="text-sm text-gray-500">{message?.sender?.username},</span>
								}
								<span className="text-xs font-normal text-gray-500 dark:text-gray-400">{extractTime(message?.createdAt)}</span>
							</div>
						}
						<div className={`flex flex-col w-full max-w-[375px] leading-1.5 py-2 px-3 border-gray-200 bg-transparent 
                      ${fromMe
								? isGroupedMessage
									? "rounded-l-lg rounded-bl-lg"
									: "rounded-t-lg rounded-l-lg"
								: isGroupedMessage
									? "rounded-r-lg rounded-br-lg"
									: "rounded-b-lg rounded-r-lg"
							}`}>
							<p className="text-5xl font-semibold break-words leading-14">{message?.body}</p>
						</div>
						{
							isLastSeenMessage && <span className="flex justify-end text-[11px] text-slate-400 h-[16px] mb-2">seen</span>
						}
					</div>
				</div>
			}
		</>
	);
};

export default Message;
