import { useLogin } from "../../hooks/useLogin";
import { AxiosError } from "axios";

export const LoginForm: React.FC = () => {
  const mutation = useLogin();

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutation.mutate({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        type="email"
        placeholder="Email"
        autoComplete="email"
        required
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        autoComplete="current-password"
        required
      />
      <button
        type="submit"
        disabled={mutation.isLoading}
      >
        {mutation.isLoading ? "Logging in..." : "Login"}
      </button>
      {mutation.isError && (
        <p>
          {mutation.error instanceof AxiosError && mutation.error.response
            ? mutation.error.response.data.message
            : "Something went wrong."}
        </p>
      )}
    </form>
  );
};
