"use client"
import React, { useEffect } from 'react'
import { useSocketContext } from "./SocketContext.jsx";
import { useAuthContext } from "./AuthContext.jsx";
import { origin } from '../../utils/origin.js';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
function Userunread({ children }) {
  const { socket } = useSocketContext();
  const { authUser } = useAuthContext();
  const chatboxopen = useSelector((state) => state.conversation.userChatboxOpen);
  const router = useRouter();
  useEffect(() => {
    if (!socket) return;
    const handleNewConversation = async () => {
      if (authUser?.id && authUser?.role == "user" && authUser?.assistanceId) {
        const response = await fetch(
          `${origin}/api/messages/user/unseen?id=${authUser?.id}&assistanceId=${authUser?.assistanceId}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }
        );
        response.json().then((dataNew) => {
          const messageData = {
            type: "NEW_COUNT",
            count: dataNew || 0,
          };
          if (!chatboxopen) {
            window?.parent?.postMessage(messageData, '*');
          } else {
            window?.parent?.postMessage({ type: "NEW_COUNT", count: 0 }, '*');
          }
        });
      }
    };
    socket.on("unread", handleNewConversation);
    return () => {
      socket.off("unread", handleNewConversation);
    };
  }, [socket, chatboxopen]);
  useEffect(() => {
    if(typeof window !== "undefined") {
      const handleNewConversation = async (event) => {
        if (event.data.type === "Redirect") {
          router.push("/support"); 
        }
      }
      window.addEventListener("message", handleNewConversation);
      return () => {
        window.removeEventListener("message", handleNewConversation);
      };
    }
  },[])
  return (
    <>{children}</>
  )
}

export default Userunread