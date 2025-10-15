import "../style/style.css"

interface Props {
    text: string
}

export default function TextResult({text}: Props) {
    return (
        <div className="text_container">
            <h4>Texto Transcrito:</h4>
            <div className="paragraph_container">
                <p>{text}</p>
            </div>
        </div>
    );

}