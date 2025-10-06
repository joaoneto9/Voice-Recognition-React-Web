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
                const url = URL.createObjectURL(await stopRecording(audioRecorder, chunks));
                console.log("Áudio gravado! URL: " + url);
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

    const chunks: Blob[] = [];
    const mediaRecorder = new MediaRecorder(stream);

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

    return new Promise((resolve) => {

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            resolve(blob);
        };

        mediaRecorder.stop();
        console.log("gravacao parou!");

    });

}