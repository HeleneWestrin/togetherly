import { useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";
import { AxiosError } from "axios";
import Button from "./ui/Button";
import FormInput from "./ui/FormInput";
import FormLabel from "./ui/FormLabel";

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { mutate, isLoading, isError, error } = useLogin();

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    mutate(
      {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
      },
      {
        onSuccess: () => {
          navigate("/dashboard");
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <FormLabel htmlFor="email">Email</FormLabel>
        <FormInput
          id="email"
          type="email"
          name="email"
          placeholder="your@email.com"
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
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />
      </div>
      <Button
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "Login"}
      </Button>

      {isError && (
        <p className="text-red-500 font-bold">
          {error instanceof AxiosError && error.response
            ? (error.response.data as { message: string }).message
            : "Something went wrong."}
        </p>
      )}
    </form>
  );
};
