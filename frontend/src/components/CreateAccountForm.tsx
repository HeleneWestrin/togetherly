import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../services/axiosService";
import Button from "./ui/Button";
import FormLabel from "./ui/FormLabel";
import FormInput from "./ui/FormInput";

const createAccountForm = async (userData: {
  email: string;
  password: string;
}) => {
  const response = await axiosInstance.post("/users/create", userData);
  return response.data;
};

export const CreateAccountForm: React.FC = () => {
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
    </form>
  );
};
