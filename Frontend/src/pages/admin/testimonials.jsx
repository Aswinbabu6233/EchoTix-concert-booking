import React, { useEffect, useState } from "react";
import Header from "../../Components/NavBar/Navbar";
import FlashMessage from "../../Components/flash/flash";
import BASE_API from "../../config/baseapi";
import axios from "axios";
import defaultimage from "../../assets/default-profile.jpg";
import { useSelector } from "react-redux";
import Loader from "../../Components/Loading/loading";

const ApproveTestimonials = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setloading] = useState(true);
  const user = useSelector((state) => state.user);

  const [testimonials, settestimonials] = useState(null);

  useEffect(() => {
    const fetchtestimonial = async () => {
      try {
        const response = await axios.get(`${BASE_API}/admin/approve/reviews`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setloading(false);
        settestimonials(response.data);
      } catch (error) {
        setloading(false);
        setError("Failed to load dashboard data");
        console.error(error);
      }
    };
    fetchtestimonial();
  }, [user.token]);

  

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Header />
      <div className="main-container">
        <div className="innercontainer">
          <div className="recentmanagements">
            {error && <FlashMessage type="error" message={error} />}
            {success && <FlashMessage type="success" message={success} />}

            <div class="managementstable">
              <table>
                <thead>
                  <tr>
                    <th>user Img</th>
                    <th>Name</th>
                    <th>Review</th>
                    <th>Approve?</th>
                    <th>Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {testimonials.testimonials?.map((show, index) => (
                    <tr key={index}>
                      <td>
                        {show.user?.profileImage?.data &&
                        show.user?.profileImage?.contentType ? (
                          <img
                            src={`data:${show.user.profileImage.contentType};base64,${show.user.profileImage.data}`}
                            alt="User profile"
                            style={{
                              width: "50px",
                              height: "50px",
                              borderRadius: "50%",
                            }}
                          />
                        ) : (
                          <img
                            src={defaultimage}
                            alt="Default profile"
                            style={{
                              width: "50px",
                              height: "50px",
                              borderRadius: "50%",
                            }}
                          />
                        )}
                      </td>
                      <td>{show.user?.username || "Unknown user"}</td>
                      <td>
                        {show.content.length > 100
                          ? show.content.substring(0, 100) + "..."
                          : show.content}
                      </td>
                      <td>
                        <form method="POST">
                          <button type="submit" className="edit">
                            <i className="fa-solid fa-check"></i>
                          </button>
                        </form>
                      </td>
                      <td>
                        <form method="POST" style={{ display: "inline" }}>
                          <button type="submit" className="delete">
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </form>
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

export default ApproveTestimonials;
