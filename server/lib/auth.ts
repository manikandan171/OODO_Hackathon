import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "../db.js";

const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || "super_secret_dev_key";

authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  
  try {
    const user = await db.getUserByEmail(email);
    if (!user || !user.passwordHash) {
      console.log("Login failed: User not found or no password hash", { email, foundUser: !!user, hasHash: !!user?.passwordHash });
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    
    // bcrypt compare against User.passwordHash
    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      console.log("Login failed: Password mismatch for", email);
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    
    // role written into JWT/session
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } catch (err: any) {
    res.status(500).json({ error: "Database error" });
  }
});

authRouter.get("/me", (req, res) => {
  res.json({ user: (req as any).user });
});

export default authRouter;
