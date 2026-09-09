import { useEffect } from "react";

import api from "../services/api";

import useEmotion from "./useEmotion";

export default function useDecision() {

    const { setEmotion } = useEmotion();

    useEffect(() => {

        async function loadDecision() {

            try {

                const response = await api.get("/decision/");

                setEmotion(response.data.emotion);

            }

            catch (error) {

                console.log(error);

            }

        }

        loadDecision();

        const interval = setInterval(loadDecision, 10000);

        return () => clearInterval(interval);

    }, [setEmotion]);

}
