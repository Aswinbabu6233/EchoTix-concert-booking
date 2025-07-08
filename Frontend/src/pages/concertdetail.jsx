import React, { useEffect, useState } from "react";
import Header from "../Components/NavBar/Navbar";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import BASE_API from "../config/baseapi";
import { useSelector } from "react-redux";
import Loader from "../Components/Loading/loading";
import defaultImg from "../assets/default-profile.jpg";

const ConcertDetail = () => {
  const user = useSelector((state) => state.user);

  const userpresent = user?.userId && user?.token && user?.role == "user";
  const { id } = useParams();

  const [concertdata, setConcert] = useState(null);
  const [Artistdata, setArtist] = useState([]);
  const [loading, setloading] = useState(true);
  const [reviews, setreview] = useState([]);
  const [ratingData, setRating] = useState([]);
  const [total, settotal] = useState(0);
  const [average, setaverage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [rating, setRatingInput] = useState("");
  const [comment, setCommentInput] = useState("");

  const fetchConcert = async () => {
    try {
      const response = await axios.get(BASE_API + "/concert/" + id);
      const { concert, artists, reviews, ratingData, total, average } =
        response.data;

      setConcert(concert);
      setArtist(artists);
      setRating(ratingData);
      setaverage(average);
      setreview(reviews);
      settotal(total);
      setloading(false);
    } catch (err) {
      console.error("Error loading concert:", err);
    }
  };

  useEffect(() => {
    fetchConcert();
  }, [id]);

  const toggleComment = (index) => {
    const el = document.getElementById(`comment-${index}`);
    el.classList.toggle("short-comment");
  };

  const reviewpost = async (e) => {
    e.preventDefault(); // Prevent page reload on form submit
    try {
      const token = user.token;

      const response = await axios.post(
        `${BASE_API}/concerts/review/${id}`,
        {
          rating: rating,
          comment: comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Review submitted:", response.data);

      // Refresh concert + reviews after submission
      setloading(true);
      await fetchConcert();

      // Close modal and reset form
      setShowModal(false);
      setRatingInput("");
      setCommentInput("");
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  if (loading) return <Loader />;

  return (
    <>
      <Header />
      <div className="main-container">
        <div className="innercontainer">
          <section className="herosection">
            <h1>{concertdata.title}</h1>
            <img
              className="concert-banner"
              src={
                concertdata?.concertImage?.data &&
                `data:${concertdata.concertImage.contentType};base64,${concertdata.concertImage.data}`
              }
              alt={concertdata.title}
            />
            <p className="subtitle">
              Experience the thrill of live music with
              <span>
                <Link to={"/concert/band/" + concertdata.band._id}>
                  {" "}
                  {concertdata.band.name}
                </Link>
              </span>
            </p>
          </section>

          <section className="concert-overview">
            <div className="overview">
              <h3>About The Event</h3>
              <p className="main">{concertdata.description}</p>
              <span className="section-seperator">
                Now, let’s dive deeper into the journey and soul of the band
                performing tonight.
              </span>
              <p className="main">{concertdata.band.discription}</p>
              <h3>Artists</h3>
              {Artistdata.length > 0 ? (
                Artistdata.map((artist) => (
                  <div className="artistlist" key={artist._id}>
                    <div className="artist">
                      <Link to={`/artist/${artist._id}`}>
                        <img
                          src={
                            artist?.photo?.data &&
                            `data:${artist.photo.contentType};base64,${artist.photo.data}`
                          }
                          alt={artist.name}
                        />
                        <h4>{artist.name}</h4>
                        <p>{artist.role}</p>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p>No Artist added yet.</p>
              )}
              <h3>Find Us Here</h3>
              {concertdata.locationMapUrl ? (
                <iframe
                  src={concertdata.locationMapUrl}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              ) : (
                <p>Location map will be updated soon.</p>
              )}

              <div className="why-section">
                <h3>Why You Shouldn’t Miss It</h3>
                <ul className="why-list">
                  <li>
                    <i className="fa-solid fa-bolt"></i> Electric live
                    atmosphere
                  </li>
                  <li>
                    <i className="fa-solid fa-music"></i> Best of rock, indie &
                    pop
                  </li>
                  <li>
                    <i className="fa-solid fa-camera-retro"></i>{" "}
                    Instagram-worthy visuals
                  </li>
                  <li>
                    <i className="fa-solid fa-burger"></i> Food & drinks
                    available
                  </li>
                  <li>
                    <i className="fa-solid fa-gift"></i> Surprise giveaways and
                    merch
                  </li>
                </ul>
              </div>
            </div>

            <div className="rightfixed">
              <h3>Event Details</h3>
              <p>
                <i className="fa-regular fa-calendar"></i>{" "}
                {new Date(concertdata.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p>
                <i className="fa-regular fa-clock"></i> {concertdata.time12hr}
              </p>
              <p>
                <i className="fa-regular fa-hourglass-half"></i>{" "}
                {concertdata.durationFormatted}
              </p>
              <p>
                <i className="fa-solid fa-people-group"></i> Age Limit - 16yrs +
              </p>
              {concertdata.bookingEndsAt && (
                <p>
                  <i className="fa-regular fa-calendar-xmark"></i>{" "}
                  {new Date(concertdata.bookingEndsAt).toLocaleString()}
                </p>
              )}
              <p>
                <i className="fa-solid fa-location-crosshairs"></i>{" "}
                {concertdata.venue}
              </p>

              <hr />
              <div className="booksection">
                <div className="price">
                  <p>₹ {concertdata.ticketPrice}</p>
                  <p
                    className={
                      concertdata.status === "canceled" ||
                      concertdata.status === "past" ||
                      concertdata.ticketsAvailable === 0
                        ? "soldout"
                        : "available"
                    }
                  >
                    {concertdata.status === "canceled"
                      ? "Cancelled"
                      : concertdata.status === "past"
                      ? "This concert has ended"
                      : concertdata.ticketsAvailable > 0
                      ? "Available"
                      : "Sold Out"}
                  </p>
                </div>

                {concertdata.status === "upcoming" &&
                concertdata.ticketsAvailable > 0 ? (
                  <Link
                    to={`/concert/${concertdata._id}/book`}
                    className="bookbtn"
                  >
                    <div>Book Now</div>
                  </Link>
                ) : (
                  <button className="bookbtn disabled" disabled>
                    {concertdata.status === "canceled"
                      ? "Cancelled"
                      : concertdata.status === "past"
                      ? "Event Ended"
                      : "Not Available"}
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="user-reviews">
            <h3>User Reviews</h3>
            {total === 0 ? (
              <p>No reviews yet. Be the first to review!</p>
            ) : (
              <>
                <div className="rating">
                  <div className="rating__average">
                    <h1>{average}</h1>
                    <div className="star-outer">
                      <div
                        className="star-inner"
                        style={{
                          width: `${((average / 5) * 100).toFixed(2)}%`,
                        }}
                      ></div>
                    </div>
                    <p>{total.toLocaleString()}</p>
                  </div>
                  <div className="rating__progress">
                    {ratingData.map((r) => (
                      <div className="rating__progress-value" key={r.star}>
                        <p>
                          {r.star} <span className="star">★</span>
                        </p>
                        <div className="progress">
                          <div
                            className="bar"
                            style={{
                              width:
                                total === 0
                                  ? "0%"
                                  : `${((r.count / total) * 100).toFixed(2)}%`,
                            }}
                          ></div>
                        </div>
                        <p>{r.count}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="review-comments-section">
                  {reviews.map((review, index) => (
                    <div className="review-comment-card" key={review._id}>
                      <div className="review-user-time">
                        <div className="review-user">
                          <img
                            className="profile-pic"
                            src={
                              review?.user.profileImage?.data
                                ? `data:${review.user.profileImage.contentType};base64,${review.user.profileImage.data}`
                                : defaultImg
                            }
                            alt="profile"
                          />
                          <strong>{review.user.username}</strong>
                        </div>
                        <div className="review-date">
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-IN"
                          )}
                        </div>
                      </div>
                      <div className="review-comment-text">
                        <p id={`comment-${index}`} className="short-comment">
                          {review.comment}
                        </p>
                        {review.comment.length > 150 && (
                          <button
                            className="see-more-btn"
                            onClick={() => toggleComment(index)}
                          >
                            See more
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Review Modal Button & Form */}
          {userpresent ? (
            <>
              <button
                className="review-edit"
                onClick={() => setShowModal(true)}
              >
                <i className="fa-solid fa-feather-pointed"></i>
              </button>
              {showModal && (
                <div className="modal" onClick={() => setShowModal(false)}>
                  <div
                    className="modal-content"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="close" onClick={() => setShowModal(false)}>
                      &times;
                    </span>
                    <form onSubmit={reviewpost} className="review-form">
                      <label htmlFor="rating">Your rating:</label>
                      <select
                        name="rating"
                        id="rating"
                        value={rating}
                        onChange={(e) => setRatingInput(e.target.value)}
                        required
                      >
                        <option value="">--Select--</option>
                        {[5, 4, 3, 2, 1].map((i) => (
                          <option value={i} key={i}>
                            {i} ★
                          </option>
                        ))}
                      </select>

                      <label htmlFor="comment">Your Review (Optional):</label>
                      <textarea
                        name="comment"
                        id="comment"
                        rows="4"
                        placeholder="Write something..."
                        value={comment}
                        onChange={(e) => setCommentInput(e.target.value)}
                      ></textarea>

                      <button type="submit">Submit Review</button>
                    </form>
                  </div>
                </div>
              )}
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
};

export default ConcertDetail;
