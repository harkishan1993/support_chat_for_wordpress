"use client"
import { useState } from "react";
import { useAuthContext } from "../app/_context/AuthContext";
import toast from "react-hot-toast";
import { origin } from "../utils/origin.js";
const useSignup = () => {
	const [loading, setLoading] = useState(false);
	const { setAuthUser } = useAuthContext();

	const signup = async (inputs) => {
		try {
			
			setLoading(true);
			const res = await fetch(`${origin}/api/auth/signup`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(inputs),
			});
			const data = await res.json();
			if (!res.ok) {
				console.error(data.error);
				toast.error(data.error);
			}
			console.log(data);
			setAuthUser(data);
		} catch (error) {
			console.error(error.message);
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return { loading, signup };
};
export default useSignup;
