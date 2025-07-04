import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import Loader from "../Components/Loading/loading";
import Header from "../Components/NavBar/Navbar";

const ConcertList = () => {
  const [concerts, setConcerts] = useState([]);
  const [cities, setCities] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  const query = searchParams.get("query") || "";
  const selectedCity = searchParams.get("city") || "All";
  const selectedStatus = searchParams.get("status") || "upcoming";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/concert/list", {
          params: { query, city: selectedCity, status: selectedStatus },
        });
        setConcerts(res.data.concerts);
        setCities(res.data.cities);
        setStatuses(res.data.statuses);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching concert list:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [query, selectedCity, selectedStatus]);

  const handleInputChange = (e) => {
    e.preventDefault();
    searchParams.set("query", e.target.value);
    setSearchParams(searchParams);
  };

  const handleFilterChange = (e) => {
    e.preventDefault();
    searchParams.set(e.target.name, e.target.value);
    setSearchParams(searchParams);
    setLoading(true);
  };
  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Header />
      <div className="main-container">
        <div className="innercontainer">
          <section className="top-section">
            <h1>Concerts</h1>
            <h3>You can see all concerts available here!</h3>
            <div className="searchandcity">
              <form
                action="#"
                method="GET"
                id="filterForm"
                onSubmit={(e) => e.preventDefault()}
              >
                <div className="searchsection">
                  <input
                    type="text"
                    name="query"
                    placeholder="Search for concerts, bands or tags..."
                    value={query}
                    onChange={handleInputChange}
                    required
                  />
                  <button type="submit">
                    <i className="fas fa-search"></i>
                  </button>
                </div>

                {/* City Filter */}
                <div className="cityselection">
                  <label htmlFor="city">City:</label>
                  <select
                    name="city"
                    id="city"
                    value={selectedCity}
                    onChange={handleFilterChange}
                  >
                    <option value="All">All</option>
                    {cities.map((c, index) => (
                      <option key={index} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="cityselection">
                  <label htmlFor="status">Status:</label>
                  <select
                    name="status"
                    id="status"
                    value={selectedStatus}
                    onChange={handleFilterChange}
                  >
                    {statuses.map((status, index) => (
                      <option key={index} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </form>
            </div>
          </section>

          <section className="concert-section">
            {concerts && concerts.length > 0 ? (
              concerts.map((concert) => (
                <div className="concert-card" key={concert._id}>
                  <Link to={`/concert/${concert._id}`}>
                    <img
                      src={`data:${concert.concertImage.contentType};base64,${concert.concertImage.data}`}
                      alt="concert"
                      loading="lazy"
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
                    {new Date(concert.date) >= new Date() ? (
                      <Link to={`/concert/${concert._id}`} className="book-btn">
                        Book Now 🎫
                      </Link>
                    ) : (
                      <Link
                        to={`/concert/${concert._id}`}
                        className="book-btn disabled"
                      >
                        See Details
                      </Link>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>
                No concerts found
                {selectedCity && selectedCity !== "All"
                  ? ` in ${selectedCity}`
                  : ""}
                .
              </p>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default ConcertList;
