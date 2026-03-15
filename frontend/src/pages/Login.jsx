export default function Login() {

  const loginWithGithub = () => {
    window.location.href = "http://localhost:5000/auth/github";
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Login</h2>

      <button onClick={loginWithGithub}>
        Continue with GitHub
      </button>
    </div>
  );
}