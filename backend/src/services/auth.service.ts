import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { OAuth2Client } from "google-auth-library";
import { createAuthenticationError } from "../utils/errors";

/**
 * Service class handling authentication-related operations
 * such as password hashing, verification, and JWT token generation
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(); // Generate a random salt
  return bcrypt.hash(password, salt); // Hash the password with the salt
};

export const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: "7d" });
};

export const verifyGoogleToken = async (token: string) => {
  const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
  try {
    const response = await client.getTokenInfo(token);
    if (!response.email) {
      throw new Error("Email not provided in token info");
    }

    // Get user info using the access token
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const userInfo = await userInfoResponse.json();

    return {
      email: response.email,
      sub: response.sub || "",
      given_name: userInfo.given_name || "",
      family_name: userInfo.family_name || "",
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    throw createAuthenticationError("Invalid Google token");
  }
};
