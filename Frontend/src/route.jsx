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
import AdminLogin from "./pages/admin/adminLogin";
import AdminDashboard from "./pages/admin/admindashboard";
import Bandmanagement from "./pages/admin/bandmanagement";
import Concertmanagement from "./pages/admin/concertmanagement";
import Artistmanagement from "./pages/admin/artistmanagement";
import Usermanagement from "./pages/admin/usermanagement";
import Bookingmanagement from "./pages/admin/bookingmanagement";
import ApproveTestimonials from "./pages/admin/testimonials";
import Artistcrate from "./pages/admin/artistcrate";
import Artistedit from "./pages/admin/artistedit";
import Bandcreate from "./pages/admin/bandcreate";
import Bandedit from "./pages/admin/bandedit";
import Concertcreate from "./pages/admin/concertcreate";
import Concertedit from "./pages/admin/concertedit";
import AdminLogout from "./pages/admin/adminLogout";

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
  // admin
  { path: "/admin/login", element: <AdminLogin /> },
  { path: "/admin/dashboard", element: <AdminDashboard /> },
  { path: "/admin/bands", element: <Bandmanagement /> },
  { path: "/admin/concerts", element: <Concertmanagement /> },
  { path: "/admin/artists", element: <Artistmanagement /> },
  { path: "/admin/users", element: <Usermanagement /> },
  { path: "/admin/bookings", element: <Bookingmanagement /> },
  { path: "/admin/approve/reviews", element: <ApproveTestimonials /> },
  { path: "/admin/create/artist", element: <Artistcrate /> },
  { path: "/admin/artist/:id/edit", element: <Artistedit /> },
  { path: "/admin/create/band", element: <Bandcreate /> },
  { path: "/admin/edit/band/:id", element: <Bandedit /> },
  { path: "/admin/create/concerts", element: <Concertcreate /> },
  { path: "/admin/edit/concerts/:id", element: <Concertedit /> },
  { path: "/admin/logout", element: <AdminLogout /> },
]);

export default Routerpath;
