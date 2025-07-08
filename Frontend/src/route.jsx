import { createBrowserRouter } from "react-router-dom";
import Homepage from "./pages/homepage";
import ConcertList from "./pages/concertlist";
import ArtistList from "./pages/artistlist";
import Loginpage from "./pages/Loginpage";
import Signup from "./pages/Signup";
import ConcertDetail from "./pages/concertdetail";
import UserProfile from "./pages/userprofile";
import BookingPage from "./pages/bookingpage";
import BookingSuccess from "./pages/bookingsuccess";
import UserTickets from "./pages/usertickets";

var Routerpath = createBrowserRouter([
  { path: "/", element: <Homepage /> },
  { path: "/concert/list", element: <ConcertList /> },
  { path: "/concert/:id", element: <ConcertDetail /> },
  { path: "/artists/list", element: <ArtistList /> },
  { path: "/user/login", element: <Loginpage /> },
  { path: "/user/register", element: <Signup /> },
  { path: "/user/profile", element: <UserProfile /> },
  { path: "/user/Ticket", element: <UserTickets /> },
  { path: "/concert/:id/book", element: <BookingPage /> },
  { path: "/booking/success/:id", element: <BookingSuccess /> },
]);

export default Routerpath;
