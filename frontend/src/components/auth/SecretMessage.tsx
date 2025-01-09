import { useSecrets } from "../../hooks/useSecrets";

export const SecretMessage: React.FC = () => {
  const { data, isLoading, isError } = useSecrets();

  if (isLoading) return <p>Loading secret content...</p>;

  if (isError)
    return (
      <>
        <h1>Uh oh...</h1>
        <p>Restricted content. Please log in to view it.</p>
      </>
    );

  // If data is undefined for some reason, handle it gracefully
  if (!data) {
    return <p>No secret data found.</p>;
  }

  return (
    <div>
      <h1>Secret content</h1>
      <p>Message: {data.secret}</p>
      <p>User ID: {data.userId}</p>
    </div>
  );
};
