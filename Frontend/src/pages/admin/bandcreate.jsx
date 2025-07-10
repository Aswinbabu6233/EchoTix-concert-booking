import React from "react";
import Header from "../../Components/NavBar/Navbar";
import { useState } from "react";
import { useSelector } from "react-redux";

const Bandcreate = () => {
  const user = useSelector((state) => state.user);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [name, setname] = useState("");
  const [discription, setdiscription] = useState("");
  const [photo, setphoto] = useState(null);

  const addband = async () => {};

  return (
    <>
      <Header />
      <div class="main-container">
        <div class="sub-container">
          <h2>Band Creation</h2>
          {error && <FlashMessage type="error" message={error} />}
          {success && <FlashMessage type="success" message={success} />}

          <form
            className="Bandform"
            encType="multipart/form-data"
            method="post"
            onSubmit={addband}
          >
            <label for="bandname">Band Name:</label>
            <input
              type="text"
              name="bandname"
              value={name}
              onChange={(e) => setname(e.target.value)}
            />
            <label for="banddiscription">Band Description:</label>
            <textarea
              name="banddiscription"
              id="banddiscription"
              value={discription}
              required
              onChange={(e) => setdiscription(e.target.value)}
              rows="5"
            ></textarea>

            <label for="bandimg">Band Img</label>
            <input
              type="file"
              name="bandimg"
              id="bandimg"
              value={photo}
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
