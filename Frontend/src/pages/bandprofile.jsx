import React, { useEffect, useState } from "react";
import Header from "../Components/NavBar/Navbar";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import BASE_API from "../config/baseapi";
import Loader from "../Components/Loading/loading";
import "../styles/bandprofile.css";

const BandProfile = () => {
    const { id } = useParams();
    const [band, setBand] = useState(null);
    const [artists, setArtists] = useState([]);
    const [concerts, setConcerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBand = async () => {
            try {
                const response = await axios.get(`${BASE_API}/concert/band/${id}`);
                const { band, artists, concerts } = response.data;
                setBand(band);
                setArtists(artists || []);
                setConcerts(concerts || []);
                setLoading(false);
            } catch (err) {
                console.error("Error loading band:", err);
                setError("Failed to load band profile");
                setLoading(false);
            }
        };

        fetchBand();
    }, [id]);

    if (loading) return <Loader />;

    if (error) {
        return (
            <>
                <Header />
                <div className="main-container">
                    <div className="error-container">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                        <h2>{error}</h2>
                        <Link to="/concert/list" className="back-btn">
                            Back to Concerts
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="main-container">
                <div className="innercontainer">
                    {/* Band Hero Section */}
                    <section className="band-hero-section">
                        <div className="band-hero-background">
                            <img
                                src={
                                    band?.image?.data &&
                                    `data:${band.image.contentType};base64,${band.image.data}`
                                }
                                alt={band.name}
                                className="band-hero-bg-image"
                            />
                            <div className="band-hero-overlay"></div>
                        </div>
                        <div className="band-hero-content">
                            <div className="band-hero-info">
                                <span className="band-label">
                                    <i className="fa-solid fa-star"></i> Featured Band
                                </span>
                                <h1 className="band-hero-name">{band.name}</h1>
                                <p className="band-hero-description">{band.discription}</p>
                                <div className="band-stats">
                                    <div className="stat-item">
                                        <span className="stat-number">{artists.length}</span>
                                        <span className="stat-label">Members</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-number">{concerts.length}</span>
                                        <span className="stat-label">Concerts</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Artists Section */}
                    <section className="band-artists-section">
                        <div className="section-header">
                            <h2>
                                <i className="fa-solid fa-users"></i>
                                Band Members
                            </h2>
                            <p className="section-subtitle">
                                Meet the talented artists behind the music
                            </p>
                        </div>
                        {artists.length > 0 ? (
                            <div className="artists-showcase">
                                {artists.map((artist, index) => (
                                    <Link
                                        to={`/artist/${artist._id}`}
                                        key={artist._id}
                                        className="artist-showcase-card"
                                        style={{ animationDelay: `${index * 0.1}s` }}
                                    >
                                        <div className="artist-card-image">
                                            <img
                                                src={
                                                    artist?.photo?.data &&
                                                    `data:${artist.photo.contentType};base64,${artist.photo.data}`
                                                }
                                                alt={artist.name}
                                            />
                                            <div className="artist-card-overlay">
                                                <span className="view-profile">
                                                    <i className="fa-solid fa-eye"></i>
                                                    View Profile
                                                </span>
                                            </div>
                                        </div>
                                        <div className="artist-card-content">
                                            <h3>{artist.name}</h3>
                                            <span className="artist-role">{artist.role}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="no-artists">
                                <i className="fa-solid fa-user-slash"></i>
                                <p>No artists added yet.</p>
                            </div>
                        )}
                    </section>

                    {/* Concerts Section */}
                    <section className="band-concerts-section">
                        <div className="section-header">
                            <h2>
                                <i className="fa-solid fa-ticket"></i>
                                Upcoming & Past Concerts
                            </h2>
                            <p className="section-subtitle">
                                Check out where you can see them perform
                            </p>
                        </div>
                        {concerts.length > 0 ? (
                            <div className="concerts-grid">
                                {concerts.map((concert) => (
                                    <div
                                        className={`concert-card-premium ${concert.status === "past" ? "past" : ""
                                            }`}
                                        key={concert._id}
                                    >
                                        <div className="concert-card-image">
                                            <img
                                                src={
                                                    concert?.concertImage?.data &&
                                                    `data:${concert.concertImage.contentType};base64,${concert.concertImage.data}`
                                                }
                                                alt={concert.title}
                                            />
                                            <span className={`status-badge ${concert.status}`}>
                                                {concert.status === "upcoming" ? "Upcoming" : "Past"}
                                            </span>
                                        </div>
                                        <div className="concert-card-content">
                                            <h3>{concert.title}</h3>
                                            <div className="concert-card-meta">
                                                <p>
                                                    <i className="fa-solid fa-location-dot"></i>
                                                    {concert.venue}
                                                </p>
                                                <p>
                                                    <i className="fa-regular fa-calendar"></i>
                                                    {new Date(concert.date).toLocaleDateString("en-US", {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </p>
                                                {concert.time12hr && (
                                                    <p>
                                                        <i className="fa-regular fa-clock"></i>
                                                        {concert.time12hr}
                                                    </p>
                                                )}
                                            </div>
                                            <p className="concert-card-description">
                                                {concert.description?.substring(0, 100)}
                                                {concert.description?.length > 100 ? "..." : ""}
                                            </p>
                                            <Link
                                                to={`/concert/${concert._id}`}
                                                className="concert-card-btn"
                                            >
                                                {concert.status === "upcoming"
                                                    ? "Get Tickets"
                                                    : "View Details"}
                                                <i className="fa-solid fa-arrow-right"></i>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-concerts">
                                <i className="fa-solid fa-calendar-xmark"></i>
                                <p>No concerts available at the moment.</p>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
};

export default BandProfile;
