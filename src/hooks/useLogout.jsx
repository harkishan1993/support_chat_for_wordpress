import { useState } from "react";
import { useAuthContext } from "../app/_context/AuthContext";
import toast from "react-hot-toast";
import { origin } from "../utils/origin.js";
const useLogout = () => {
	const [loading, setLoading] = useState(false);
	const { setAuthUser } = useAuthContext();
	const logout = async () => {
		setLoading(true);
		try {
			const res = await fetch(`${origin}/api/auth/logout`, {
				method: "POST",
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error);
			}

			setAuthUser(null);
		} catch (error) {
			console.error(error.message);
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return { loading, logout };
};
export default useLogout;
