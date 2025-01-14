import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../services/axiosService";
import Button from "./ui/Button";
import FormLabel from "./ui/FormLabel";
import FormInput from "./ui/FormInput";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "../stores/useAuthStore";
import { AxiosError } from "axios";
import { SocialLoginResponse } from "../types/auth";
const createAccountForm = async (userData: {
  email: string;
  password: string;
}) => {
  const response = await axiosInstance.post("/users/create", userData);
  return response.data;
};

export const CreateAccountForm: React.FC = () => {
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
        `/users/auth/${provider}/token`,
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

  const mutation = useMutation({
    mutationFn: createAccountForm,
    onSuccess: (data) => {
      alert("User created successfully!");
    },
    onError: (error: any) => {
      alert(
        error.response?.data?.message ||
          "An error occurred while creating the user."
      );
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
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => googleLogin()}
        >
          Continue with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">Or</span>
          </div>
        </div>

        <div className="mb-4">
          <FormLabel htmlFor="email">Email</FormLabel>
          <FormInput
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            required
          />
        </div>

        <div className="mb-4">
          <FormLabel htmlFor="password">Password</FormLabel>
          <FormInput
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            autoComplete="new-password"
            required
          />
        </div>
        <Button
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Signing up..." : "Sign up"}
        </Button>
        {mutation.isError && (
          <p>
            {mutation.error instanceof Error
              ? mutation.error.message
              : "Something went wrong."}
          </p>
        )}
      </div>
    </form>
  );
};
