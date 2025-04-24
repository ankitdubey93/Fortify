import { Router, Response, Request } from "express";

import bcrypt from "bcrypt";

import { User } from "../models/User";

import { generateToken } from "../utils/jwt";

const router = Router();

router.post("/signup", async (req: Request, res: Response) => {
  const { name, username, password } = req.body;

  if (!name || !username || !password) {
    res.status(400).json({ message: "All fields are required." });
    return;
  }

  try {
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      res
        .status(409)
        .json({ existingUser, message: "Username already exists." });

      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      username,
      password: hashedPassword,
    });

    const savedUser = (await newUser.save()) as User;

    const token = generateToken(savedUser._id.toString());

    res.status(201).json({
      user: {
        _id: savedUser._id,
        name: savedUser.name,
        username: savedUser.username,
        token: token,
      },

      message: "User created succesfully.",
    });
    return;
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Failed to create user", error });
  }
});

router.post("/signin", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const validUser = await User.findOne({ username });

    if (!validUser) {
      res.status(404).json({ message: "User not found. Invalid username." });
      return;
    }

    const isMatch = await bcrypt.compare(password, validUser.password);

    if (!isMatch) {
      res.status(401).json({ message: "Invalid password." });
      return;
    }

    const token = generateToken(validUser._id.toString());

    res.status(200).json({
      user: {
        _id: validUser._id,
        name: validUser.name,
        username: validUser.username,
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "fdgd" });
  }
});

export default router;
