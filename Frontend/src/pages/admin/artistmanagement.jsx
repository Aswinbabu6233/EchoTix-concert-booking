import React, { useEffect, useState } from "react";
import Header from "../../Components/NavBar/Navbar";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../../Components/Loading/loading";
import BASE_API from "../../config/baseapi";
import axios from "axios";
import FlashMessage from "../../Components/flash/flash";
import { getArtistImageUrl } from "../../utils/imageUtils";

const Artistmanagement = () => {
  const user = useSelector((state) => state.user);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setloading] = useState(true);
  const [artistData, setArtistData] = useState(null);

  const fetchArtist = async () => {
    try {
      const response = await axios.get(`${BASE_API}/admin/artists`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setloading(false);
      setArtistData(response.data);
      setSuccess("Data Loaded succes fully");
    } catch (error) {
      setloading(false);
      setError("Failed to load dashboard data");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchArtist();
  }, [user.token]);

  const deleteartist = async (id) => {
    setloading(true);
    setSuccess("");
    setError("");
    try {
      const response = await axios.post(
        `${BASE_API}/admin/delete/artist/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setloading(false);
      setSuccess("Artist deleted successfully");
      fetchArtist();
    } catch (error) {
      setError("Error Deleting Artist");
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
          <section className="Manage-top">
            <h1>Artists Management</h1>
            <Link to={"/admin/create/artist"} className="add-artist">
              Add Artist
            </Link>
          </section>
          {error && <FlashMessage type="error" message={error} />}
          {success && <FlashMessage type="success" message={success} />}
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
                    <th>AbOUT</th>
                    <th>Band</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {artistData.artists.map((show, index) => (
                    <tr key={index}>
                      <td>
                        <img
                          src={getArtistImageUrl(show._id)}
                          alt={show.name}
                          loading="lazy"
                        />
                      </td>
                      <td>{show.name}</td>
                      <td>{show.role}</td>
                      <td>
                        {show.description
                          ? show.description.substring(0, 101)
                          : "N/A"}
                      </td>
                      <td>{show.band ? show.band.name : "N/A"}</td>
                      <td>
                        <Link
                          to={`/admin/artist/${show._id}/edit`}
                          className="edit"
                        >
                          <i className="fa-solid fa-file-pen"></i>
                        </Link>
                      </td>
                      <td>
                        <button
                          type="submit"
                          className="delete"
                          onClick={() => deleteartist(show._id)}
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

export default Artistmanagement;
