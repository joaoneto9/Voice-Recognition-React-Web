import { useRef, useState } from "react"


interface SoundInputProps {
    name: string,
}

export default function SoundInput({name} : SoundInputProps) {
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    const onClick = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop(); // para a gravação

            if (!audioBlob) return;

            const formData = new FormData();
            formData.append("audio", audioBlob, "gravacao.wav");

            try {
                const response = await fetch("http://127.0.0.1:5000/translate", {
                    method: "POST",
                    body: formData,
                });

                const result = await response.text();
                console.log("Resposta do backend:", result);
            } catch (err) {
                console.error("Erro ao enviar áudio:", err);
            }

        } else {
            if (mediaRecorderRef.current == null) { // se estiver null, deve-se criar uma instância
                const stream = await navigator.mediaDevices.getUserMedia({audio: true});
                const recorder = new MediaRecorder(stream);
                mediaRecorderRef.current = recorder
            }

            const chunks: BlobPart[] = [];

            // quando estiver com dados disponíveis
            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            // quando parar a gravação (salva o áudio)
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunks, { type: "audio/wav"})
                setAudioBlob(blob);
            };

            mediaRecorderRef.current.start();
        }

        setIsRecording(!isRecording);
    }

    return (
        <>
            <button name={name} onClick={onClick}>{isRecording ? "Parar" : "Iniciar"} a gravação</button>
        </>
    )
}

