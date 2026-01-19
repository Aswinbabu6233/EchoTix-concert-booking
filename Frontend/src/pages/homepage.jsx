import { useState } from "react";
import Header from "../Components/NavBar/Navbar";
import axios from "axios";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import defaultimg from "../assets/default-profile.jpg";
import Loader from "../Components/Loading/loading";
import ConcertCard from "../Components/concertcard/concertcard";
import BASE_API from "../config/baseapi";
import { getArtistImageUrl, getUserImageUrl } from "../utils/imageUtils";
const Homepage = () => {
  const [concerts, setConcerts] = useState([]);
  const [artists, setArtists] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [totalConcerts, setTotalConcerts] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (window.Swiper && testimonials.length > 2) {
      new Swiper(".swiper", {
        loop: true,
        spaceBetween: 20,
        autoplay: {
          delay: 3000,
          disableOnInteraction: false,
        },
        breakpoints: {
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        },
      });
    }
  }, [testimonials.length]);

  useEffect(() => {
    axios
      .get(BASE_API)
      .then((response) => {
        if (response.data.success) {
          setConcerts(response.data.data.concerts);
          setArtists(response.data.data.artists);
          setTotalConcerts(response.data.data.totalConcerts);
          setTestimonials(response.data.data.testimonials);
          setLoading(false);
        } else {
          setError("Failed to load data. Please try again later.");
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching homepage data:", error);
        setError("An error occurred while fetching data.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Header />

      <div className="main-container">
        <div className="innercontainer">
          <section className="top-section">
            <h1>Feel the Sound. Book the Experience. </h1>
            <h3>
              Discover concerts, explore bands, and reserve your vibe — all in
              one place.
            </h3>
          </section>
          <section className="concert-section">
            {totalConcerts > 0 ? (
              <>
                {concerts.map((concert) => (
                  <ConcertCard key={concert._id} concert={concert} />
                ))}

                {typeof totalConcerts !== "undefined" && totalConcerts > 2 && (
                  <div className="concert-card view-more-card">
                    <a href="/concert/list">
                      <div className="view-more-content">
                        <h2>View More Concerts</h2>
                        <p>See all available concerts</p>
                      </div>
                    </a>
                  </div>
                )}
              </>
            ) : (
              <p>No concerts available at the moment.</p>
            )}
          </section>

          <section className="artist-section">
            <div className="artist-left">
              <h2>Meet the Faces Behind the Music</h2>
              <p>
                At EchoTix, we bring you closer to the talent that lights up the
                stage. Discover the artists and bands who turn every concert
                into an unforgettable experience. Explore their stories, follow
                their journeys, and be part of the rhythm that connects us all.
              </p>{" "}
              <Link to="/artist/list" className="viewmorebtn">
                View All Artists
                <span className="arrow-circle">
                  <i className="fa-solid fa-arrow-right"></i>
                </span>
              </Link>
            </div>
            <div className="artist-right">
              <div className="artist-group">
                {artists.map((artist, index) => (
                  <div
                    className={`artistpic ${index === 0 ? "large" : ""} ${
                      index === 2 ? "wide" : ""
                    } ${index === 3 ? "tall" : ""}`}
                    key={artist._id}
                  >
                    <Link to={`/artist/${artist._id}`}>
                      <img
                        src={getArtistImageUrl(artist._id)}
                        alt="artist"
                        loading="lazy"
                      />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="user-reviews">
            <div className="top-section">
              <h3>Why People Can’t Stop Talking About EchoTix…</h3>
            </div>
            <div className="review-slider swiper">
              <div className="swiper-wrapper">
                {testimonials && testimonials.length > 0 ? (
                  testimonials.map((testimonial) => (
                    <div
                      className="slider-card swiper-slide"
                      key={testimonial._id}
                    >
                      <h4>
                        <i className="fa-solid fa-quote-left"></i>
                        {testimonial.content.length > 100
                          ? testimonial.content.substring(0, 100) + "..."
                          : testimonial.content}
                      </h4>
                      <div className="user">
                        <img
                          src={getUserImageUrl(testimonial.user._id) || defaultimg}
                          alt="User"
                          loading="lazy"
                          onError={(e) => { e.target.src = defaultimg; }}
                        />
                        <p>
                          {testimonial.user.name}
                          <span>
                            ~~ Echotix User{" "}
                            <i className="fa-regular fa-face-smile"></i>
                          </span>
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div>
                    <p>No testimonials available.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Homepage;
