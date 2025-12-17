import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import Loader from "../../Components/Loading/loading";
import BASE_API from "../../config/baseapi";
import { clearUser, setUser } from "../../Components/redux/userslice";
import FlashMessage from "../../Components/flash/flash";

const AdminLoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setloading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setloading(true);
    try {
      const response = await axios.post(BASE_API + "/admin/login", {
        email,
        password,
      });

      if (response.data.role !== "admin") {
        setError("Access denied. You are not an admin.");
        setloading(false);
        return;
      }
      dispatch(clearUser()); // clear redux state
      localStorage.removeItem("user"); // remove from localStorage

      const user = {
        name: response.data.name,
        email: response.data.email,
        token: response.data.token,
        role: response.data.role,
        userId: response.data.userId,
        profileImage: response.data.profileImage,
      };

      dispatch(setUser(user));
      localStorage.setItem("user", JSON.stringify(user));
      setError("");
      setloading(false);
      navigate("/admin/dashboard");
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message ||
        "Admin login failed. Please check your credentials.";
      setError(errorMessage);
      setloading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <div className="main-container">
        <div className="sub-container">
          <h2>Admin Login</h2>
          <p className="Welcome-p">Please enter your admin credentials.</p>
          {error && <FlashMessage type="error" message={error} />}
          <form method="post" className="Bandform" onSubmit={handleLogin}>
            <label htmlFor="email">Email:</label>
            <div className="input-icon">
              <i className="fa-solid fa-user-shield"></i>
              <input
                type="email"
                id="email"
                value={email}
                onInput={(e) => setEmail(e.target.value)}
                placeholder="Admin email"
                required
              />
            </div>

            <label htmlFor="password">Password:</label>
            <div className="input-icon">
              <i className="fa-solid fa-lock"></i>
              <input
                type="password"
                id="password"
                value={password}
                onInput={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                required
              />
            </div>

            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AdminLoginPage;
