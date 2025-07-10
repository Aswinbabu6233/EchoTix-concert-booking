import { useSelector } from "react-redux";
import Header from "../../Components/NavBar/Navbar";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import BASE_API from "../../config/baseapi";
import Loader from "../../Components/Loading/loading";
import defaultimage from "../../assets/default-profile.jpg";
import FlashMessage from "../../Components/flash/flash";

const Usermanagement = () => {
  const user = useSelector((state) => state.user);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setloading] = useState(true);
  const [artistData, setArtistData] = useState(null);

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const response = await axios.get(`${BASE_API}/admin/users`, {
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
    fetchArtist();
  }, [user.token]);

  if (loading) {
    return <Loader />;
  }
  return (
    <>
      <Header />
      <div className="main-container">
        <div className="innercontainer">
          <section class="Manage-top">
            <h1>User Management</h1>
            <Link to={"/admin/approve/reviews"}>Approve Review</Link>
          </section>
          {error && <FlashMessage type="error" message={error} />}
          {success && <FlashMessage type="success" message={success} />}
          <section className="recentmanagements">
            <div className="managementstable">
              <table>
                <thead>
                  <tr>
                    <th>Profile Pic</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {artistData.users &&
                    artistData.users.map((show, index) => (
                      <tr key={index}>
                        <td>
                          {show.profileImage &&
                          show.profileImage.data &&
                          show.profileImage.contentType ? (
                            <img
                              src={
                                show?.profileImage?.data &&
                                `data:${show.profileImage.contentType};base64,${show.profileImage.data}`
                              }
                              alt="User profile"
                            />
                          ) : (
                            <img src={defaultimage} alt="" />
                          )}
                        </td>
                        <td>{show.username}</td>
                        <td>{show.email}</td>
                        <td>
                          <button className="edit">
                            <i className="fa-solid fa-file-pen"></i>
                          </button>
                        </td>
                        <td>
                          <button
                            type="submit"
                            className="delete"
                            onClick="return confirm('Are you sure you want to delete this review?')"
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

export default Usermanagement;
