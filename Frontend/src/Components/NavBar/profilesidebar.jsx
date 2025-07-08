import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { clearUser } from "../redux/userslice";

const ProfileSidebar = () => {
  const [display, setDisplay] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setDisplay(!display);
  };
  const handleLogout = () => {
    dispatch(clearUser()); // clear redux state
    localStorage.removeItem("user"); // remove from localStorage
    navigate("/"); // redirect to login page
  };

  return (
    <div className={`ProfileSidebar ${display ? "expanded" : "collapsed"}`}>
      <i
        className={`fa-solid ${
          display ? "fa-angles-left" : "fa-angles-right"
        } toggle`}
        onClick={toggleSidebar}
      ></i>

      <ul className="sidebarul">
        <li>
          <Link to={"/user/profile"}>
            <i className="fa-solid fa-user"></i>
            {display && <span>My Profile</span>}
          </Link>
        </li>
        <li>
          <Link to={"/user/Ticket"}>
            <i className="fa-solid fa-ticket"></i>
            {display && <span>My Tickets</span>}
          </Link>
        </li>
        <li onClick={handleLogout}>
          <i className="fa-solid fa-right-from-bracket"></i>
          {display && <span>Logout</span>}
        </li>
      </ul>
    </div>
  );
};

export default ProfileSidebar;
