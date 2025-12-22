import jwt from "jsonwebtoken";

export const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET || "your-secret-key-change-this";
  return jwt.sign(payload, secret, { expiresIn: "7d" });
};

export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || "your-secret-key-change-this";
  return jwt.verify(token, secret);
};
