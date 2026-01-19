// src/Components/ConcertCard/ConcertCard.jsx
import React from "react";
import { Link } from "react-router-dom";

const ConcertCard = ({ concert }) => {
  return (
    <div className="concert-card" key={concert._id}>
      <Link to={`/concert/${concert._id}`}>
        <img
          src={`data:${concert.concertImage.contentType};base64,${concert.concertImage.data}`}
          alt={concert.title}
          className="concert-image"
        />
      </Link>
      <div className="concert-details">
        <Link to={`/concert/${concert._id}`}>
          <h2>{concert.title}</h2>
        </Link>
        <Link to={`/concert/band/${concert.band?._id}`}>
          <h6>{concert.band?.name || "Unknown Band"}</h6>
        </Link>
        <p>
          Venue: <span>{concert.venue}</span>
        </p>
        <p>
          Date:{" "}
          <span>
            {new Date(concert.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </p>
        <p>
          Time: <span>{concert.time12hr}</span>
        </p>
        <Link to={`/concert/${concert._id}`} className="book-btn">
          Book Now
        </Link>
      </div>
    </div>
  );
};

export default ConcertCard;
