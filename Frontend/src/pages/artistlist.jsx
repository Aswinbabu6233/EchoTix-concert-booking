import React, { useEffect, useState } from "react";
import Header from "../Components/NavBar/Navbar";
import axios from "axios";
import Loader from "../Components/Loading/loading";
import { Link } from "react-router-dom";
import BASE_API from "../config/baseapi";

const ArtistList = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await axios
          .get(BASE_API + "/artists/list")
          .then((res) => res.data);
        setArtists(response.artists);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching artist list:", error);
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Header />
      <div className="main-container">
        <div className="inner-container">
          <section className="top-section">
            <h1>Meet the Artists behind the music</h1>
            <h3>Discover the diverse talents of EchoTix's artists</h3>{" "}
          </section>
          <section className="hero-artist-section">
            {artists.length > 0 &&
              artists.map((artist) => (
                <Link to={`/artist/${artist._id}`} key={artist._id}>
                  <div className="artistlist-card">
                    <div className="artists-image">
                      <img
                        src={`data:${artist.photo.contentType};base64,${artist.photo.data}`}
                        alt="artist"
                        loading="lazy"
                      />
                    </div>
                    <div className="artist-name-div">
                      <h3 className="artist-name">{artist.name}</h3>
                    </div>
                  </div>
                </Link>
              ))}
          </section>
        </div>
      </div>
    </>
  );
};

export default ArtistList;
