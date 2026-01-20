// BodyBackground.js
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function BodyBackground() {
  const location = useLocation();

  useEffect(() => {
    // Determine background image based on route
    let bg;

    switch (location.pathname) {
        case "/":
            bg = "url('/homebackground.jpeg')";
            break;
        case "/speed":
        case "/rollout":
        case "/ratios":
        case "/map":
            bg = "url('/calcbackground.jpeg')";
            break;
      default:
        bg = "none";
    }

    document.body.style.backgroundImage = bg;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.classList.add("h-full");
    document.body.classList.add("bg-gray-900");
    document.body.classList.add("bg-cover");

    return () => {
      document.body.style.backgroundImage = "";
    };
  }, [location.pathname]);

  return null;
}
