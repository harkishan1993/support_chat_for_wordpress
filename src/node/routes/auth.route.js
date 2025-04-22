const express = require("express");
const {
  login,
  logout,
  signup,
  getMe,
  updateUser,
  updateUserForAssignAssistance
} = require("../controllers/auth.controller.js");

const router = express.Router();

router.post("/me", getMe);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/updateuser", updateUser);
router.post("/acceptuser", updateUserForAssignAssistance);

module.exports = router;
