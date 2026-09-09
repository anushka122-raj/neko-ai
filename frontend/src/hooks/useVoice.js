import { useState } from "react";

export default function useVoice(onResult) {

    const [isListening, setIsListening] = useState(false);

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;

    recognition.onstart = () => {

        setIsListening(true);

    };

    recognition.onend = () => {

        setIsListening(false);

    };

    recognition.onresult = (event) => {

        const transcript =
            event.results[0][0].transcript;

        onResult(transcript);

    };

    function startListening() {

        recognition.start();

    }

    return {

        isListening,

        startListening

    };

}
export function speak(text){

    const utterance =
        new SpeechSynthesisUtterance(text);

    utterance.lang = "en-US";

    speechSynthesis.speak(utterance);

}