import React, { useEffect, useState } from "react";

const FlashMessage = ({ type = "success", message = "", duration = 3000 }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(false);
    }, duration);

    return () => clearTimeout(timeout);
  }, [duration]);

  if (!visible || !message) return null;

  return <div className={`flash-message ${type}`}>{message}</div>;
};

export default FlashMessage;
