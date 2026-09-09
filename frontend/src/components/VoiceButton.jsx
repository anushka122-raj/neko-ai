export default function VoiceButton() {
  return (
    <button
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        padding: "10px 15px",
        borderRadius: "50%",
        border: "none",
        background: "#00c853",
        color: "white",
        fontSize: "20px",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0,0,0,.3)",
      }}
    >
      🎤
    </button>
  );
}
