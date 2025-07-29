import React, { useEffect, useState } from "react";
import Header from "../../Components/NavBar/Navbar";
import axios from "axios";
import BASE_API from "../../config/baseapi";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../../Components/Loading/loading";
import FlashMessage from "../../Components/flash/flash";

const Bandedit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useSelector((state) => state.user);

  const [banddata, setBanddata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchBand = async () => {
      try {
        const response = await axios.get(`${BASE_API}/admin/edit/band/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        const band = response.data.band;
        setBanddata(response.data);
        setName(band.name || "");
        setDescription(band.discription || "");
        setLoading(false);
      } catch (err) {
        console.error("Error fetching band data:", err);
        setError("Error loading band details");
        setLoading(false);
      }
    };

    fetchBand();
  }, [id, user.token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);

    const image = e.target.image.files[0];
    if (image) {
      formData.append("image", image);
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_API}/admin/edit/band/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            // DO NOT manually set Content-Type when using FormData
          },
        }
      );

      // if (response.data.success) {

      // } else {
      //   setError("Failed to update band. Try again.");
      //   console.log();

      // }
      setSuccess("Band updated successfully");
      setTimeout(() => navigate(-1), 1500);
    } catch (err) {
      console.error("Update error:", err?.response?.data || err.message);
      setError("Failed to update band");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <Header />
      <div className="main-container">
        <div className="innercontainer">
          <h2>EDIT BAND DETAILS</h2>
          {success && <FlashMessage type="success" message={success} />}
          {error && <FlashMessage type="error" message={error} />}

          <section className="edit-data">
            <form
              method="post"
              className="Bandform"
              encType="multipart/form-data"
              onSubmit={handleSubmit}
            >
              <label>Current Photo</label>
              <div className="photo-box">
                {banddata?.band?.image?.data ? (
                  <img
                    src={`data:${banddata.band.image.contentType};base64,${banddata.band.image.data}`}
                    alt="Current Band"
                  />
                ) : (
                  <em>No image available.</em>
                )}
              </div>

              <label>Name</label>
              <input
                type="text"
                name="name"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
              />

              <label>Description</label>
              <textarea
                name="description"
                rows="6"
                value={description}
                required
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>

              <label htmlFor="image">Change Photo (optional)</label>
              <input type="file" name="image" accept="image/*" />

              <button type="submit">Update Band</button>
            </form>
          </section>
        </div>
      </div>
    </>
  );
};

export default Bandedit;
