import { useMutation } from "react-query";
import axiosInstance from "../../api/axiosInstance";

const createUser = async (userData: { email: string; password: string }) => {
  const response = await axiosInstance.post("/users", userData);
  return response.data;
};

export default function CreateUser() {
  const mutation = useMutation(createUser, {
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
        autoComplete="new-password"
        required
      />
      <button
        type="submit"
        disabled={mutation.isLoading}
      >
        {mutation.isLoading ? "Creating..." : "Create account"}
      </button>
      {mutation.isError && (
        <p>
          {mutation.error instanceof Error
            ? mutation.error.message
            : "Something went wrong."}
        </p>
      )}
    </form>
  );
}
