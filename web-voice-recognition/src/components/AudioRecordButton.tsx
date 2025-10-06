import { FaMicrophone } from 'react-icons/fa'
import { useState } from 'react'
import TextResult from './TextResult'

export function AudioRecordButton() {

    const [isActive, setIsActive] = useState<boolean>(false);
    const [response, setResponse] = useState<string>("");
    

    async function handleRecordAudio() {

        if (!isActive) {

            setIsActive(true);

            let stream: MediaStream | null = null;

            try {
                stream = await setupAudioComponent(); // ele starta o acessp ao microfone

                const {mediaRecorder, chunks} = startRecording(stream); // inicia a gravação 

                await new Promise(resolve => setTimeout(resolve, 10000)); // aguarda 10 segundos -> implementar um keyInterrupt

                const blob = await stopRecording(mediaRecorder, chunks); // para a gravação 

                const text = await getDataResponse(blob); // envia o áudio para o servidor que trancreve
                setResponse(text); // seta a ultima resposta
            } catch (err) {
                console.log("erro na gravacao", err);
            } finally {
                stream?.getTracks().forEach(track => track.stop());
                setIsActive(false);
            }
        }

    };

    async function getDataResponse(blob: Blob) {
        const response = await sendAudioToServer(blob);
        const data = await response.json();

        console.log("Resposta da requisição");

        return data.text;
    }

    return (
        <>
            <div className="sound_button_container">
                <button 
                    id="audio-button"
                    onClick={handleRecordAudio}
                    className={isActive ? 'active' : ''} 
                    >
                    <FaMicrophone size={80}/>
                </button>
            </div>
            <TextResult text={response}/>
        </>
    );

}

async function setupAudioComponent(): Promise<MediaStream> {

    try {

        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true
        });

        console.log("acesso ok!");

        return stream;

    } catch (err) {
        alert("tem que ter acesso!");
        throw new Error("sem acesso");
    }

}

interface RecordingComponents {
    mediaRecorder: MediaRecorder;
    chunks: Blob[];
}

function startRecording(stream: MediaStream): RecordingComponents {

    const options: MediaRecorderOptions = {
        mimeType: 'audio/webm; codecs=opus'
    };

    const chunks: Blob[] = [];
    const mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder.ondataavailable = (e: BlobEvent) => {
        chunks.push(e.data);
    };

    mediaRecorder.start();

    console.log("gravacao comecou!");

    return {
        mediaRecorder,
        chunks
    };

}

function stopRecording(mediaRecorder: MediaRecorder, chunks: Blob[]): Promise<Blob> {

    if (mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        console.log("parando...");
    }

    return new Promise((resolve) => {

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            resolve(blob);
        };

        mediaRecorder.stop();
        console.log("gravacao parou.");

    });

}

async function sendAudioToServer(blob: Blob): Promise<Response> {

    if (blob.size === 0) {
        throw new Error("Vazio");
    }

    const formData = new FormData();

    formData.append('audio', blob, 'gravacao.webm');

    const response = await fetch('http://localhost:5000/transcribe', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
    }

    console.log("enviado");
    return response;

}