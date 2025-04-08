"use client";
import { useState } from "react";
import { useAuthContext } from "../app/_context/AuthContext";
import toast from "react-hot-toast";
import { origin } from "../utils/origin.js";
const useLogin = () => {
	const [loading, setLoading] = useState(false);
	const { setAuthUser } = useAuthContext();
	const login = async (username, password) => {
		try {
			setLoading(true);
			const res = await fetch(`${origin}/api/auth/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
			});
			const data = await res.json();
			if (!res.ok) {
				console.error(data.error);
				toast.error(data.error);
			}
			setAuthUser(data);
		} catch (error) {
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};
	return { loading, login };
};
export default useLogin;
