import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

const Header = ({ hidenav }) => {
  const user = useSelector((state) => state.user);
  const adminpresent = user?.role === "admin";
  const userpresent = user?.role === "user";
  const userdetails = user;

  const toggleMobileMenu = () => {
    // Toggle mobile menu logic
    const nav = document.querySelector(".nav-menu");
    if (nav) {
      nav.classList.toggle("show");
    }
  };
  useEffect(() => {
    const handleClickOutside = (e) => {
      const navMenu = document.querySelector(".nav-menu");
      const hamburger = document.querySelector(".hamburger");
      if (
        navMenu &&
        navMenu.classList.contains("show") &&
        !navMenu.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        navMenu.classList.remove("show");
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <header>
      <div className="headersection">
        {/* Logo */}
        <div className="logo">
          {adminpresent ? (
            <Link to="/admin/dashboard">ECHOTIX ADMIN</Link>
          ) : (
            <Link to="/">ECHOTIX</Link>
          )}
        </div>

        {/* Navigation */}
        {!hidenav && (
          <>
            <div className="hamburger" onClick={toggleMobileMenu}>
              <i className="fa-solid fa-bars"></i>
            </div>

            {adminpresent ? (
              <nav className="admin-nav nav-menu">
                <ul className="admin-links">
                  <li>
                    <Link to="/admin/dashboard">Dashboard</Link>
                  </li>
                  <li className="dropdown-parent">
                    <span>
                      Management <i className="fa-solid fa-caret-down"></i>
                    </span>
                    <ul className="dropdown">
                      <li>
                        <Link to="/admin/bands">Bands</Link>
                      </li>
                      <li>
                        <Link to="/admin/concerts">Concerts</Link>
                      </li>
                      <li>
                        <Link to="/admin/artists">Artists</Link>
                      </li>
                    </ul>
                  </li>
                  <li>
                    <Link to="/admin/bookings">Bookings</Link>
                  </li>
                  <li>
                    <Link to="/admin/users">Users</Link>
                  </li>
                  <li>
                    <Link to="/admin/logout">Logout</Link>
                  </li>
                </ul>
              </nav>
            ) : (
              <nav className="nav-menu">
                <ul className="nav-links">
                  <li>
                    <Link to="/">Home</Link>
                  </li>
                  <li>
                    <Link to="/concert/list">Concerts</Link>
                  </li>
                  <li>
                    <Link to="/artists/list">Artists</Link>
                  </li>

                  {userpresent ? (
                    <Link to={"/user/profile"}>
                      <img
                        className="profilepic"
                        src={
                          userdetails?.profileImage?.data
                            ? `data:${userdetails.profileImage.contentType};base64,${userdetails.profileImage.data}`
                            : "/images/default-profile.jpg"
                        }
                        alt="profile"
                      />
                    </Link>
                  ) : (
                    <li>
                      <div className="header-right">
                        <Link to="/user/login">
                          <i className="fa-regular fa-user"></i> Login/Register
                        </Link>
                      </div>
                    </li>
                  )}
                </ul>
              </nav>
            )}
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
