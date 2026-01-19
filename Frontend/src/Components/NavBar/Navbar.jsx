import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import "./Navbar.css";
import { getUserImageUrl } from "../../utils/imageUtils";

const Header = ({ hidenav }) => {
  const user = useSelector((state) => state.user);
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const adminpresent = user?.role === "admin";
  const userpresent = user?.role === "user";
  const userdetails = user;

  // Handle scroll effect for navbar background opacity if needed (optional enhancement)
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (hidenav) return null;

  return (
    <header className={`navbar-header ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <Link to={adminpresent ? "/admin/dashboard" : "/"}>ECHOTIX</Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="navbar-menu">
          {adminpresent ? (
            <ul className="nav-links">
              <li>
                <Link className="nav-link" to="/admin/dashboard">
                  Dashboard
                </Link>
              </li>
              <li className="dropdown-container">
                <span className="nav-link dropdown-trigger">
                  Management <i className="fa-solid fa-caret-down"></i>
                </span>
                <ul className="dropdown-menu">
                  <li>
                    <Link className="dropdown-item" to="/admin/bands">
                      Bands
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/admin/concerts">
                      Concerts
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/admin/artists">
                      Artists
                    </Link>
                  </li>
                </ul>
              </li>
              <li>
                <Link className="nav-link" to="/admin/bookings">
                  Bookings
                </Link>
              </li>
              <li>
                <Link className="nav-link" to="/admin/users">
                  Users
                </Link>
              </li>
              <li>
                <Link className="nav-link" to="/admin/logout">
                  Logout
                </Link>
              </li>
            </ul>
          ) : (
            <ul className="nav-links">
              <li>
                <Link className="nav-link" to="/">
                  Home
                </Link>
              </li>
              <li>
                <Link className="nav-link" to="/concert/list">
                  Concerts
                </Link>
              </li>
              <li>
                <Link className="nav-link" to="/artists/list">
                  Artists
                </Link>
              </li>
            </ul>
          )}

          {/* User Profile / Auth Buttons (Desktop) */}
          <div className="auth-buttons">
            {!adminpresent && (
              <>
                {userpresent ? (
                  <Link to="/user/profile" className="profile-pic-container">
                    <img
                      className="nav-profile-pic"
                      src={getUserImageUrl(userdetails?.userId) || "/images/default-profile.jpg"}
                      alt="profile"
                      onError={(e) => { e.target.src = "/images/default-profile.jpg"; }}
                    />
                  </Link>
                ) : (
                  <Link to="/user/login" className="login-link">
                    <i className="fa-regular fa-user"></i> Login / Register
                  </Link>
                )}
              </>
            )}
          </div>
        </nav>

        {/* Mobile Hamburger Toggle */}
        <div
          className={`mobile-toggle ${isMobileMenuOpen ? "open" : ""}`}
          onClick={toggleMobileMenu}
        >
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>

        {/* Mobile Menu Drawer */}
        <div
          className={`mobile-nav-overlay ${isMobileMenuOpen ? "open" : ""}`}
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>

        <div className={`mobile-nav-content ${isMobileMenuOpen ? "open" : ""}`}>
          {adminpresent ? (
            <ul className="mobile-nav-links">
              <li>
                <Link className="mobile-nav-link" to="/admin/dashboard">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link className="mobile-nav-link" to="/admin/bands">
                  Bands
                </Link>
              </li>
              <li>
                <Link className="mobile-nav-link" to="/admin/concerts">
                  Concerts
                </Link>
              </li>
              <li>
                <Link className="mobile-nav-link" to="/admin/artists">
                  Artists
                </Link>
              </li>
              <li>
                <Link className="mobile-nav-link" to="/admin/bookings">
                  Bookings
                </Link>
              </li>
              <li>
                <Link className="mobile-nav-link" to="/admin/users">
                  Users
                </Link>
              </li>
              <li>
                <Link className="mobile-nav-link" to="/admin/logout">
                  Logout
                </Link>
              </li>
            </ul>
          ) : (
            <ul className="mobile-nav-links">
              <li>
                <Link className="mobile-nav-link" to="/">
                  Home
                </Link>
              </li>
              <li>
                <Link className="mobile-nav-link" to="/concert/list">
                  Concerts
                </Link>
              </li>
              <li>
                <Link className="mobile-nav-link" to="/artists/list">
                  Artists
                </Link>
              </li>
              {userpresent ? (
                <li>
                  <Link className="mobile-nav-link" to="/user/profile">
                    My Profile
                  </Link>
                </li>
              ) : (
                <li>
                  <Link className="mobile-nav-link" to="/user/login">
                    Login / Register
                  </Link>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
