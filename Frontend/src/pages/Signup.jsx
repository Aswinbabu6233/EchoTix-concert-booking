import React, { useState } from "react";
import { setUser } from "../Components/redux/userslice";
import { Link, useNavigate } from "react-router-dom";
import Header from "../Components/NavBar/Navbar";

const Signup = () => {
  var [name, setName] = useState("");
  var [email, setEmail] = useState("");
  var [password, setPassword] = useState("");
  var [confirmpassword, setConfirmPassword] = useState("");
  //   var [profilephoto, setProfilePhoto] = ({});
  var [error, setError] = useState("");
  var navigate = useNavigate();

  return (
    <>
      <Header />
      <div class="main-container">
        <div class="sub-container">
          <h2>Create Account</h2>
          <p class="Welcome-p">
            Join EchoTix to explore and book live music events, bands, and
            artists.
          </p>
          <form
            enctype="multipart/form-data"
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
                onInput={(e) => setName(e.target.value)}
              />
            </div>
            <label htmlFor="Email">Email:</label>
            <div className="input-icon">
              <i className="fa-solid fa-envelope"></i>
              <input
                type="email"
                name="Email"
                id="Email"
                placeholder="albert@example.com"
                required
                value={email}
                onInput={(e) => setEmail(e.target.value)}
              />
            </div>
            <label htmlFor="Password">Password:</label>
            <div className="input-icon">
              <i className="fa-solid fa-lock"></i>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="At least 8 characters, 1 uppercase, 1 number, 1 symbol"
                required
                value={password}
                onInput={(e) => setPassword(e.target.value)}
              />
            </div>
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <div className="input-icon">
              <i className="fa-solid fa-lock"></i>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="At least 8 characters, 1 uppercase, 1 number, 1 symbol"
                required
                value={confirmpassword}
                onInput={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <label htmlFor="profilephoto">Profile Pic:</label>
            <div className="input-icon">
              <input
                type="file"
                name="profilephoto"
                id="profilephoto"
                accept="image/*"
                required
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
