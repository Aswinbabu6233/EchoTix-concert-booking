import React, { useEffect, useState } from "react";
import Header from "../Components/NavBar/Navbar";
import ProfileSidebar from "../Components/NavBar/profilesidebar";
import axios from "axios";
import TicketCard from "../Components/ticketcard/ticketcard";
import { useSelector } from "react-redux";
import Loader from "../Components/Loading/loading";
import BASE_API from "../config/baseapi";

const UserTickets = () => {
  const { token } = useSelector((state) => state.user);
  const [tickets, setTickets] = useState({
    upcomingTickets: [],
    pastTickets: [],
    cancelledTickets: [],
  });
  const [loading, setloading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axios.get(`${BASE_API}/user/tickets`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setloading(false);
        setTickets(res.data);
      } catch (error) {
        console.error("Failed to fetch tickets", error);
      }
    };
    fetchTickets();
  }, []);

  const getFilteredTickets = () => {
    if (filter === "past") return tickets.pastTickets;
    if (filter === "upcoming") return tickets.upcomingTickets;
    if (filter === "cancelled") return tickets.cancelledTickets;
    return [
      ...tickets.upcomingTickets,
      ...tickets.pastTickets,
      ...tickets.cancelledTickets,
    ];
  };

  if (loading) {
    return <Loader />;
  }
  return (
    <>
      <Header />
      <div className="main-container">
        <div className="innercontainer">
          <div className="common-card">
            <div className="user-ticket">
              <div className="profile-header">
                <h2>🎟️ Your Ticket History</h2>
                <p>Click each section below to view ticket details.</p>
                <div className="button-row">
                  <button
                    onClick={() => setFilter("all")}
                    className="btn ticketselect"
                  >
                    View All
                  </button>
                  <button
                    onClick={() => setFilter("past")}
                    className="btn ticketselect"
                  >
                    Past
                  </button>
                  <button
                    onClick={() => setFilter("upcoming")}
                    className="btn ticketselect"
                  >
                    Upcoming
                  </button>
                  <button
                    onClick={() => setFilter("cancelled")}
                    className="btn ticketselect"
                  >
                    Cancelled
                  </button>
                </div>
              </div>

              <div className="Ticket-details">
                {getFilteredTickets().length === 0 ? (
                  <p>No tickets found.</p>
                ) : (
                  getFilteredTickets().map((ticket) => (
                    <TicketCard key={ticket._id} ticket={ticket} />
                  ))
                )}
              </div>
            </div>

            <ProfileSidebar />
          </div>
        </div>
      </div>
    </>
  );
};

export default UserTickets;
