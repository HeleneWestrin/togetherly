import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../services/axiosService";
import { Button } from "./ui/Button";
import FormInput from "./ui/FormInput";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "../stores/useAuthStore";
import { AxiosError } from "axios";
import { SocialLoginResponse } from "../types/auth";
import { navigateBasedOnWeddings } from "../utils/navigationHelper";
import { useNavigate } from "react-router-dom";
import { BouncingBall } from "react-svg-spinners";
import { CheckIcon } from "lucide-react";

const createAccountForm = async (userData: {
  email: string;
  password: string;
}) => {
  const response = await axiosInstance.post<{
    status: string;
    data: {
      token: string;
      user: {
        id: string;
        email: string;
        role: "admin" | "couple" | "guest";
      };
      isNewUser: boolean;
    };
  }>("/api/users/create", userData);
  return response.data.data;
};

export const CreateAccountForm: React.FC = () => {
  const { login } = useAuthStore();
  const navigate = useNavigate();

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

      // First login with the received token and user data
      login(response.data.token, {
        ...response.data.user,
        isNewUser: response.data.isNewUser,
      });

      // Then navigate based on wedding data
      await navigateBasedOnWeddings(navigate, response.data.isNewUser);
    } catch (error) {
      console.error(`${provider} login failed:`, error);
      if (error instanceof AxiosError) {
        const message =
          error.response?.data?.message || "Authentication failed";
        alert(message);
      }
    }
  };

  const mutation = useMutation({
    mutationFn: createAccountForm,
    onSuccess: (data) => {
      login(data.token, {
        ...data.user,
        isNewUser: data.isNewUser,
      });
      navigateBasedOnWeddings(navigate, data.isNewUser);
    },
    onError: (error: AxiosError) => {
      console.error("Account creation failed:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };
    mutation.mutate(data);
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
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <FormInput
            id="password"
            name="password"
            type="password"
            label="Password"
            autoComplete="new-password"
            required
          />
        </div>

        {mutation.isError && (
          <p
            className="text-red-600 font-bold text-sm"
            role="alert"
          >
            {(mutation.error as AxiosError<{ message: string }>).response?.data
              ?.message || "An error occurred while creating your account."}
          </p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={mutation.isPending || mutation.isSuccess}
          aria-busy={mutation.isPending || mutation.isSuccess}
        >
          {mutation.isPending ? (
            <BouncingBall
              color="#fff"
              width={24}
              height={24}
            />
          ) : mutation.isSuccess ? (
            <>
              <CheckIcon
                color="#fff"
                className="w-6 h-6"
              />
            </>
          ) : (
            "Sign up"
          )}
        </Button>
      </div>
    </form>
  );
};
