const express = require("express");
const fileUpload = require("express-fileupload");
const {
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
} = require("../controllers/message.controller.js");

const router = express.Router();
router.use(fileUpload());
router.post("/conversations", getUsersForSidebar);
router.get("/:id", getMessages);
router.post("/send/:id", sendMessage);
router.post("/userbyconversation/:id", getUserIdByconversationId);
router.post("/oneconversation", getConversationByuserId);
router.post("/botmessage", saveBotMessage);
router.post("/findOrCreateUser", findOrCreateUser);
router.post("/userbyid", getUserById);
router.post("/unseen/:userId", getUnseenCount);
router.post("/notification", sendNotification);
router.post("/notification/get/:userId", getUserNotifications);
router.post("/notification/seen", markNotificationsAsSeen);
router.post("/user/unseen", getUsersUnseencount);

module.exports = router;
