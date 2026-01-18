import React, { useEffect, useState } from "react";
import Header from "../Components/NavBar/Navbar";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import BASE_API from "../config/baseapi";
import { useSelector } from "react-redux";
import Loader from "../Components/Loading/loading";
import FlashMessage from "../Components/flash/flash";

const BookingPage = () => {
  const user = useSelector((state) => state.user);
  const { id } = useParams();
  const navigate = useNavigate();

  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticketCount, setTicketCount] = useState(1);
  const [maxTicket, setMaxTicket] = useState(3);
  const [error, setError] = useState([]);

  useEffect(() => {
    const fetchConcert = async () => {
      try {
        const response = await axios.get(`${BASE_API}/concert/${id}/book`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        setConcert(response.data.concert);
        setMaxTicket(response.data.maxticketleft);
        setLoading(false);
      } catch (err) {
        setError([err.response?.data.message || "Something went wrong"]);
        setLoading(false);
      }
    };

    if (id && user?.token) {
      fetchConcert();
    }
  }, [id, user.token]);

  const increment = () => {
    if (ticketCount < maxTicket) {
      setTicketCount((prev) => prev + 1);
    }
  };

  const decrement = () => {
    if (ticketCount > 1) {
      setTicketCount((prev) => prev - 1);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBookingSubmission = async () => {
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      setError(["Razorpay SDK failed to load. Please try again."]);
      return;
    }

    try {
      const checkoutResponse = await axios.post(
        `${BASE_API}/booking/checkout`,
        {
          concertId: concert._id,
          ticketQuantity: ticketCount,
          totalPrice: ticketCount * concert.ticketPrice,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const { order, razorpayKey } = checkoutResponse.data;

      if (!razorpayKey) {
        throw new Error("Razorpay Key not found");
      }

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: concert.title,
        description: "Concert Booking",
        order_id: order.id,
        handler: async function (response) {
          try {
            const confirmResponse = await axios.post(
              `${BASE_API}/booking/confirm`,
              {
                concertId: concert._id,
                ticketQuantity: ticketCount,
                totalPrice: ticketCount * concert.ticketPrice,
                razorpayPaymentId: response.razorpay_payment_id,
              },
              {
                headers: {
                  Authorization: `Bearer ${user.token}`,
                },
              }
            );

            if (confirmResponse.status === 200) {
              navigate(`/booking/success/${confirmResponse.data.bookingId}`);
            }
          } catch (err) {
            console.error("Payment confirmation failed", err);
            setError(["Payment completed but confirmation failed."]);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#F37254",
        },
      };

      if (!window.Razorpay) {
        setError(["Razorpay SDK not loaded. Please refresh."]);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        setError([response.error.description || "Payment failed"]);
      });
      rzp.open();
    } catch (err) {
      console.error("Payment initiation failed:", err);
      setError(["Payment initiation failed. Please try again."]);
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <Header />
      <div className="main-container">
        <div className="innercontainer">
          {error.length == 0 ? null : (
            <FlashMessage type="error" message={error} />
          )}
          <section className="booking-top">
            <div className="step active done">
              <div className="circle">✔</div>
              <p>Choose concert</p>
            </div>
            <div className="line"></div>
            <div className="step active current">
              <div className="circle">2</div>
              <p>Checkout</p>
            </div>
            <div className="line"></div>
            <div className="step">
              <div className="circle">3</div>
              <p>Get Ticket</p>
            </div>
          </section>

          <section className="booking-details">
            <div className="concertleft">
              {concert?.concertImage && (
                <div className="concertimage">
                  <img
                    src={`data:${concert.concertImage.contentType};base64,${concert.concertImage.data}`}
                    alt="Concert Banner"
                  />
                </div>
              )}
              <h4>Get Ready for an Unforgettable Night</h4>
            </div>

            {concert && (
              <div className="concertright">
                <p>Concert: {concert.title}</p>
                <p>
                  Date:{" "}
                  {new Date(concert.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p>Time: {concert.time12hr}</p>
                <p>Venue: {concert.venue}</p>
                <p>Price: ₹{concert.ticketPrice}</p>

                {error.length > 0 ? (
                  <div className="error-message">
                    {error.map((e, i) => (
                      <p key={i}>{e}</p>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="ticket-counter">
                      <label>Tickets:</label>
                      <div className="counter-controls">
                        <button type="button" onClick={decrement}>
                          -
                        </button>
                        <span>{ticketCount}</span>
                        <button type="button" onClick={increment}>
                          +
                        </button>
                      </div>
                      <p>Max tickets allowed: {maxTicket}</p>
                    </div>

                    <div className="total-price">
                      <p>Total Price: ₹{ticketCount * concert.ticketPrice}</p>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleBookingSubmission();
                      }}
                    >
                      <input
                        type="submit"
                        className="book-button"
                        value="Checkout"
                      />
                    </form>
                  </>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default BookingPage;
