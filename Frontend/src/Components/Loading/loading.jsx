// src/components/Loader.js
import Lottie from "lottie-react";
import loadingAnimation from "../../assets/Loading.json"; // update path as needed
import Header from "../NavBar/Navbar";

const Loader = () => {
  return (
    <>
      <Header />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Lottie
          animationData={loadingAnimation}
          loop={true}
          style={{ width: "400px", height: "400px" }}
        />
      </div>
    </>
  );
};

export default Loader;
