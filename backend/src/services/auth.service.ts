import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

/**
 * Service class handling authentication-related operations
 * such as password hashing, verification, and JWT token generation
 */
export class AuthService {
  /**
   * Hashes a plain text password using bcrypt
   * @param password - The plain text password to hash
   * @returns A promise that resolves to the hashed password
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(); // Generate a random salt
    return bcrypt.hash(password, salt); // Hash the password with the salt
  }

  /**
   * Compares a plain text password with a hashed password
   * @param password - The plain text password to verify
   * @param hashedPassword - The hashed password to compare against
   * @returns A promise that resolves to true if passwords match, false otherwise
   */
  static async comparePasswords(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Generates a JWT token for user authentication
   * @param userId - The user's ID to encode in the token
   * @returns A signed JWT token that expires in 7 days
   */
  static generateToken(userId: string): string {
    return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: "7d" });
  }
}
