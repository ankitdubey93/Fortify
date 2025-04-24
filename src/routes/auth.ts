import { Router, Response, Request } from "express";

import bcrypt from "bcrypt";

import { User } from "../models/User";

import { generateToken } from "../utils/jwt";

const router = Router();

router.post("/signup", async (req: Request, res: Response): Promise<any> => {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res
        .status(409)
        .json({ existingUser, message: "Username already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      username,
      password: hashedPassword,
    });

    const savedUser = (await newUser.save()) as User;

    const token = generateToken(savedUser._id.toString());

    return res.status(201).json({
      user: {
        _id: savedUser._id,
        name: savedUser.name,
        username: savedUser.username,
        token: token,
      },

      message: "User created succesfully.",
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Failed to create user", error });
  }
});

export default router;
