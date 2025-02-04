import { User } from "../models/user.model";
import { Types } from "mongoose";
import { AuthService } from "./auth.service";
import { ValidationError, NotFoundError } from "../utils/errors";
import { WeddingAccessLevel } from "../types/constants";

/**
 * Service class handling user-related business logic
 * Manages user creation, authentication, and data retrieval
 */
export class UserService {
  /**
   * Creates a new user account
   * @param email - User's email address
   * @param password - User's plain text password (will be hashed)
   * @returns Object containing userId and JWT token
   */
  static async createUser(email: string, password: string) {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ValidationError("Email already registered");
    }

    // Hash the password before storing
    const hashedPassword = await AuthService.hashPassword(password);
    const newUser = new User({
      email,
      password: hashedPassword,
      isActive: true,
      isRegistered: true,
      isAdmin: false,
      weddings: [], // Initialize empty weddings array
    });

    // Save user to database and generate authentication token
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
      isNewUser: true, // Always true for new user creation
    };
  }

  /**
   * Authenticates a user's login attempt
   * @param email - User's email address
   * @param password - User's plain text password
   * @returns Object containing userId and JWT token
   * @throws ValidationError if credentials are invalid
   */
  static async loginUser(email: string, password: string) {
    const user = (await User.findOne({ email })) as
      | (User & { _id: Types.ObjectId })
      | null;
    if (!user) {
      throw new ValidationError("Incorrect email or password");
    }

    const isPasswordValid = await AuthService.comparePasswords(
      password,
      user.password as string
    );
    if (!isPasswordValid) {
      throw new ValidationError("Incorrect email or password");
    }

    // Set isRegistered to true on first successful login
    if (!user.isRegistered) {
      user.isRegistered = true;
      await user.save();
    }

    const token = AuthService.generateToken(user._id.toString());

    // Return the response in the expected format
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
  }

  /**
   * Retrieves all active users with their wedding information
   * @returns Array of sanitized user objects
   */
  static async getActiveUsers() {
    // Find all active users and populate their wedding information
    const users = await User.find(
      { isActive: true },
      {
        email: 1,
        profile: 1,
        weddings: 1,
        isActive: 1,
        isAdmin: 1,
      }
    ).populate({
      path: "weddings.weddingId",
      select: "title date location couple",
    });

    // Sanitize user data before returning
    return users.map(this.sanitizeUser);
  }

  /**
   * Sanitizes user data for safe client-side consumption
   * Removes sensitive information and formats data consistently
   * @param user - Raw user document from database
   * @returns Cleaned user object with only necessary information
   */
  private static sanitizeUser(user: any) {
    return {
      id: user._id,
      email: user.email,
      profile: user.profile,
      isActive: user.isActive,
      isRegistered: user.isRegistered,
      isAdmin: user.isAdmin,
      weddings: user.weddings?.map((wedding: any) => ({
        id: wedding.weddingId._id,
        title: wedding.weddingId.title,
        date: wedding.weddingId.date,
        location: wedding.weddingId.location,
        accessLevel: wedding.accessLevel,
        coupleDetails:
          wedding.accessLevel === WeddingAccessLevel.COUPLE
            ? wedding.coupleDetails
            : undefined,
        guestDetails:
          wedding.accessLevel !== WeddingAccessLevel.COUPLE
            ? wedding.guestDetails
            : undefined,
      })),
    };
  }

  /**
   * Updates user's status after completing onboarding
   * @param userId - ID of the user completing onboarding
   */
  static async completeOnboarding(
    userId: string,
    data: {
      profile: {
        firstName: string;
        lastName: string;
        phoneNumber?: string;
        address?: string;
      };
    }
  ) {
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
      throw new NotFoundError("User not found");
    }

    return user;
  }
}
