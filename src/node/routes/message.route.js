import express from "express";
import {
    getConversationByuserId,
    getMessages,
    sendNotification,
    getUserNotifications,
    getUserIdByconversationId,
    getUsersForSidebar,
    sendMessage,
    saveBotMessage,
    findOrCreateUser,
    getUserById,
    getUnseenCount,
    markNotificationsAsSeen,
    getUsersUnseencount
} from "../controllers/message.controller.js";
const router = express.Router();
router.post("/conversations", getUsersForSidebar);
router.get("/:id", getMessages);
router.post("/send/:id", sendMessage);
router.post("/userbyconversation/:id", getUserIdByconversationId);
router.post("/oneconversation", getConversationByuserId);
router.post("/botmessage", saveBotMessage);
router.post("/findOrCreateUser", findOrCreateUser);
router.post("/userbyid", getUserById);
router.post('/unseen/:userId', getUnseenCount);
router.post("/notification", sendNotification);
router.post("/notification/get/:userId", getUserNotifications);
router.post("/notification/seen", markNotificationsAsSeen);
router.post("/user/unseen", getUsersUnseencount);

export default router;
