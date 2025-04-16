import { format, isToday, isYesterday, isThisWeek, parseISO } from "date-fns";

function getMessageDateLabel(dateString) {
    const date = typeof dateString === "string" ? parseISO(dateString) : dateString;

    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    if (isThisWeek(date)) return format(date, "EEEE"); // "Monday", "Tuesday", etc.

    return format(date, "dd/MM/yyyy");
}

function groupMessagesByDate(messages) {
    return messages.reduce((acc, msg) => {
        const label = getMessageDateLabel(msg.createdAt);
        if (!acc[label]) acc[label] = [];
        acc[label].push(msg);
        return acc;
    }, {});
}


export {getMessageDateLabel, groupMessagesByDate}