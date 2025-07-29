import React, { useEffect, useState } from "react";
import Header from "../../Components/NavBar/Navbar";
import FlashMessage from "../../Components/flash/flash";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_API from "../../config/baseapi";
import { useSelector } from "react-redux";

const Concertedit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [concert, setConcert] = useState(null);
  const [bands, setBands] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchConcert = async () => {
      try {
        const response = await axios.get(
          `${BASE_API}/admin/edit/concerts/${id}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        setConcert(response.data.concert);
        setBands(response.data.bands);
      } catch (err) {
        setError("Failed to load concert details.");
      }
    };
    fetchConcert();
  }, [id, user.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    try {
      const response = await axios.post(
        `${BASE_API}/admin/edit/concerts/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSuccess(response.data.message);
      navigate("/admin/concerts");
    } catch (err) {
      console.error(err);
      setError("Concert update failed.");
    }
  };

  if (!concert) return <div>Loading...</div>;

  return (
    <>
      <Header />
      <div className="main-container">
        <div className="innercontainer">
          <h2>EDIT CONCERT DETAILS</h2>
          {error && <FlashMessage type="error" message={error} />}
          {success && <FlashMessage type="success" message={success} />}

          <section className="edit-data">
            <form
              onSubmit={handleSubmit}
              className="Bandform"
              encType="multipart/form-data"
            >
              <label>Current Photo</label>
              <div className="photo-box">
                {concert.concertImage && concert.concertImage.data ? (
                  <img
                    src={`data:${concert.concertImage.contentType};base64,${concert.concertImage.data}`}
                    alt="Current Concert Photo"
                  />
                ) : (
                  <em>No image stored.</em>
                )}
              </div>

              <label>Title</label>
              <input
                type="text"
                name="title"
                defaultValue={concert.title}
                required
              />

              <label>Description</label>
              <textarea
                name="description"
                rows="6"
                defaultValue={concert.description}
                required
              />

              <label>Date</label>
              <input
                type="date"
                name="date"
                defaultValue={concert.date?.split("T")[0]}
                required
              />

              <label>Time</label>
              <input
                type="time"
                name="time"
                defaultValue={concert.time}
                required
              />

              <label>Duration (minutes)</label>
              <input
                type="number"
                name="duration"
                defaultValue={concert.duration}
                required
              />

              <label>City</label>
              <input
                type="text"
                name="city"
                defaultValue={concert.city}
                required
              />

              <label>Venue</label>
              <input
                type="text"
                name="venue"
                defaultValue={concert.venue}
                required
              />

              <label>Location Map URL (optional)</label>
              <input
                type="url"
                name="locationMapUrl"
                defaultValue={concert.locationMapUrl}
              />

              <label>Ticket Price (₹)</label>
              <input
                type="number"
                name="ticketPrice"
                defaultValue={concert.ticketPrice}
                required
              />

              <label>Total Tickets</label>
              <input
                type="number"
                name="totalTickets"
                defaultValue={concert.totalTickets}
                required
              />

              <label>Tickets Available</label>
              <input
                type="number"
                name="ticketsAvailable"
                defaultValue={concert.ticketsAvailable}
                required
              />

              <label>Booking Ends At</label>
              <input
                type="datetime-local"
                name="bookingEndsAt"
                defaultValue={
                  concert.bookingEndsAt
                    ? new Date(concert.bookingEndsAt).toISOString().slice(0, 16)
                    : ""
                }
              />

              <label>Band</label>
              <select name="band" defaultValue={concert.band?._id} required>
                {bands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>

              <label>Tags (comma-separated)</label>
              <input
                type="text"
                name="tags"
                defaultValue={concert.tags?.join(", ")}
              />

              <label>Status</label>
              <select name="status" defaultValue={concert.status} required>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
                <option value="canceled">Canceled</option>
              </select>

              <label>Change Photo (optional)</label>
              <input type="file" name="photo" accept="image/*" />

              <button type="submit">Update Concert</button>
            </form>
          </section>
        </div>
      </div>
    </>
  );
};

export default Concertedit;
