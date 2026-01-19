import axios from "axios";
import React from "react";
import BASE_API from "../../config/baseapi";
import { useSelector } from "react-redux";
import { getConcertImageUrl } from "../../utils/imageUtils";

const TicketCard = ({ ticket }) => {
  const { token } = useSelector((state) => state.user);
  const concert = ticket.concert;
  const concertDate = new Date(concert.date);
  const bookingDate = new Date(ticket.createdAt);

  const downloadpdf = async (bookingid) => {
    try {
      const response = await axios.get(
        `${BASE_API}/user/download/${bookingid}/pdf`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // "Bearer" must be capitalized
          },
          responseType: "blob", // This is essential for downloading binary files like PDFs
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ticket-${bookingid}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error.message ||
        "Error downloading ticket";
      alert(msg);
      console.error("Download error:", msg);
    }
  };

  return (
    <section className="-details">
      <div className="ticket-div">
        {/* Concert Info */}
        <div className="concert-div">
          <div className="concert-left">
            <img
              src={getConcertImageUrl(concert._id)}
              alt="Concert Banner"
              loading="lazy"
            />
          </div>
          <div className="concert-right">
            <h5>{concert.title}</h5>
            <p>
              {concertDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              <span> | </span>
              {concert.time}
            </p>
            <p>{concert.venue}</p>
          </div>
        </div>

        {/* QR and Booking Info */}
        <div className="qrcode-div">
          <div className="qrcode-left">
            <h5>{concert.band.name}</h5>
            <p>
              {ticket.ticketQuantity}{" "}
              {ticket.ticketQuantity === 1 ? "Ticket" : "Tickets"}
            </p>
            <p>₹{ticket.totalPrice}</p>
            <p>
              {bookingDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              <span> | </span>
              {bookingDate.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

            {ticket.status !== "completed" && (
              <p className="text-danger">
                Cancelled ({ticket.status.replace("_", " ")})<br />
                {ticket.cancelReason && <small>{ticket.cancelReason}</small>}
              </p>
            )}
          </div>

          <div className="qrcode-right">
            <img src={ticket.qrcode} alt="QR Code" width="150" height="150" />
          </div>
        </div>

        {/* Download + Cancel */}
        {ticket.status === "completed" && (
          <div className="ticket-download-cancel">
            <div className="download-btn">
              <p
                onClick={() => downloadpdf(ticket._id)}
                className="download"
                title="Download Ticket PDF"
              >
                <i className="fa-solid fa-download"></i>
              </p>
            </div>
            <div className="cancel">
              {ticket.canCancel ? (
                <form
                  id={`cancel-form-${ticket._id}`}
                  action={`/user/cancel/${ticket._id}`}
                  method="POST"
                >
                  <button
                    type="submit"
                    className="cancel-btn"
                    data-booking-id={ticket._id}
                  >
                    Cancel Ticket
                  </button>
                </form>
              ) : (
                <p className="text-gray-500">Cancellation not available</p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default TicketCard;
