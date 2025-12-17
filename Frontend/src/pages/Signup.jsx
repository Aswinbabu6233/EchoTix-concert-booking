import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../Components/NavBar/Navbar";
import axios from "axios";
import BASE_API from "../config/baseapi";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmPassword] = useState("");
  const [profilephoto, setProfilePhoto] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmpassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("username", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("confirmPassword", confirmpassword); // Required by backend validation
      formData.append("profileImage", profilephoto); // ✅ Must match backend field name

      const res = await axios.post(`${BASE_API}/user/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.token) {
        navigate("/user/login");
      } else {
        setError(res.data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      if (err.response && err.response.data) {
        // Handle specific error message (e.g., "Email already exists")
        if (err.response.data.message) {
          setError(err.response.data.message);
        }
        // Handle validation errors array
        else if (err.response.data.errors) {
          const errorMessages = err.response.data.errors
            .map((e) => e.msg)
            .join(", ");
          setError(errorMessages);
        } else {
          setError("Registration failed. Please Check your input.");
        }
      } else {
        setError("An error occurred during registration. Please try again.");
      }
    }
  };

  return (
    <>
      <Header />
      <div className="main-container">
        <div className="sub-container">
          <h2>Create Account</h2>
          <p className="Welcome-p">
            Join EchoTix to explore and book live music events, bands, and
            artists.
          </p>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <form
            onSubmit={handleRegister}
            encType="multipart/form-data"
            className="Bandform"
            method="post"
          >
            <label htmlFor="username">Username:</label>
            <div className="input-icon">
              <i className="fa-solid fa-user"></i>
              <input
                type="text"
                name="username"
                id="username"
                placeholder="albert"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <label htmlFor="email">Email:</label>
            <div className="input-icon">
              <i className="fa-solid fa-envelope"></i>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="albert@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <label htmlFor="password">Password:</label>
            <div className="input-icon">
              <i className="fa-solid fa-lock"></i>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="At least 8 characters, 1 uppercase, 1 number, 1 symbol"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <label htmlFor="confirmPassword">Confirm Password:</label>
            <div className="input-icon">
              <i className="fa-solid fa-lock"></i>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                required
                value={confirmpassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <label htmlFor="profileImage">Profile Pic:</label>
            <div className="input-icon">
              <input
                type="file"
                name="profileImage"
                id="profileImage"
                accept="image/*"
                required
                onChange={(e) => setProfilePhoto(e.target.files[0])}
              />
            </div>

            <button type="submit">Create Account</button>
            <p className="haveaccount-p">
              Already have an account? <Link to={"/user/login"}>Login</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signup;
