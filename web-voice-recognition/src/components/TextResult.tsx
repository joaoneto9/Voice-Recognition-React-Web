interface TextInterface {
    text: string
}

export default function TextResultButton({text}: TextInterface) {
    return (
        <div className="text_container">
            <h4>Texto Transcrito:</h4>
            <div className="paragraph_container">
                <p>{text}</p>
            </div>
        </div>
    );

}