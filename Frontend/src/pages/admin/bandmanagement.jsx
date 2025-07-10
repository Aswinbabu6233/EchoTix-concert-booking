import { Link } from "react-router-dom";
import Header from "../../Components/NavBar/Navbar";
import { useEffect, useState } from "react";
import FlashMessage from "../../Components/flash/flash";
import axios from "axios";
import BASE_API from "../../config/baseapi";
import { useSelector } from "react-redux";
import Loader from "../../Components/Loading/loading";

const Bandmanagement = () => {
  const user = useSelector((state) => state.user);
  const [success, setsuccessmsg] = useState(null);
  const [error, seterror] = useState(null);
  const [loading, setloading] = useState(true);
  const [banddata, setbanddata] = useState("");

  useEffect(() => {
    const fetchband = async () => {
      try {
        const response = await axios.get(`${BASE_API}/admin/bands`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setloading(false);
        setbanddata(response.data);
        setsuccessmsg("Data Loaded succes fully");
      } catch (error) {
        setloading(false);
        seterror("Failed to load Band Detail from DataBase");
        console.error(error);
      }
    };
    fetchband();
  }, [user.token]);

  if (loading) {
    return <Loader />;
  }
  return (
    <>
      <Header />
      <div className="main-container">
        <div className="innercontainer">
          <div className="Manage-top">
            <h1>Band Management</h1>
            <Link to={"/admin/create/band"}>Add Band</Link>
          </div>
          {success && <FlashMessage type="success" message={success} />}
          {error && <FlashMessage type="error" message={error} />}
          <div className="recentmanagements">
            <div className="recent-top">
              <h3>Recent Bands</h3>
              <span>View All</span>
            </div>
            <div className="managementstable">
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Edit</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {banddata.bands.map((show, index) => (
                    <tr key={index}>
                      <td>
                        <img
                          src={
                            show?.image?.data &&
                            `data:${show.image.contentType};base64,${show.image.data}`
                          }
                        />
                      </td>
                      <td>{show.name}</td>
                      <td>{show.discription.substring(0, 101)}...</td>
                      <td>
                        <Link
                          to={"/admin/edit/band/" + show._id}
                          className="edit"
                        >
                          <i class="fa-solid fa-file-pen"></i>
                        </Link>
                      </td>
                      <td>
                        <button
                          type="submit"
                          class="delete"
                          onclick="return confirm('Are you sure you want to delete this review?')"
                        >
                          <i class="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Bandmanagement;
