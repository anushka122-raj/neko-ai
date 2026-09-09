import { useEffect, useState } from "react";
import { ipcRenderer } from "electron";
import "./PetPage.css";

export default function PetPage() {
  const [blink, setBlink] = useState(true);
  const [float, setFloat] = useState(true);
  const [follow, setFollow] = useState(true);
  const [position, setPosition] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (follow) {
        setPosition({ x: event.clientX, y: event.clientY });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    ipcRenderer.on("init-settings", (_, settings) => {
      setBlink(settings.blinkEnabled);
      setFloat(settings.floatEnabled);
      setFollow(settings.followEnabled);
    });

    ipcRenderer.on("toggle-blink", (_, newState) => setBlink(newState));
    ipcRenderer.on("toggle-float", (_, newState) => setFloat(newState));
    ipcRenderer.on("toggle-follow", (_, newState) => setFollow(newState));

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      ipcRenderer.removeAllListeners("init-settings");
      ipcRenderer.removeAllListeners("toggle-blink");
      ipcRenderer.removeAllListeners("toggle-float");
      ipcRenderer.removeAllListeners("toggle-follow");
    };
  }, [follow]);

  return (
    <div className="pet-container">
      <div
        className="pet"
        style={{
          position: "absolute",
          left: position.x - 45,
          top: position.y - 45,
          animation: `
            ${blink ? "blink 3s infinite" : ""}
            ${float ? ", float 4s ease-in-out infinite" : ""}
          `,
        }}
      >
        🐱
      </div>
    </div>
  );
}
