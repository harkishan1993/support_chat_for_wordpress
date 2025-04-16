import { formatDistanceToNow, parseISO } from "date-fns";

export const formatTimeAgo = (timestamp) => {
	if (!timestamp) return "";
	try {
		const date = typeof timestamp === "string" ? parseISO(timestamp) : timestamp;
		return formatDistanceToNow(date, { addSuffix: true });
	} catch (error) {
		return "";
	}
};
