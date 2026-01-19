import { Link, useParams } from "react-router-dom";
import { getConcertImageUrl } from "../utils/imageUtils";
import Header from "../Components/NavBar/Navbar";
import { useEffect, useState } from "react";
import axios from "axios";
import BASE_API from "../config/baseapi";
import { useSelector } from "react-redux";
import Loader from "../Components/Loading/loading";
import FlashMessage from "../Components/flash/flash";

const BookingSuccess = () => {
  const { id } = useParams();
  const { token } = useSelector((state) => state.user);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setmessage] = useState(null);
  const [errormessage, seterrormessage] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await axios.get(`${BASE_API}/success/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBooking(res.data.booking);
      } catch (error) {
        console.error("Failed to fetch booking:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchBooking();
    } else {
      setLoading(false);
    }
  }, [id, token]);

  const shareticket = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_API}/booking/share/${id}`);
      setmessage(res.data.message);
    } catch (error) {
      const msg =
        error?.res?.data?.message || error.message || "Error sharing ticket";
      seterrormessage(msg);
      console.log(msg);
    } finally {
      setLoading(false);
    }
  };

  const downloadticket = async () => {
    seterrormessage(null);
    setmessage(null);
    setLoading(true);

    try {
      const res = await axios.get(`${BASE_API}/booking/download/${id}`, {
        responseType: "blob", // ✅ Important to get PDF as binary
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // ✅ Create a link and trigger download
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ticket-${id}.pdf`; // file name
      document.body.appendChild(link);
      link.click(); // trigger download
      link.remove(); // clean up
      window.URL.revokeObjectURL(url); // free memory

      setmessage("Ticket downloaded successfully!");
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error.message ||
        "Error downloading ticket";
      seterrormessage(msg);
      console.error("Download error:", msg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!booking) return <p>Booking not found</p>;

  return (
    <>
      <Header />
      <div className="main-container">
        <div className="innercontainer">
          <section className="booking-top">
            <div className="step active done">
              <div className="circle">✔</div>
              <p>Choose concert</p>
            </div>
            <div className="line"></div>
            <div className="step active done">
              <div className="circle">✔</div>
              <p>Checkout</p>
            </div>
            <div className="line"></div>
            <div className="step active current">
              <div className="circle">3</div>
              <p>Get Ticket</p>
            </div>
          </section>
          {message && <FlashMessage type="success" message={message} />}
          {errormessage && <FlashMessage type="error" message={errormessage} />}
          <section className="success-details">
            <div className="ticket-div">
              <div className="concert-div">
                <div className="concert-left">
                  {booking.concert && (
                    <img
                      src={getConcertImageUrl(booking.concert._id)}
                      alt="Concert Banner"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="concert-right">
                  <h5>{booking.concert?.title}</h5>
                  <p>
                    {new Date(booking.concert?.date).toLocaleString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    <span> | </span>
                    {booking.concert?.time12hr}
                  </p>

                  <p>{booking.concert.venue}</p>
                </div>
              </div>
              <div className="qrcode-div">
                <div className="qrcode-left">
                  <h5>{booking.concert.band.name}</h5>
                  <p>
                    {booking.ticketQuantity}{" "}
                    {booking.ticketQuantity === 1 ? "Ticket" : "Tickets"}
                  </p>
                  <p>₹{booking.totalPrice}</p>
                  <p>
                    {new Date(booking.createdAt).toLocaleDateString("en-Us", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    <span>|</span>
                    {new Date(booking.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                  </p>
                </div>
                <div className="qrcode-right">
                  <img
                    src={booking.qrcode}
                    alt="Qr Code"
                    width={150}
                    height={150}
                  />
                </div>
              </div>
            </div>
            <div className="download-share">
              <p
                className="download"
                title="Download Ticket PDF"
                onClick={() => downloadticket()}
              >
                <i className="fa-solid fa-download"></i>
              </p>
              <p
                className="share"
                title="Email Ticket to Me"
                onClick={() => shareticket()}
              >
                <i className="fa-solid fa-envelope"></i>
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default BookingSuccess;
