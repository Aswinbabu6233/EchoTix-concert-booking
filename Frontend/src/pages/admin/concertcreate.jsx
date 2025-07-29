import React, { useState, useEffect } from "react";
import Header from "../../Components/NavBar/Navbar";
import FlashMessage from "../../Components/flash/flash";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import BASE_API from "../../config/baseapi";

const Concertcreate = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [bands, setBands] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: "",
    city: "",
    venue: "",
    locationMapUrl: "",
    ticketPrice: "",
    totalTickets: "",
    ticketsAvailable: "",
    bookingEndsAt: "",
    band: "",
    tags: "",
    concertImage: null,
  });

  // Fetch bands
  useEffect(() => {
    const fetchBand = async () => {
      try {
        const response = await axios.get(
          `${BASE_API}/admin/create/concerts/details`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        setBands(response.data.bands || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load bands");
      }
    };
    fetchBand();
  }, [user.token]);

  // Input handler
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = new FormData();
      for (const key in formData) {
        if (formData[key]) data.append(key, formData[key]);
      }

      const res = await axios.post(`${BASE_API}/admin/concerts`, data, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 201) {
        setSuccess("Concert created successfully!");
        setTimeout(() => navigate("/admin/concerts"), 2000);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to create concert.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="main-container">
        <div className="sub-container">
          <h2>Band Creation</h2>

          {error && <FlashMessage type="error" message={error} />}
          {success && <FlashMessage type="success" message={success} />}

          <form
            className="Bandform"
            encType="multipart/form-data"
            onSubmit={handleSubmit}
          >
            <label htmlFor="title">Concert Title:</label>
            <input
              type="text"
              name="title"
              id="title"
              placeholder="Enter concert title"
              value={formData.title}
              onChange={handleChange}
              required
            />

            <label htmlFor="description">Description:</label>
            <textarea
              name="description"
              id="description"
              placeholder="Write a short description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>

            <label htmlFor="date">Concert Date:</label>
            <input
              type="date"
              name="date"
              id="date"
              value={formData.date}
              onChange={handleChange}
              required
            />

            <label htmlFor="time">Start Time:</label>
            <input
              type="time"
              name="time"
              id="time"
              value={formData.time}
              onChange={handleChange}
              required
            />

            <label htmlFor="duration">Duration (in minutes):</label>
            <input
              type="number"
              name="duration"
              id="duration"
              placeholder="e.g., 120"
              value={formData.duration}
              onChange={handleChange}
              required
            />

            <label htmlFor="city">City:</label>
            <input
              type="text"
              name="city"
              id="city"
              placeholder="e.g., Kochi"
              value={formData.city}
              onChange={handleChange}
              required
            />

            <label htmlFor="venue">Venue:</label>
            <input
              type="text"
              name="venue"
              id="venue"
              placeholder="e.g., Madison Square Garden"
              value={formData.venue}
              onChange={handleChange}
              required
            />

            <label htmlFor="locationMapUrl">Google Maps Embed URL:</label>
            <input
              type="url"
              name="locationMapUrl"
              id="locationMapUrl"
              placeholder="Paste iframe embed src link here"
              value={formData.locationMapUrl}
              onChange={handleChange}
              required
            />

            <label htmlFor="ticketPrice">Ticket Price (₹):</label>
            <input
              type="number"
              name="ticketPrice"
              id="ticketPrice"
              placeholder="e.g., 499"
              value={formData.ticketPrice}
              onChange={handleChange}
              required
            />

            <label htmlFor="totalTickets">Total Tickets:</label>
            <input
              type="number"
              name="totalTickets"
              id="totalTickets"
              placeholder="e.g., 300"
              value={formData.totalTickets}
              onChange={handleChange}
              required
            />

            <label htmlFor="ticketsAvailable">Tickets Available:</label>
            <input
              type="number"
              name="ticketsAvailable"
              id="ticketsAvailable"
              placeholder="e.g., 200"
              value={formData.ticketsAvailable}
              onChange={handleChange}
              required
            />

            <label htmlFor="bookingEndsAt">Booking Ends At:</label>
            <input
              type="datetime-local"
              name="bookingEndsAt"
              id="bookingEndsAt"
              value={formData.bookingEndsAt}
              onChange={handleChange}
            />

            <label htmlFor="band">Select Band:</label>
            <select
              name="band"
              id="band"
              value={formData.band}
              onChange={handleChange}
              required
            >
              <option value="">-- Choose a band --</option>
              {bands.map((band) => (
                <option key={band._id} value={band._id}>
                  {band.name}
                </option>
              ))}
            </select>

            <label htmlFor="tags">Tags (comma-separated):</label>
            <input
              type="text"
              name="tags"
              id="tags"
              placeholder="e.g., rock,live,festival"
              value={formData.tags}
              onChange={handleChange}
            />

            <label htmlFor="concertImage">Concert Banner:</label>
            <input
              type="file"
              name="concertImage"
              id="concertImage"
              accept="image/*"
              onChange={handleChange}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Concert"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Concertcreate;
