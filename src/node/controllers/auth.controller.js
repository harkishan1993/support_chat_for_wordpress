import prisma from "../db/prisma.js";
import bcryptjs from "bcryptjs";
import generateToken from "../utils/generateToken.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
export const signup = async (req, res) => {
    try {
        const { fullName, username, password, confirm_password, gender } = req.body;
        if (!fullName || !username || !password || !confirm_password || !gender) {
            return res.status(400).json({ error: "Please fill in all fields" });
        }
        if (password !== confirm_password) {
            return res.status(400).json({ error: "Passwords don't match" });
        }
        const user = await prisma.user.findUnique({ where: { username } });
        if (user) {
            return res.status(400).json({ error: "Username already exists" });
        }
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);
        // https://avatar-placeholder.iran.liara.run/
        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
        const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;
        const newUser = await prisma.user.create({
            data: {
                fullName,
                username,
                password: hashedPassword,
                gender,
                profilePic: gender === "male" ? boyProfilePic : girlProfilePic,
            },
        });
        if (newUser) {
            // generate token in a sec
            generateToken(newUser.id, res);
            res.status(201).json({
                id: newUser.id,
                fullName: newUser.fullName,
                username: newUser.username,
                profilePic: newUser.profilePic,
            });
        }
        else {
            res.status(400).json({ error: "Invalid user data" });
        }
    }
    catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        const isPasswordCorrect = await bcryptjs.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ error: "Invalid credentials" });
        }
        generateToken(user.id, res);
        res.status(200).json({
            id: user.id,
            fullName: user.fullName,
            username: user.username,
            profilePic: user.profilePic,
        });
    }
    catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
export const logout = async (req, res) => {
    try {
        res.cookie("_app_", "", {
            maxAge: 0,
            httpOnly: true,
            secure: false,
            sameSite: "None",
            path: "/",
        });
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
export const getMe = async (req, res) => {
    console.log(req.query);
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({
            id: user.id,
            fullName: user.fullName,
            username: user.username,
            profilePic: user.profilePic,
        });
    }
    catch (error) {
        console.log("Error in getMe controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const updateUser = async (req, res) => {
    try {
        const id = req.query?.id
        if (!id) {
            return res.status(404).json({ error: "User Id Not Found" });
        }
        const data = req.body;
        console.log(data)
        const user = await prisma.user.update({
            where: {
                id: id
            },
            data: data
        })
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getMe controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
export const updateUserForAssignAssistance = async (req, res) => {
    try {
        const userId = req.query?.userId
        const asignId = req.query?.asignId
        console.log(userId, asignId)
        const removeAcept = req.query?.remove?.trim() || "no"
        if (!userId || !asignId) {
            return res.status(404).json({ error: "User Id Not Found and Assistant Id Required" });
        }
        const user = await prisma.user.update({
            where: {
                id: userId
            },
            data: {
                assistanceId: removeAcept === "yes" ? null : asignId
            }
        })
        if (user) {
            const asignSocketId = getReceiverSocketId(asignId);
            const userSocketId = getReceiverSocketId(userId);
            asignSocketId.forEach((socketId) => {
                io.to(socketId).emit("acceptAproval", { assingOrNot: removeAcept === "yes", userId: userId, asignId: asignId });
            })
           if(removeAcept !== "yes"){
               userSocketId.forEach((socketId) => {
                   io.to(socketId).emit("acceptAproval", { assingOrNot: removeAcept === "yes", userId: userId, asignId: asignId });
               })
           }

        }
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in updateUserForAssignAssistance controller", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    } finally {

    }
}
