export interface SocialLoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: "admin" | "couple" | "guest";
  };
}
