import { User } from "../models/user.model";
import { Types } from "mongoose";
import { AuthService } from "./auth.service";
import { ValidationError } from "../utils/errors";

export class UserService {
  static async createUser(email: string, password: string) {
    const hashedPassword = await AuthService.hashPassword(password);
    const newUser = new User({
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();
    const token = AuthService.generateToken(
      (savedUser._id as Types.ObjectId).toString()
    );

    return { userId: savedUser._id, token };
  }

  static async loginUser(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new ValidationError("Incorrect email or password");
    }

    const isPasswordValid = await AuthService.comparePasswords(
      password,
      user.password
    );
    if (!isPasswordValid) {
      throw new ValidationError("Incorrect email or password");
    }

    const token = AuthService.generateToken(
      (user._id as Types.ObjectId).toString()
    );
    return { userId: user._id, token };
  }

  static async getActiveUsers() {
    const users = await User.find(
      { isActive: true },
      {
        email: 1,
        profile: 1,
        role: 1,
        isActive: 1,
      }
    ).populate({
      path: "weddings",
      select: "title date location couple",
    });

    return users.map(this.sanitizeUser);
  }

  static getSecrets(userId: string) {
    return {
      secret: "This is a super secret message",
      userId,
    };
  }

  private static sanitizeUser(user: any) {
    return {
      id: user._id,
      email: user.email,
      firstName: user.profile?.firstName,
      lastName: user.profile?.lastName,
      role: user.role,
      isActive: user.isActive,
      weddings: user.weddings?.map((wedding: any) => ({
        id: wedding._id,
        title: wedding.title,
        date: wedding.date,
        location: wedding.location,
        isCouple: wedding.couple.some(
          (coupleId: any) => coupleId.toString() === user._id.toString()
        ),
      })),
    };
  }
}
