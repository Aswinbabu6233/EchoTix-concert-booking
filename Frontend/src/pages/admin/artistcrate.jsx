import React, { useEffect, useState } from "react";
import Header from "../../Components/NavBar/Navbar";
import { useSelector } from "react-redux";
import FlashMessage from "../../Components/flash/flash";
import BASE_API from "../../config/baseapi";
import Loader from "../../Components/Loading/loading";
import axios from "axios";

const Artistcrate = () => {
  const user = useSelector((state) => state.user);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [bandData, setBandData] = useState([]);
  const [selectedBand, setSelectedBand] = useState("");
  const [artists, setArtists] = useState([
    { name: "", role: "", description: "", photo: null },
  ]);

  useEffect(() => {
    const fetchBand = async () => {
      try {
        const response = await axios.get(`${BASE_API}/admin/bands`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setBandData(response.data.bands || []);
        setSuccess("Bands loaded successfully");
      } catch (error) {
        console.error(error);
        setError("Failed to load bands");
      } finally {
        setLoading(false);
      }
    };
    fetchBand();
  }, [user.token]);

  const handleArtistChange = (index, field, value) => {
    const updatedArtists = [...artists];
    updatedArtists[index][field] = value;
    setArtists(updatedArtists);
  };

  const addArtist = () => {
    setArtists([
      ...artists,
      { name: "", role: "", description: "", photo: null },
    ]);
  };

  const removeArtist = (index) => {
    const updatedArtists = artists.filter((_, i) => i !== index);
    setArtists(updatedArtists);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedBand) {
      setError("Please select a band");
      return;
    }

    const formData = new FormData();
    formData.append("bandId", selectedBand);

    artists.forEach((artist) => {
      formData.append("name", artist.name);
      formData.append("role", artist.role);
      formData.append("description", artist.description);
      if (artist.photo) {
        formData.append("photos", artist.photo); // must be 'photos'
      }
    });

    try {
      const response = await axios.post(
        `${BASE_API}/admin/create/multiartistsubmit`, // Updated route for multi-artist API
        formData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSuccess("Artists created successfully");
      setArtists([{ name: "", role: "", description: "", photo: null }]);
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.errors?.[0]?.msg ||
          "Failed to create artists. Please check your inputs."
      );
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <Header />
      <div className="main-container">
        <div className="sub-container">
          <h2>Artist Creation</h2>

          <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            id="artistForm"
          >
            <label htmlFor="SelectBand">Select Band</label>
            <select
              name="bandId"
              value={selectedBand}
              onChange={(e) => setSelectedBand(e.target.value)}
              required
            >
              <option value="">-- Select Band --</option>
              {bandData.map((band) => (
                <option key={band._id} value={band._id}>
                  {band.name}
                </option>
              ))}
            </select>

            <div id="artistInputs">
              {artists.map((artist, index) => (
                <div className="artistGroup" key={index}>
                  <input
                    type="text"
                    placeholder="Artist name"
                    required
                    value={artist.name}
                    onChange={(e) =>
                      handleArtistChange(index, "name", e.target.value)
                    }
                  />
                  <input
                    type="text"
                    placeholder="Role (e.g., Drummer)"
                    required
                    value={artist.role}
                    onChange={(e) =>
                      handleArtistChange(index, "role", e.target.value)
                    }
                  />
                  <textarea
                    rows="5"
                    placeholder="Artist Description.."
                    value={artist.description}
                    onChange={(e) =>
                      handleArtistChange(index, "description", e.target.value)
                    }
                  ></textarea>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleArtistChange(index, "photo", e.target.files[0])
                    }
                    required
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeArtist(index)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="btn-row">
              <button type="button" className="add-btn" onClick={addArtist}>
                + Add Another Artist
              </button>
              <button type="submit" className="submit-btn">
                Create Artists
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Artistcrate;
