import useEmotion from "./useEmotion";
import { spriteMap } from "../utils/spriteMap";

export default function useAnimation(){

    const { emotion } = useEmotion();

    return spriteMap[emotion] || spriteMap.idle;

}