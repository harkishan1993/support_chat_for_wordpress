import jwt from "jsonwebtoken";
const isLocalhost = process.env.NODE_ENV === "development";
const generateToken = (userId, res) => {
    console.log("protected")
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "15d",
    });
    res.cookie("_app_", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000, // MS,
        httpOnly: true,
        sameSite: "None",
        path: "/", 
      
    });
    return token;
};
export default generateToken;
