"use client";
import React, { useState, useEffect } from "react";
import {
	AppBar,
	Toolbar,
	IconButton,
	Badge,
	Menu,
	MenuItem,
	Typography,
	Box,
	Divider,
	ListItemIcon,
	Stack,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import HelpIcon from "@mui/icons-material/Help";
import { useSocketContext } from "../../../_context/SocketContext";
import { useAuthContext } from "../../../_context/AuthContext";
import { origin } from "../../../../utils/origin";
import { formatTimeAgo } from "../../../../utils/formatTimeAgo";
const NotificationNavbar = () => {
	const [anchorEl, setAnchorEl] = useState(null);
	const [notifications, setNotifications] = useState([]);
	const [totalCount, setTotalCount] = useState(0);
	const { socket } = useSocketContext();
	const { userId, authUser } = useAuthContext();

	const fetchNotifications = async () => {
		if (!userId) return;
		try {
			const res = await fetch(`${origin}/api/messages/notification/get/${userId}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
			});
			const data = await res.json();
			if (res.ok) {
				setNotifications(data.notifications);
				setTotalCount(data.totalCount);
			}
		} catch (err) {
			console.error("Failed to fetch notifications", err);
		}
	};
	const updateNotionopen = async () => {
		const unseenIds = notifications
			.filter((n) => !n.seen)
			.map((n) => n.id);
		if (unseenIds.length > 0) {
			await fetch("/api/messages/notification/seen", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ids: unseenIds }),
			});
		}
	}

	useEffect(() => {
		updateNotionopen()
	}, [userId, notifications]);

	useEffect(() => {
		fetchNotifications();
		// Listen for real-time notification trigger
		socket?.on("notification", fetchNotifications);

		return () => {
			socket?.off("notification", fetchNotifications);
		};
	}, [socket, userId]);

	const handleOpen = async (event) => {
		setAnchorEl(event.currentTarget);

		const unseenIds = notifications
			.filter((n) => !n.seen)
			.map((n) => n.id);

		if (unseenIds.length > 0) {
			await fetch("/api/messages/notification/seen", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ids: unseenIds }),
			});
		}
	};

	const handleClose = async () => {
		setAnchorEl(null)
		if (!userId) return;
		try {
			const res = await fetch(`${origin}/api/messages/notification/get/${userId}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
			});
			const data = await res.json();
			if (res.ok) {
				setNotifications(data.notifications);
				setTotalCount(data.totalCount);
			}
		} catch (err) {
			console.error("Failed to fetch notifications", err);
		}
	};

	const getIcon = (type) => {
		switch (type) {
			case "accept":
				return <CheckCircleIcon fontSize='small' sx={{ color: "#4caf50", mr: 1 }} />;
			case "request":
				return <HelpIcon fontSize='small' sx={{ color: "#ff9800", mr: 1 }} />;
			case "remove":
				return <RemoveCircleIcon fontSize='small' sx={{ color: "#f44336", mr: 1 }} />;
			default:
				return null;
		}
	};

	return (
		<AppBar position='static' sx={{ height: 64, bgcolor: "white", color: "black", boxShadow: 1, borderBottom: "1px solid oklch(0.869 0.022 252.894)" }}>
			<Toolbar className='flex justify-between items-center'>
				<Box display="flex" alignItems="center" gap={1}>
					<Stack direction="row" alignItems="center" gap={1}>
						<Typography variant="h1" component="div" sx={{ fontSize: 22,textTransform: "capitalize", fontWeight: 600, color: "#666" }}>
							{authUser?.username}
						</Typography>

					</Stack>
				</Box>
				<IconButton onClick={handleOpen} >
					<Badge
						badgeContent={totalCount}
						color='error'
					>
						<NotificationsIcon />
					</Badge>
				</IconButton>
				<Menu
					anchorEl={anchorEl}
					open={Boolean(anchorEl)}
					onClose={handleClose}
					PaperProps={{
						sx: {
							width: 360,
							mt: 1.5,
							borderRadius: 2,
							boxShadow: 3,
							px: 1,
							maxHeight: 400,
							overflowY: "auto",
						},
					}}
				>
					<Typography variant='subtitle1' fontWeight={600} sx={{ px: 1.5, pt: 1 }}>
						Notifications
					</Typography>
					<Divider sx={{ my: 1 }} />
					{notifications.length > 0 ? (
						notifications.map((notif, i) => (
							<MenuItem
								key={i}
								onClick={handleClose}
								sx={{
									display: "flex",
									alignItems: "start",
									gap: 1,
									py: 1.5,
									px: 2,
									borderRadius: 1,
									":hover": {
										bgcolor: "#f9f9f9",
									},
									position: "relative",
								}}
							>
								<ListItemIcon sx={{ minWidth: 28, mt: 0.5 }}>
									{getIcon(notif.type)}
								</ListItemIcon>
								<Box>
									<Typography
										variant='body2'
										fontWeight={500}
										sx={{
											color: "#333",
											whiteSpace: "normal",
											wordBreak: "break-word",
											overflowWrap: "anywhere",
											fontSize: 12,
											display: "block",
											textTransform: "capitalize"
										}}
										dangerouslySetInnerHTML={{ __html: notif.body }}
									/>
									<div className="flex justify-between items-center">
										<Typography variant='caption' sx={{ color: "#888" }}>
											{notif.type}
										</Typography>
										<Typography variant='caption' sx={{ color: "#888", fontSize: 11 }} >
											{formatTimeAgo(notif.createdAt)}
										</Typography>
									</div>
								</Box>
								{!notif.seen && (
									<FiberManualRecordIcon
										sx={{
											color: "green",
											fontSize: 10,
											position: "absolute",
											right: 12,
											top: "14px",

										}}
									/>
								)}
							</MenuItem>
						))
					) : (
						<MenuItem disabled>
							<Typography variant='body2'>No notifications</Typography>
						</MenuItem>
					)}
				</Menu>
			</Toolbar>
		</AppBar>
	);
};

export default NotificationNavbar;
