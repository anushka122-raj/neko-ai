import { useState } from "react";

export default function usePetAnimation() {

    const [animation, setAnimation] = useState("idle");

    function play(name) {
        setAnimation(name);
    }

    return {
        animation,
        play
    };
}