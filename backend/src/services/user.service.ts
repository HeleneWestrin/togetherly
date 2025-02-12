import { User } from "../models/user.model";
import { Types } from "mongoose";
import * as AuthService from "./auth.service";
import { createValidationError, createNotFoundError } from "../utils/errors";
import { leanQuery } from "../utils/leanQuery";

/**
 * Service class handling user-related business logic
 * Manages user creation, authentication, and data retrieval
 */
export const createUser = async (email: string, password: string) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createValidationError("Email already registered");
  }

  const hashedPassword = await AuthService.hashPassword(password);
  const newUser = new User({
    email,
    password: hashedPassword,
    isActive: true,
    isRegistered: true,
    isAdmin: false,
    weddings: [],
  });

  const savedUser = await newUser.save();
  const token = AuthService.generateToken(
    (savedUser._id as Types.ObjectId).toString()
  );

  return {
    token,
    user: {
      id: savedUser._id,
      email: savedUser.email,
      isAdmin: savedUser.isAdmin,
    },
    isNewUser: true,
  };
};

export const loginUser = async (email: string, password: string) => {
  const user = (await User.findOne({ email })) as
    | (User & { _id: Types.ObjectId })
    | null;
  if (!user) {
    throw createValidationError("Incorrect email or password");
  }

  const isPasswordValid = await AuthService.comparePasswords(
    password,
    user.password as string
  );
  if (!isPasswordValid) {
    throw createValidationError("Incorrect email or password");
  }

  if (!user.isRegistered) {
    user.isRegistered = true;
    await user.save();
  }

  const token = AuthService.generateToken(user._id.toString());

  return {
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      isAdmin: user.isAdmin,
      profile: user.profile,
      weddings: user.weddings,
    },
  };
};

export const getActiveUsers = async () => {
  try {
    const users = await leanQuery(
      User.find(
        { isActive: true },
        {
          email: 1,
          profile: 1,
          weddings: 1,
          isActive: 1,
          isAdmin: 1,
          isRegistered: 1,
        }
      ).populate({
        path: "weddings.weddingId",
        select: "title date location couple",
      })
    );

    return users.map((user: any) => ({
      id: user._id,
      email: user.email,
      profile: user.profile,
      isActive: user.isActive,
      isRegistered: user.isRegistered,
      isAdmin: user.isAdmin,
      weddings: user.weddings,
    }));
  } catch (error) {
    console.error("Error in getActiveUsers:", error);
    throw error;
  }
};

export const completeOnboarding = async (
  userId: string,
  data: {
    profile: {
      firstName: string;
      lastName: string;
      phoneNumber?: string;
      address?: string;
    };
  }
) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        profile: data.profile,
        isNewUser: false,
      },
    },
    { new: true }
  );

  if (!user) {
    throw createNotFoundError("User not found");
  }

  return user;
};
