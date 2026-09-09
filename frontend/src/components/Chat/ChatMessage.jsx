import "./ChatMessage.css";

export default function ChatMessage({

    sender,

    message

}){

    return(

        <div className={`message ${sender}`}>

            <div className="bubble">

                {message}

            </div>

        </div>

    );

}