import { useLogin } from "../hooks/useLogin";
import { AxiosError } from "axios";
import { Button } from "./ui/Button";
import FormInput from "./ui/FormInput";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "../stores/useAuthStore";
import { axiosInstance } from "../services/axiosService";
import { SocialLoginResponse } from "../types/auth";
import { BouncingBall } from "react-svg-spinners";
import { CheckIcon } from "lucide-react";

export const LoginForm: React.FC = () => {
  const { mutate, isPending, isError, error, isSuccess } = useLogin();
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
      className="w-full"
      onSubmit={handleSubmit}
    >
      <div>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => googleLogin()}
        >
          Continue with Google
        </Button>
      </div>

      <div className="relative flex my-8 items-center justify-center">
        <hr className="h-0.5 grow" />
        <span className="w-12 shrink-0 text-center text-compact-bold text-dark-800">
          or
        </span>
        <hr className="h-0.5 grow" />
      </div>

      <div className="space-y-5">
        <div>
          <FormInput
            id="email"
            type="email"
            name="email"
            label="Email"
            autoComplete="email"
            required
            aria-describedby={isError ? "login-error" : undefined}
          />
        </div>

        <div>
          <FormInput
            id="password"
            name="password"
            type="password"
            label="Password"
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
          disabled={isPending || isSuccess}
          aria-busy={isPending || isSuccess}
        >
          {isPending ? (
            <BouncingBall
              color="#fff"
              width={24}
              height={24}
            />
          ) : isSuccess ? (
            <>
              <CheckIcon
                color="#fff"
                className="w-6 h-6"
              />
            </>
          ) : (
            "Login"
          )}
        </Button>
      </div>
    </form>
  );
};
