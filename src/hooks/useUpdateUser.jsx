import { useState } from "react";
import { useAuthContext } from "../app/_context/AuthContext";
import toast from "react-hot-toast";
import { origin } from "../utils/origin.js";
const useUserUpdate = () => {
	const [loading, setLoading] = useState(false);
	const { setAuthUser,userId } = useAuthContext();
	const userUpdate = async (dataUser) => {
		setLoading(true);
		try {
			const res = await fetch(`${origin}/api/auth/updateuser?id=${userId}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(dataUser)
			});
			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error);
			}
			setAuthUser(data);
		} catch (error) {
			console.error(error.message);
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	return { loading, userUpdate };
};
export default useUserUpdate;
