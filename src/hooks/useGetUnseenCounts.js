"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { origin } from "../utils/origin";
import { useAuthContext } from "../app/_context/AuthContext";
import { setUnseenCounts } from "../redux/conversationSlice";

const useGetUnseenCounts = () => {
	const [loading, setLoading] = useState(false);
    const {unseenCounts} = useSelector((state) => state.conversation);
	const dispatch = useDispatch();
	const { userId } = useAuthContext();

	useEffect(() => {
		const getUnseenCounts = async () => {
			if (!userId) return;

			setLoading(true);
			try {
				const res = await fetch(`${origin}/api/messages/unseen/${userId}`);
				const data = await res.json(); // [{ conversationId, unseenCount }]
				
				const unseenMap = Object.fromEntries(
					data.map((item) => [item.conversationId, item.unseenCount])
				);

				dispatch(setUnseenCounts(unseenMap));
			} catch (error) {
				console.error(error);
				toast.error("Failed to fetch unseen message counts.");
			} finally {
				setLoading(false);
			}
		};

		getUnseenCounts();
	}, [userId, dispatch]);

	return {unseenCounts, loading };
};

export default useGetUnseenCounts;
