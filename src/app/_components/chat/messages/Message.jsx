"use client";
import { useAuthContext } from "../../../_context/AuthContext";
import DownloadIcon from "@mui/icons-material/Download";
import CircularProgress from "@mui/material/CircularProgress";
import { extractTime } from "../../../../utils/extractTime.js";
import Chatnotice from "./Chatnotice";
import { useCallback, useEffect, useState } from "react";
import ImageWithLoader from "./ImageWithLoader";
import Linkify from "linkify-react";
import { formatFileSize } from "../../../../utils/formatFileSize";
const Message = ({ message, premessage, lastSeenMessageId }) => {
  const { userId } = useAuthContext();
  const fromMe = message?.senderId === userId;
  const [downloaded, setDownloaded] = useState({}); // { url: true }
  const [downloading, setDownloading] = useState(null);
  const chatClass = fromMe ? "flex-row-reverse" : "";
  const bubbleBg = fromMe
    ? "bg-sky-200 text-slate-700"
    : "bg-gray-100 text-slate-700 dark:bg-gray-700 dark:text-white";
  const sameSender = message?.senderId === premessage?.senderId;
  const sameTime =
    extractTime(message?.createdAt) === extractTime(premessage?.createdAt);
  const isGroupedMessage = sameSender && sameTime;
  const separateMessageyTime =
    extractTime(message?.createdAt) != extractTime(premessage?.createdAt) ||
    message?.senderId !== premessage?.senderId;
  const isLastSeenMessage = message.id === lastSeenMessageId;

  const handleImageDownload = useCallback(
    async (url, name) => {
      setDownloading(url);
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloaded((prev) => ({ ...prev, [url]: true }));
      } catch (err) {
        console.error("Download failed", err);
      }
      setDownloading(null);
    },
    [setDownloaded]
  );

  return (
    <>
      {message.type == "welcome" && (
        <Chatnotice
          message={`Chat accepted by admin`}
          time={extractTime(message?.createdAt)}
        />
      )}
      {(message.type == "text" || message.type == "welcome") && (
        <div className={`flex items-start my-[1px] ${chatClass}`}>
          <div className="flex flex-col gap-[2px]">
            {separateMessageyTime && (
              <div
                className={`flex items-center ${
                  fromMe ? "justify-end" : "justify-start"
                } mt-4  space-x-2 rtl:space-x-reverse`}
              >
                {!fromMe && (
                  <span className="text-sm text-gray-500">
                    {message?.sender?.username},
                  </span>
                )}
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                  {extractTime(message?.createdAt)}
                </span>
              </div>
            )}
            <div
              className={`flex flex-col w-full max-w-[375px] leading-1.5 py-2 px-3 border-gray-200 ${bubbleBg} 
                      ${
                        fromMe
                          ? isGroupedMessage
                            ? "rounded-l-lg rounded-bl-lg"
                            : "rounded-t-lg rounded-l-lg"
                          : isGroupedMessage
                          ? "rounded-r-lg rounded-br-lg"
                          : "rounded-b-lg rounded-r-lg"
                      }`}
            >
              <p className="text-sm font-semibold break-words">
                <Linkify
                  options={{
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "text-blue-600 hover:underline break-all",
                  }}
                >
                  {message?.body}
                </Linkify>
              </p>
            </div>
            {isLastSeenMessage && (
              <span className="flex justify-end text-[11px] text-slate-400 h-[16px] mb-2">
                seen
              </span>
            )}
          </div>
        </div>
      )}
      {message.type == "file" && (
        <div className={`flex items-start my-[1px] ${chatClass}`}>
          <div className="flex flex-col gap-[2px]">
            {separateMessageyTime && (
              <div
                className={`flex items-center ${
                  fromMe ? "justify-end" : "justify-start"
                } mt-4  space-x-2 rtl:space-x-reverse`}
              >
                {!fromMe && (
                  <span className="text-sm text-gray-500">
                    {message?.sender?.username},
                  </span>
                )}
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                  {extractTime(message?.createdAt)}
                </span>
              </div>
            )}
            <div
              className={`flex flex-col w-full max-w-[375px] leading-1.5 py-2 px-3 border-gray-200 ${bubbleBg} 
                      ${
                        fromMe
                          ? isGroupedMessage
                            ? "rounded-l-lg rounded-bl-lg"
                            : "rounded-t-lg rounded-l-lg"
                          : isGroupedMessage
                          ? "rounded-r-lg rounded-br-lg"
                          : "rounded-b-lg rounded-r-lg"
                      }`}
            >
              {message.files?.map((file, idx) => {
                const isImage = file.type?.startsWith("image");

                return (
                  <div key={idx} className="relative w-full">
                    {isImage ? (
                      <ImageWithLoader
                        src={file.url}
                        className="w-full h-auto rounded-lg shadow mt-2"
                      />
                    ) : (
                      <div className="relative bg-white  dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg p-3 mt-1 shadow-sm">
                        <ImageWithLoader
                          type="file"
                          className="w-full h-auto rounded-md shadow"
                        />
                        <div className="mt-2 flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 break-words">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {!fromMe && !downloaded[file.url] && (
                      <button
                        onClick={() => handleImageDownload(file.url, file.name)}
                        className="absolute top-4 right-2 bg-white/80 hover:bg-white p-1 rounded-full"
                      >
                        {downloading === file.url ? (
                          <CircularProgress size={20} thickness={5} />
                        ) : (
                          <DownloadIcon
                            fontSize="small"
                            sx={{ cursor: "pointer" }}
                          />
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
              {message?.body && (
                <p className="text-sm font-semibold break-words mt-1">
                  {message?.body}
                </p>
              )}
            </div>
            {isLastSeenMessage && (
              <span className="flex justify-end text-[11px] text-slate-400 h-[16px] mb-2">
                seen
              </span>
            )}
          </div>
        </div>
      )}

      {message.type === "emoji" && (
        <div className={`flex items-start my-[1px] ${chatClass}`}>
          <div className="flex flex-col gap-[2px]">
            {separateMessageyTime && (
              <div
                className={`flex items-center ${
                  fromMe ? "justify-end" : "justify-start"
                } mt-4  space-x-2 rtl:space-x-reverse`}
              >
                {!fromMe && (
                  <span className="text-sm text-gray-500">
                    {message?.sender?.username},
                  </span>
                )}
                <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                  {extractTime(message?.createdAt)}
                </span>
              </div>
            )}
            <div
              className={`flex flex-col w-full max-w-[375px] leading-1.5 py-2 px-3 border-gray-200 bg-transparent 
                      ${
                        fromMe
                          ? isGroupedMessage
                            ? "rounded-l-lg rounded-bl-lg"
                            : "rounded-t-lg rounded-l-lg"
                          : isGroupedMessage
                          ? "rounded-r-lg rounded-br-lg"
                          : "rounded-b-lg rounded-r-lg"
                      }`}
            >
              <p className="text-5xl font-semibold break-words leading-14">
                {message?.body}
              </p>
            </div>
            {isLastSeenMessage && (
              <span className="flex justify-end text-[11px] text-slate-400 h-[16px] mb-2">
                seen
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Message;
