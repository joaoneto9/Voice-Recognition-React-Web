import { FaMicrophone } from 'react-icons/fa'
import { useState } from 'react'

export function AudioRecordButton() {

    const [isActive, setIsActive] = useState(false);

    async function handleRecordAudio() {

        if (!isActive) {

            setIsActive(true);

            let stream: MediaStream | null = null;
            let audioRecorder: MediaRecorder | null = null;

            try {
                stream = await setupAudioComponent();
                const {mediaRecorder, chunks} = startRecording(stream);
                audioRecorder = mediaRecorder;
                await new Promise(resolve => setTimeout(resolve, 10000));
                const blob = await stopRecording(audioRecorder, chunks);
                await sendAudioToServer(blob);
            } catch (err) {
                console.log("erro na gravacao");
            } finally {
                stream?.getTracks().forEach(track => track.stop());
                setIsActive(false);
            }
        }

    };

    return (
        <>
            <div>
                <button 
                    id="audio-button"
                    onClick={handleRecordAudio}
                    className={isActive ? 'active' : ''} 
                    >
                    <FaMicrophone size={80}/>
                </button>
            </div>
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