import useEmotion from "../hooks/useEmotion";

export default function EmotionBadge(){

    const { emotion } = useEmotion();

    return(

        <div

        style={{

            position:"fixed",

            top:20,

            left:20,

            background:"#333",

            color:"white",

            padding:"10px",

            borderRadius:"12px"

        }}

        >

            Emotion : {emotion}

        </div>

    )

}