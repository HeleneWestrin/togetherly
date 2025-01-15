import { useLogin } from "../hooks/useLogin";
import { AxiosError } from "axios";
import Button from "./ui/Button";
import FormInput from "./ui/FormInput";
import FormLabel from "./ui/FormLabel";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "../stores/useAuthStore";
import { axiosInstance } from "../services/axiosService";
import { SocialLoginResponse } from "../types/auth";

export const LoginForm: React.FC = () => {
  const { mutate, isPending, isError, error } = useLogin();
  const { login } = useAuthStore();

  const googleLogin = useGoogleLogin({
    flow: "implicit",
    scope: "email profile",
    onSuccess: async (response) => {
      if (response.access_token) {
        try {
          await handleSocialLogin(response.access_token, "google");
        } catch (error) {
          console.error("Social login failed:", error);
        }
      } else {
        console.error("No access token received");
      }
    },
    onError: (error) => {
      console.error("Google Login Failed:", error);
    },
  });

  const handleSocialLogin = async (token: string, provider: "google") => {
    try {
      const response = await axiosInstance.post<SocialLoginResponse>(
        `/api/users/auth/${provider}/token`,
        { token }
      );
      login(response.data.token, response.data.user);
    } catch (error) {
      console.error(`${provider} login failed:`, error);
      if (error instanceof AxiosError) {
        const message =
          error.response?.data?.message || "Authentication failed";
        alert(message);
      }
    }
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return;
    }

    mutate({ email, password });
  };

  const getErrorMessage = (error: unknown) => {
    if (error instanceof AxiosError && error.response?.data?.message) {
      return error.response.data.message;
    }
    return "Something went wrong. Please try again.";
  };

  return (
    <form
      className="w-full space-y-6"
      onSubmit={handleSubmit}
    >
      <div className="space-y-3">
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => googleLogin()}
        >
          Continue with Google
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">Or</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <FormLabel htmlFor="email">Email</FormLabel>
          <FormInput
            id="email"
            type="email"
            name="email"
            placeholder="your@email.com"
            autoComplete="email"
            required
            aria-describedby={isError ? "login-error" : undefined}
          />
        </div>

        <div>
          <FormLabel htmlFor="password">Password</FormLabel>
          <FormInput
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            aria-describedby={isError ? "login-error" : undefined}
          />
        </div>

        {isError && (
          <p
            id="login-error"
            className="text-red-600 font-bold text-sm"
            role="alert"
          >
            {getErrorMessage(error)}
          </p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isPending}
          aria-busy={isPending}
        >
          {isPending ? "Logging in..." : "Login"}
        </Button>
      </div>
    </form>
  );
};
