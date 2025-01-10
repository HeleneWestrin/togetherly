import { useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";
import { AxiosError } from "axios";

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
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          autoComplete="email"
          required
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "Login"}
      </button>

      {isError && (
        <p className="text-red-500 font-bold">
          {error instanceof AxiosError && error.response
            ? error.response.data.message
            : "Something went wrong."}
        </p>
      )}
    </form>
  );
};
