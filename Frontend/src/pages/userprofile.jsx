import React, { useState } from "react";
import Header from "../Components/NavBar/Navbar";
import { Link } from "react-router-dom";
import ProfileSidebar from "../Components/NavBar/profilesidebar";
import { useDispatch, useSelector } from "react-redux";
import defaultimg from "../assets/default-profile.jpg";
import { useEffect } from "react";
import axios from "axios";
import BASE_API from "../config/baseapi";
import FlashMessage from "../Components/flash/flash";
import { getUserImageUrl } from "../utils/imageUtils";

const UserProfile = () => {
  const user = useSelector((state) => state.user);
  const userdetails = user;
  const [message, setmessage] = useState(null);
  const [review, setreview] = useState("");
  const [error, seterror] = useState(null);
  const dispatch = useDispatch();

  const submitreview = async (e) => {
    e.preventDefault();
    setmessage(null);
    seterror(null);
    if (!review.trim()) {
      seterror("please write a review before submiting");
      return;
    }
    try {
      const res = await axios.post(
        BASE_API + "/user/review",
        { review },
        {
          headers: {
            Authorization: `Bearer ${userdetails.token}`,
          },
        }
      );
      setmessage("Review submitter succesfully ! Await admin Approval.");
      setreview("");
    } catch (error) {
      seterror(
        error.response?.data?.message ||
        "something went wrong. Try again Later."
      );
    }
  };
  const handleLogout = () => {
    dispatch(clearUser()); // clear redux state
    localStorage.removeItem("user"); // remove from localStorage
    navigate("/"); // redirect to login page
  };
  return (
    <>
      <Header />
      <div className="main-container">
        <div className="innercontainer">
          {message && <FlashMessage type="success" message={message} />}
          {error && <FlashMessage type="error" message={error} />}
          <section className="common-card">
            <div className="profile-card">
              <div className="profile-header">
                <div className="avatar-container">
                  <img
                    className="profile-avatar"
                    src={getUserImageUrl(userdetails.userId) || defaultimg}
                    alt="profile"
                    onError={(e) => { e.target.src = defaultimg; }}
                  />
                  <div className="avatar-hover"></div>
                </div>
                <div className="profile-info">
                  <h1 className="profile-name">{userdetails.name}</h1>
                  <p className="profile-email">{userdetails.email}</p>
                </div>
              </div>

              <div className="profile-actions">
                <Link to={"/user/edit/profile"} className="btn btn-edit">
                  <i className="fas fa-edit"></i> Edit Profile
                </Link>
                <Link onClick={handleLogout} className="btn btn-logout">
                  <i className="fas fa-sign-out-alt"></i> Logout
                </Link>
              </div>
            </div>

            <ProfileSidebar />
          </section>

          <section className="review-card">
            <h2 className="section-title">Share Your Experience</h2>
            <form className="review-form" method="post" onSubmit={submitreview}>
              <div className="form-group">
                <textarea
                  name="review"
                  id="review"
                  placeholder="Write your review here..."
                  className="review-input"
                  rows="5"
                  value={review}
                  onChange={(e) => setreview(e.target.value)}
                ></textarea>
              </div>
              <button type="submit" className="btn btn-submit">
                <i className="fas fa-paper-plane"></i> Submit Review
              </button>
            </form>
          </section>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
