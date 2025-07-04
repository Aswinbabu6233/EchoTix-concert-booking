import { createBrowserRouter } from "react-router-dom";
import Homepage from "./pages/homepage";
import ConcertList from "./pages/concertlist";
import ArtistList from "./pages/artistlist";
import Loginpage from "./pages/Loginpage";
import Signup from "./pages/Signup";

var Routerpath = createBrowserRouter([
  { path: "/", element: <Homepage /> },
  { path: "/concert/list", element: <ConcertList /> },
  { path: "/artists/list", element: <ArtistList /> },
  { path: "/user/login", element: <Loginpage /> },
  { path: "/user/register", element: <Signup /> },
]);

export default Routerpath;
