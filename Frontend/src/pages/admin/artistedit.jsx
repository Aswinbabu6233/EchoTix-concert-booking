import React, { useEffect, useState } from "react";
import Header from "../../Components/NavBar/Navbar";
import { useSelector } from "react-redux";
import Loader from "../../Components/Loading/loading";
import axios from "axios";
import BASE_API from "../../config/baseapi";
import FlashMessage from "../../Components/flash/flash";
import { useNavigate, useParams } from "react-router-dom";

const Artistedit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useSelector((state) => state.user);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setloading] = useState(true);
  const [artistData, setArtistData] = useState(null);
  const [band, setBandId] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const response = await axios.get(`${BASE_API}/admin/get/artist/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        const artist = response.data.artist;
        setArtistData(response.data);
        setName(artist.name || "");
        setRole(artist.role || "");
        setDescription(artist.description || "");
        setBandId(artist.band?._id || "");
        setSuccess("Data loaded successfully");
      } catch (error) {
        setError("Failed to load artist data");
        console.error(error);
      } finally {
        setloading(false);
      }
    };
    fetchArtist();
  }, [id, user.token]);

  const updateartist = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("role", role);
    formData.append("description", description);
    formData.append("bandId", band);
    const photo = e.target.photo.files[0];
    if (photo) {
      formData.append("photo", photo);
    }
    setloading(true);
    try {
      await axios.post(`${BASE_API}/admin/edit/artist/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setloading(false);
      navigate(-1);
      setSuccess("Artist updated successfully");
    } catch (error) {
      setloading(false);
      setError("Failed to update artist");
      console.error(error);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Header />
      <div className="main-container">
        <div className="innercontainer">
          <h2>EDIT ARTIST DETAILS</h2>
          {error && <FlashMessage type="error" message={error} />}
          {success && <FlashMessage type="success" message={success} />}
          <section className="edit-data">
            <form
              method="post"
              className="Bandform"
              encType="multipart/form-data"
              onSubmit={updateartist}
            >
              {/* Current Photo */}
              <label htmlFor="CurrentPhoto">Current Photo</label>
              <div className="photo-box">
                {artistData.artist?.photo?.data ? (
                  <img
                    src={`data:${artistData.artist.photo.contentType};base64,${artistData.artist.photo.data}`}
                    alt="artist img"
                  />
                ) : (
                  <em>No Image stored.</em>
                )}
              </div>

              {/* Name */}
              <label htmlFor="name">Name</label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              {/* Role */}
              <label htmlFor="role">Role</label>
              <input
                type="text"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              />

              {/* Description */}
              <label htmlFor="description">Description</label>
              <textarea
                name="description"
                rows="6"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>

              {/* Band */}
              <label htmlFor="bandId">Band</label>
              <select
                name="bandId"
                value={band}
                onChange={(e) => setBandId(e.target.value)}
                required
              >
                {artistData.bands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>

              {/* Change Photo */}
              <label htmlFor="photo">Change Photo (Optional)</label>
              <input type="file" name="photo" accept="image/*" />

              <button type="submit">Update Artist</button>
            </form>
          </section>
        </div>
      </div>
    </>
  );
};

export default Artistedit;
