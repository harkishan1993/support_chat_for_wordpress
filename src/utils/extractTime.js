export function extractTime(dateString) {
	const date = new Date(dateString);
	let hours = date.getHours();
	const minutes = padZero(date.getMinutes());
	const ampm = hours >= 12 ? 'PM' : 'AM';
	hours = hours % 12 || 12; // Convert to 12-hour format and handle midnight (0 becomes 12)
	return `${hours}:${minutes} ${padZero(ampm)}`;
}

function padZero(number) {
	return number.toString().padStart(2, "0");
}
