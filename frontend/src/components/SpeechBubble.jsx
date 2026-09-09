export default function SpeechBubble({ message }) {

    if (!message) return null;

    return (

        <div
            style={{

                position: "absolute",

                bottom: "190px",

                left: "-30px",

                background: "white",

                color: "#222",

                padding: "10px",

                borderRadius: "18px",

                maxWidth: "220px",

                textAlign: "center",

                fontSize: "14px",

                boxShadow: "0 5px 15px rgba(0,0,0,0.2)",

                userSelect: "none"

            }}
        >

            {message}

        </div>

    );

}