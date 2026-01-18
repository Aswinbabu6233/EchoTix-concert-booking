import React, { useEffect, useState } from "react";
import Header from "../../Components/NavBar/Navbar";
import Loader from "../../Components/Loading/loading";
import axios from "axios";
import BASE_API from "../../config/baseapi";
import { useSelector } from "react-redux";
import FlashMessage from "../../Components/flash/flash";

const Bookingmanagement = () => {
  const user = useSelector((state) => state.user);
  const [success, setsuccessmsg] = useState(null);
  const [error, seterror] = useState(null);
  const [loading, setloading] = useState(true);
  const [bookingdata, setbookingdata] = useState(null);
  const fetchbooking = async () => {
    try {
      const response = await axios.get(`${BASE_API}/admin/bookings`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setbookingdata(response.data);
    } catch (error) {
      seterror("Failed to load Booking Details from Database");
      console.error(error);
    } finally {
      setloading(false);
    }
  };

  useEffect(() => {
    fetchbooking();
  }, [user.token]);

  const cancelbooking = async (bookingid) => {
    setloading(true);
    seterror("");
    setsuccessmsg("");
    try {
      const response = await axios.post(
        `${BASE_API}/admin/cancel-booking/${bookingid}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setsuccessmsg(response.data.message);

      // ✅ Refresh booking list
      await fetchbooking();
    } catch (error) {
      seterror(error.response?.data?.msg || "Failed to cancel booking");
      setloading(false);
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
            <div>
              <h1>Booking Details</h1>
              <p>Total Bookings: {bookingdata.bookings?.length}</p>
              <p>Total Completed: {bookingdata.totalcompletedcount}</p>
            </div>
            <h4>
              Total Revenue: ₹ <span>{bookingdata.totalRevenue}</span>
            </h4>
          </section>
          {success && <FlashMessage type="success" message={success} />}
          {error && <FlashMessage type="error" message={error} />}

          <section className="recentmanagements">
            <div className="managementstable">
              <table>
                <thead>
                  <tr>
                    <th>user</th>
                    <th>concert</th>
                    <th>ticket quantity</th>
                    <th>total price</th>
                    <th>status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingdata.bookings.map((booking, index) => (
                    <tr key={index}>
                      <td>{booking?.user?.username}</td>
                      <td>{booking.concert.title}</td>
                      <td>{booking.ticketQuantity}</td>
                      <td>{booking.totalPrice}</td>
                      <td>
                        {booking.status === "completed" ? (
                          <form
                            className="cancel-booking-form"
                            id={"cancel-form-" + booking._id}
                            method="POST"
                            onSubmit={() => cancelbooking(booking._id)}
                          >
                            <select
                              name="newStatus"
                              data-booking-id={booking._id}
                              defaultValue=""
                              onChange={(e) => {
                                if (e.target.value === "cancelled by admin") {
                                  cancelbooking(booking._id);
                                }
                              }}
                            >
                              <option value="" disabled>
                                change status
                              </option>
                              <option value="cancelled by admin">
                                Cancel Booking
                              </option>
                            </select>
                          </form>
                        ) : (
                          <span style={{ color: "red" }}>
                            {booking.status.replace(/_/g, " ")}
                          </span>
                        )}
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

export default Bookingmanagement;
