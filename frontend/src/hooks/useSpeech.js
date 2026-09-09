import { useState, useEffect } from "react";
import api from "../services/api";

export default function useSpeech() {

    const [message, setMessage] = useState("");

    useEffect(() => {

        async function fetchMessage() {

            try {

                const response = await api.get("/decision/");

                setMessage(response.data.message);

            }

            catch (error) {

                console.log(error);

            }

        }

        fetchMessage();

        const interval = setInterval(fetchMessage, 5000);

        return () => clearInterval(interval);

    }, []);

    return message;

}