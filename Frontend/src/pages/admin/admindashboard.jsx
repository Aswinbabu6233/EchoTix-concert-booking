import React, { useEffect, useState } from "react";
import Header from "../../Components/NavBar/Navbar";
import { useSelector } from "react-redux";
import axios from "axios";
import BASE_API from "../../config/baseapi";
import Loader from "../../Components/Loading/loading";
import FlashMessage from "../../Components/flash/flash";
import { Link } from "react-router-dom";
import defaultimage from "../../assets/default-profile.jpg";

const AdminDashboard = () => {
  const user = useSelector((state) => state.user);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setloading] = useState(true);
  const [dashboardData, setDashBoardData] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get(`${BASE_API}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setloading(false);
        setDashBoardData(response.data);
      } catch (error) {
        setloading(false);
        setError("Failed to load dashboard data");
        console.error(error);
      }
    };
    fetchDashboard();
  }, [user.token]);

  if (loading) {
    return <Loader />;
  }
  return (
    <>
      <Header />

      <div className="main-container">
        <div className="innercontainer">
          <section className="dash-top">
            <div className="admin-top">
              <h1>ADMIN</h1>
              <h1>DASHBOARD</h1>
            </div>
            <div className="admin-details">
              <h2>Welcome Back !</h2>
              <p>{user.name}</p>
            </div>
          </section>
          {error && <FlashMessage type="error" message={error} />}
          {success && <FlashMessage type="error" message={success} />}

          <section className="summary-card">
            <div className="card">
              <h3>
                <span>
                  <i className="fa-solid fa-user"></i>
                </span>{" "}
                Total Users
              </h3>
              <p>{dashboardData.users.length}</p>
            </div>

            <div className="card">
              <h3>
                <span>
                  <i className="fa-solid fa-sack-dollar"></i>
                </span>{" "}
                Total Revenue
              </h3>
              <p>
                <i className="fa-solid fa-indian-rupee-sign"></i>
                {dashboardData.revenue}
              </p>
            </div>

            <div className="card">
              <h3>
                <span>
                  <i className="fa-solid fa-ticket"></i>
                </span>{" "}
                Total Bookings
              </h3>
              <p>{dashboardData.bookings.length}</p>
            </div>

            <div className="card">
              <h3>
                <span>
                  <i className="fa-regular fa-calendar"></i>
                </span>{" "}
                Upcoming Concerts
              </h3>
              <p>{dashboardData.upcomingConcerts.length}</p>
            </div>
          </section>
          <section className="recentandquick">
            <div className="recentactivity">
              <h2>Recent Activity</h2>
              {dashboardData.recentActivities &&
                dashboardData.recentActivities ? (
                dashboardData.recentActivities.map((activity, index) => (
                  <div key={index} className="activity">
                    <span className="icon">
                      <i className={`fa-solid ${activity.icon}`}></i>
                    </span>
                    <p>{activity.message}</p>
                  </div>
                ))
              ) : (
                <p>No Recent Activities </p>
              )}
            </div>
            <div className="quickaccess">
              <h2>Quick Access</h2>
              <div className="quickbtn">
                <Link to="/admin/settings">
                  <i className="fa-solid fa-users"></i> Manage Artists
                </Link>
                <Link to="/admin/logout">
                  <i className="fa-solid fa-guitar"></i> Manage Bands
                </Link>
                <Link to="/admin/bookings">
                  <i className="fa-solid fa-ticket"></i> Manage Bookings
                </Link>
                <Link to="/admin/concerts">
                  <i className="fa-solid fa-calendar-days"></i> Manage Concerts
                </Link>
                <Link to="/admin/users">
                  <i className="fa-solid fa-user-gear"></i> Manage Users
                </Link>
              </div>
            </div>
          </section>

          {/* recent 5 user */}
          <section className="recentmanagements">
            <div className="recent-top">
              <h3>Recent Users</h3>
              <span>View All</span>
            </div>
            <div className="managementstable">
              <table>
                <thead>
                  <tr>
                    <th>Profile Pic</th>
                    <th>Username</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.showusers &&
                    dashboardData.showusers.map((show, index) => (
                      <tr key={index}>
                        <td>
                          {show.profileImage &&
                            show.profileImage.data &&
                            show.profileImage.contentType ? (
                            <img
                              src={
                                show?.profileImage?.data &&
                                `data:${show.profileImage.contentType};base64,${show.profileImage.data}`
                              }
                              alt="User profile"
                            />
                          ) : (
                            <img src={defaultimage} alt="" />
                          )}
                        </td>
                        <td>{show.username}</td>
                        <td>{show.email}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
          {/* recent 5 concert */}
          <section className="recentmanagements">
            <div className="recent-top">
              <h3>Recent Concerts</h3>
              <span>View All</span>
            </div>
            <div className="managementstable">
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Venue</th>
                    <th>Date</th>
                    <th>city</th>
                    <th>ticketPrice</th>
                    <th>totalTickets</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.showconcerts &&
                    dashboardData.showconcerts.map((show, index) => (
                      <tr key={index}>
                        <td>
                          <img
                            src={
                              show?.concertImage?.data &&
                              `data:${show.concertImage.contentType};base64,${show.concertImage.data}`
                            }
                          />
                        </td>
                        <td>{show.title}</td>
                        <td>{show.venue}</td>
                        <td>
                          {new Date(show.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </td>
                        <td>{show.city}</td>
                        <td>₹{show.ticketPrice}</td>
                        <td>{show.totalTickets}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
          {/* recent 5 bands */}
          <div className="recentmanagements">
            <div className="recent-top">
              <h3>Recent Bands</h3>
              <span>View All</span>
            </div>
            <div className="managementstable">
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.showbands.map((show, index) => (
                    <tr key={index}>
                      <td>
                        <img
                          src={
                            show?.image?.data &&
                            `data:${show.image.contentType};base64,${show.image.data}`
                          }
                        />
                      </td>
                      <td>{show.name}</td>
                      <td>{show.discription.substring(0, 101)}...</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* recent 5 artist */}
          <section className="recentmanagements">
            <div className="recent-top">
              <h3>Recent Artists</h3>
              <span>View All</span>
            </div>
            <div className="managementstable">
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Band</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.showartists.map((show, index) => (
                    <tr key={index}>
                      <td>
                        <img
                          src={
                            show?.photo?.data &&
                            `data:${show.photo.contentType};base64,${show.photo.data}`
                          }
                        />
                      </td>
                      <td>{show.name}</td>
                      <td>{show.role}</td>
                      <td>{show.band ? show.band.name : "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
