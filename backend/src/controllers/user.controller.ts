import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";

const JWT_SECRET = process.env.JWT_SECRET || "developmentSecret";

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Hash the password
    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Save new user
    const newUser = new User({
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: savedUser._id }, // payload
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      userId: savedUser._id,
      token,
    });
  } catch (error: any) {
    res.status(400).json({
      message: "Could not create user",
      errors: error.errors,
    });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ notFound: true, message: "User does not exist" });
      return;
    }

    // Check password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({
        notFound: true,
        message: "Incorrect password",
      });
      return;
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      userId: user._id,
      token,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
};

export const getSecrets = (req: Request, res: Response): void => {
  res.json({
    secret: "This is a super secret message",
    userId: (req as any).userId,
  });
};
