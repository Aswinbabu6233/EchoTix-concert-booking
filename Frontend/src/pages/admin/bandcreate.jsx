import React from "react";
import Header from "../../Components/NavBar/Navbar";
import { useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import BASE_API from "../../config/baseapi";
import { useNavigate } from "react-router-dom";
import Loader from "../../Components/Loading/loading";
import FlashMessage from "../../Components/flash/flash";

const Bandcreate = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [name, setname] = useState("");
  const [discription, setdiscription] = useState("");
  const [photo, setphoto] = useState(null);
  const [loading, setloading] = useState(false);

  const addband = async (e) => {
    setloading(true);
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("bandname", name);
      formData.append("banddiscription", discription);
      formData.append("bandimg", photo);

      const res = await axios.post(
        `${BASE_API}/admin/create/bandsubmit`,
        formData,
        {
          headers: { Authorization: `Bearer ${user.token}` },
          "Content-Type": "multipart/form-data",
        }
      );
      setSuccess("Artists created successfully");
      setloading(false);
      setname("");
      setdiscription("");
      setphoto(null);
      navigate(-1);
    } catch (error) {
      setError("Error occurs when creating Band");
    }
  };
  if (loading) {
    return <Loader />;
  }
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
            method="post"
            onSubmit={addband}
          >
            <label htmlFor="bandname">Band Name:</label>
            <input
              type="text"
              name="bandname"
              value={name}
              onChange={(e) => setname(e.target.value)}
            />
            <label htmlFor="banddiscription">Band Description:</label>
            <textarea
              name="banddiscription"
              id="banddiscription"
              value={discription}
              required
              onChange={(e) => setdiscription(e.target.value)}
              rows="5"
            ></textarea>

            <label htmlFor="bandimg">Band Img</label>
            <input
              type="file"
              name="bandimg"
              id="bandimg"
              required
              onChange={(e) => setphoto(e.target.files[0])}
            />

            <button type="submit">Create Band</button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Bandcreate;
