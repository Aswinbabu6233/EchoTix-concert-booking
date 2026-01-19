import React, { useEffect, useState } from "react";
import Header from "../Components/NavBar/Navbar";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import BASE_API from "../config/baseapi";
import Loader from "../Components/Loading/loading";
import "../styles/artistprofile.css";
import { getArtistImageUrl, getBandImageUrl, getConcertImageUrl } from "../utils/imageUtils";

const ArtistProfile = () => {
    const { id } = useParams();
    const [artist, setArtist] = useState(null);
    const [otherMembers, setOtherMembers] = useState([]);
    const [concerts, setConcerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArtist = async () => {
            try {
                const response = await axios.get(`${BASE_API}/artist/${id}`);
                const { artist, otherMembers, concerts } = response.data;
                setArtist(artist);
                setOtherMembers(otherMembers || []);
                setConcerts(concerts || []);
                setLoading(false);
            } catch (err) {
                console.error("Error loading artist:", err);
                setError("Failed to load artist profile");
                setLoading(false);
            }
        };

        fetchArtist();
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
                        <Link to="/artists/list" className="back-btn">
                            Back to Artists
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
                    {/* Hero Section */}
                    <section className="artist-hero-section">
                        <div className="artist-hero-content">
                            <div className="artist-hero-text">
                                <span className="artist-role-badge">{artist.role}</span>
                                <h1 className="artist-hero-name">{artist.name}</h1>
                                <p className="artist-hero-description">{artist.description}</p>
                                <Link
                                    to={`/concert/band/${artist.band._id}`}
                                    className="artist-band-link"
                                >
                                    <i className="fa-solid fa-users"></i>
                                    Member of {artist.band.name}
                                </Link>
                            </div>
                            <div className="artist-hero-image-container">
                                <div className="artist-hero-image-glow"></div>
                                <img
                                    src={getArtistImageUrl(artist._id)}
                                    alt={artist.name}
                                    className="artist-hero-image"
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Band Section */}
                    <section className="artist-band-section">
                        <div className="section-header">
                            <h2>
                                <i className="fa-solid fa-guitar"></i>
                                The Band
                            </h2>
                        </div>
                        <div className="band-showcase">
                            <div className="band-info-card">
                                <div className="band-image-wrapper">
                                    <img
                                        src={getBandImageUrl(artist.band._id)}
                                        alt={artist.band.name}
                                        className="band-showcase-image"
                                        loading="lazy"
                                    />
                                    <div className="band-image-overlay">
                                        <Link
                                            to={`/concert/band/${artist.band._id}`}
                                            className="view-band-btn"
                                        >
                                            View Band Profile
                                        </Link>
                                    </div>
                                </div>
                                <div className="band-details">
                                    <h3>{artist.band.name}</h3>
                                    <p>{artist.band.discription}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Other Members Section */}
                    {otherMembers.length > 0 && (
                        <section className="other-members-section">
                            <div className="section-header">
                                <h2>
                                    <i className="fa-solid fa-people-group"></i>
                                    Other Band Members
                                </h2>
                            </div>
                            <div className="members-grid">
                                {otherMembers.map((member) => (
                                    <Link
                                        to={`/artist/${member._id}`}
                                        key={member._id}
                                        className="member-card"
                                    >
                                        <div className="member-image-container">
                                            <img
                                                src={getArtistImageUrl(member._id)}
                                                alt={member.name}
                                                className="member-image"
                                                loading="lazy"
                                            />
                                            <div className="member-overlay">
                                                <span>View Profile</span>
                                            </div>
                                        </div>
                                        <div className="member-info">
                                            <h4>{member.name}</h4>
                                            <p>{member.role}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Concerts Section */}
                    <section className="artist-concerts-section">
                        <div className="section-header">
                            <h2>
                                <i className="fa-solid fa-music"></i>
                                Featured Concerts
                            </h2>
                        </div>
                        {concerts.length > 0 ? (
                            <div className="concerts-timeline">
                                {concerts.map((concert, index) => (
                                    <div
                                        className={`concert-timeline-item ${concert.status === "past" ? "past-concert" : ""
                                            }`}
                                        key={concert._id}
                                    >
                                        <div className="timeline-marker">
                                            <span className="marker-number">{index + 1}</span>
                                        </div>
                                        <div className="concert-timeline-card">
                                            <div className="concert-timeline-image">
                                                <img
                                                    src={getConcertImageUrl(concert._id)}
                                                    alt={concert.title}
                                                    loading="lazy"
                                                />
                                                <span
                                                    className={`concert-status-badge ${concert.status}`}
                                                >
                                                    {concert.status}
                                                </span>
                                            </div>
                                            <div className="concert-timeline-details">
                                                <h3>{concert.title}</h3>
                                                <div className="concert-meta">
                                                    <p>
                                                        <i className="fa-solid fa-location-dot"></i>
                                                        {concert.venue}
                                                    </p>
                                                    <p>
                                                        <i className="fa-regular fa-calendar"></i>
                                                        {new Date(concert.date).toLocaleDateString(
                                                            "en-US",
                                                            {
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                            }
                                                        )}
                                                    </p>
                                                </div>
                                                <p className="concert-description">
                                                    {concert.description}
                                                </p>
                                                <Link
                                                    to={`/concert/${concert._id}`}
                                                    className="view-concert-btn"
                                                >
                                                    View Details
                                                    <i className="fa-solid fa-arrow-right"></i>
                                                </Link>
                                            </div>
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

export default ArtistProfile;
