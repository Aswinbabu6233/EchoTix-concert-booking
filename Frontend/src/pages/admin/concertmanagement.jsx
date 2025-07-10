import React, { useEffect, useState } from "react";
import Header from "../../Components/NavBar/Navbar";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../../Components/Loading/loading";
import FlashMessage from "../../Components/flash/flash";
import axios from "axios";
import BASE_API from "../../config/baseapi";

const Concertmanagement = () => {
  const user = useSelector((state) => state.user);
  const [success, setsuccessmsg] = useState(null);
  const [error, seterror] = useState(null);
  const [loading, setloading] = useState(true);
  const [Concertdata, setconcertdata] = useState("");

  useEffect(() => {
    const fetchband = async () => {
      try {
        const response = await axios.get(`${BASE_API}/admin/concerts`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setloading(false);
        setconcertdata(response.data);
        setsuccessmsg("Data Loaded succes fully");
      } catch (error) {
        setloading(false);
        seterror("Failed to load Band Detail from DataBase");
        console.error(error);
      }
    };
    fetchband();
  }, [user.token]);
  if (loading) {
    return <Loader />;
  }
  return (
    <>
      <Header />
      <div className="main-container">
        <div className="innercontainer">
          <section className="Manage-top">
            <h1>Concert Management</h1>
            <Link to={"/admin/create/concerts"}>Add Concert</Link>
          </section>
          {success && <FlashMessage type="success" message={success} />}
          {error && <FlashMessage type="error" message={error} />}
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
                    <th>Band</th>
                    <th>ticketPrice</th>
                    <th>total Tickets</th>
                    <th>Available Tickets</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {Concertdata.concerts &&
                    Concertdata.concerts.map((show, index) => (
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
                        <td>{show.band ? show.band.name : "N/A"}</td>
                        <td>₹{show.ticketPrice}</td>
                        <td>{show.totalTickets}</td>
                        <td>{show.ticketsAvailable}</td>
                        <td>
                          <button className="edit">
                            <i className="fa-solid fa-file-pen"></i>
                          </button>
                        </td>
                        <td>
                          {" "}
                          <button
                            type="submit"
                            className="delete"
                            onclick="return confirm('Are you sure you want to delete this review?')"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </td>
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

export default Concertmanagement;
