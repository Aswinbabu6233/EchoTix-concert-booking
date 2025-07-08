import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import Header from "../Components/NavBar/Navbar";
import { setUser } from "../Components/redux/userslice";
import { useDispatch } from "react-redux";
import BASE_API from "../config/baseapi";
import Loader from "../Components/Loading/loading";

const Loginpage = () => {
  const dispatch = useDispatch();
  var [email, setEmail] = useState("");
  var [password, setPassword] = useState("");
  var [error, setError] = useState("");
  var [loading, setloading] = useState(false);
  var navigate = useNavigate();
  async function handleLogin(e) {
    e.preventDefault();
    setloading(true);
    await axios
      .post(BASE_API + "/user/login", {
        email: email,
        password: password,
      })
      .then((response) => {
        console.log(response.data.name);

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
        navigate("/");
      })
      .catch((error) => {
        setError("Login failed. Please check your credentials.");
        console.error(error);
      });
  }
  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Header />
      <div className="main-container">
        <div className="sub-container">
          <h2>Login</h2>
          <p className="Welcome-p">
            Welcome to the login page! Please enter your credentials to access
            your account.
          </p>
          {error ? <p className="error-messages">{error}</p> : null}
          <form method="post" className="Bandform" onSubmit={handleLogin}>
            <label htmlFor="email">Email:</label>
            <div className="input-icon">
              <i className="fa-solid fa-user"></i>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onInput={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <label htmlFor="password">Password:</label>
            <div className="input-icon">
              <i className="fa-solid fa-lock"></i>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Enter your password"
                value={password}
                onInput={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit">Login</button>
            <p>
              Don't have an account?{" "}
              <Link to="/user/register">Register here</Link>.
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Loginpage;
