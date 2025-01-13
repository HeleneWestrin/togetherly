import { useLogin } from "../hooks/useLogin";
import { AxiosError } from "axios";
import Button from "./ui/Button";
import FormInput from "./ui/FormInput";
import FormLabel from "./ui/FormLabel";

export const LoginForm: React.FC = () => {
  // Destructure values from useLogin hook:
  // - mutate: Function to trigger login request
  // - isPending: Boolean indicating if login request is in progress
  // - isError: Boolean indicating if there was an error
  // - error: Error object containing details if login failed
  const { mutate, isPending, isError, error } = useLogin();

  /**
   * Handles form submission by preventing default behavior and
   * extracting email and password from form data to send login request
   */
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    mutate({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });
  };

  return (
    <form
      className="w-full"
      onSubmit={handleSubmit}
    >
      {/* Email input field group */}
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

      {/* Password input field group */}
      <div className="mb-6">
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

      {/* Submit button that shows loading state */}
      <Button
        type="submit"
        className="w-full"
        disabled={isPending}
      >
        {isPending ? "Logging in..." : "Login"}
      </Button>

      {/* Error message display
          Shows server error message if available, otherwise shows generic error */}
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
