import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../db.js";
import { env } from "../env.js";

export const authRouter = Router();

const credentialsSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8)
});

authRouter.post("/register", async (req, res) => {
  const data = credentialsSchema.extend({
    name: z.string().trim().min(2).max(80)
  }).parse(req.body);

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existingUser) {
    res.status(409).json({ message: "An account with that email already exists." });
    return;
  }

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: await bcrypt.hash(data.password, 12)
    },
    select: { id: true, name: true, email: true }
  });

  const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
    expiresIn: "7d"
  });

  res.status(201).json({ user, token });
});

authRouter.post("/login", async (req, res) => {
  const data = credentialsSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
    res.status(401).json({ message: "Invalid email or password." });
    return;
  }

  const token = jwt.sign({ userId: user.id }, env.JWT_SECRET, {
    expiresIn: "7d"
  });

  res.json({
    user: { id: user.id, name: user.name, email: user.email },
    token
  });
});
