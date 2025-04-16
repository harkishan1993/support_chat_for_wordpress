"use client";
import { createContext, useState, useEffect, useContext, useRef } from "react";
import { useAuthContext } from "./AuthContext";
import io from "socket.io-client";
import { origin } from "../../utils/origin";


const SocketContext = createContext(undefined);

export const useSocketContext = () => {
	const context = useContext(SocketContext);
	if (context === undefined) {
		throw new Error("useSocketContext must be used within a SocketContextProvider");
	}
	return context;
};

const socketURL = process.env.NODE_ENV === "development" ? origin : "/";

const SocketContextProvider = ({ children }) => {
	const socketRef = useRef(null);
	const [onlineUsers, setOnlineUsers] = useState([]);
	const { userId, isLoading } = useAuthContext();
 
	useEffect(() => {
		if (userId && !isLoading) {
			const socket = io(socketURL, {
				query: {
					userId: userId,
				},
			});
			socketRef.current = socket;
			socket.on("getOnlineUsers", (users) => {
				setOnlineUsers(users);
			});

			return () => {
				socket.close();
				socketRef.current = null;
			};
		} else if (!userId && !isLoading) {
			if (socketRef.current) {
				socketRef.current.close();
				socketRef.current = null;
			}
		}
	}, [userId, isLoading]);

	return (
		<SocketContext.Provider value={{ socket: socketRef.current, onlineUsers }}>{children}</SocketContext.Provider>
	);
};

export default SocketContextProvider;
