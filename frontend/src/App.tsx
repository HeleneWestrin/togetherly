import CreateUser from "./components/auth/CreateUserForm";
import { LoginForm } from "./components/auth/LoginForm";
import { SecretMessage } from "./components/auth/SecretMessage";

export const App = () => {
  return (
    <>
      <h1>Welcome to Final Project!</h1>
      <h2>Create account</h2>
      <CreateUser />
      <h2>Log in</h2>
      <LoginForm />
      <SecretMessage />
    </>
  );
};
