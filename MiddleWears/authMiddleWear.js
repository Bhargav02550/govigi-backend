import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();


export default function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({
      success: false,
      message: "Missing Authorization header"
    });
  }

  console.log("Auth Middleware: Header:", header);
  const token = header.split(" ")[1];
  console.log("Auth Middleware: Token:", token);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Invalid Authorization header format"
    });
  }

  try {
    const secret = process.env.SCERET_KEY;
    if (!secret) {
      console.error("Auth Middleware: SCERET_KEY is missing in env!");
    }
    const decoded = jwt.verify(token, secret);
    req.user = decoded; // Contains customerId, contact, role
    req.token = token;
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    console.error("Token being verified:", token);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: err.message
    });
  }
}