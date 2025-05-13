const express = require("express");
const { registerUser, loginUser, logoutUser, getSessionUser, isAdmin, getAllUsers } = require("../controller/userController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", getSessionUser); // Get user session info
router.get("/check", getSessionUser); // Check if user is authenticated
router.get("/is-admin", isAdmin); // Check if user is admin
router.get("/users", getAllUsers); // Get all users (admin only)

module.exports = router;
