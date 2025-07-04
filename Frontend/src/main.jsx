import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/commonstyles.css";
import { RouterProvider } from "react-router-dom";
import Routerpath from "./route";
import { Provider } from "react-redux";
import { store } from "./Components/redux/store";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={Routerpath} />
    </Provider>
  </StrictMode>
);
