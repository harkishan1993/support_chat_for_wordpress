"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { origin } from "../../utils/origin.js";
import Loader from "../_components/Loader.jsx";
const AuthContext = createContext({
	authUser: null,
	setAuthUser: () => {},
	isLoading: true,
	userId: null,
	role: "user",
});

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
	return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
	const [authUser, setAuthUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [userId, setUserId] = useState(null);
	const [role, setRole] = useState("user");
    const [mainloading, setMainLoading] = useState(true);
	// Function to get query params from URL
	const getQueryParam = (param) => {
		const urlParams = new URLSearchParams(window.location.search);
		return urlParams.get(param);
	};

	useEffect(() => {
		// Try to get userId & role from query params
		let userIdParam = getQueryParam("userId");
		let roleParam = getQueryParam("role") || "user";

		// If not in query, check localStorage
		if (!userIdParam) {
			userIdParam = localStorage.getItem("userId");
			roleParam = localStorage.getItem("role") || "user";
		}

		if (!userIdParam) {
			console.error("User ID is required.");
			setIsLoading(false);
			return;
		}

		// Store in localStorage
		localStorage.setItem("userId", userIdParam);
		localStorage.setItem("role", roleParam);

		const fetchUser = async () => {
			try {
				setIsLoading(true);
				const response = await fetch(
					`${origin}/api/messages/findOrCreateUser?userId=${userIdParam}&role=${roleParam}`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
					}
				);
				const data = await response.json();

				if (response.ok) {
					setAuthUser(data);
					setUserId(data.id);
					setRole(data.role || "user");

					// Update localStorage with fetched values
					localStorage.setItem("userId", data.id);
					localStorage.setItem("role", data.role || "user");
				} else {
					console.error("Error fetching user:", data.error);
				}
			} catch (error) {
				console.error("Error fetching user:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchUser();
		setMainLoading(false);
	}, []);

	return (
		<AuthContext.Provider
			value={{
				userId,
				authUser,
				role,
				isLoading,
				setAuthUser,
			}}
		>
			{mainloading ? <Loader /> :children}
		</AuthContext.Provider>
	);
};
