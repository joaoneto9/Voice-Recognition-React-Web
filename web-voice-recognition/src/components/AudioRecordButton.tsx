import { FaMicrophone } from 'react-icons/fa'
import { useState } from 'react'
import { transcriptePost } from '../requests/trasncriptPost'

interface RecordingComponents {
    mediaRecorder: MediaRecorder;
    chunks: Blob[];
}

interface Props {
    setText: React.Dispatch<React.SetStateAction<string>>;
}

export function AudioRecordButton({setText}: Props) {

    const [isActive, setIsActive] = useState<boolean>(false);
    const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

    async function handleRecordAudio() {
        const isRecording = !isActive;
        setIsActive(isRecording);

        if (!isRecording) {
            try {
                const blob = await stopRecording();
                const text = await getDataResponse(blob);

                setText(text.substring(text.length - 1) == "." ? text : text + ".");
            } catch (err) {
                console.log("erro parando a gravacao..." + err);
            }
        } else {
            try {            
                const {mediaRecorder, chunks} = await startRecording();
                
                setRecorder(mediaRecorder);
                setAudioChunks(chunks);
            } catch (err) {
                console.log("erro: " + err);
            }
        }
    }

    async function setupMediaStream(): Promise<MediaStream> {

        try {

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: { ideal: 48000 },
                    channelCount: { ideal: 2 },
                    echoCancellation: { ideal: false },
                    noiseSuppression: { ideal: false },
                    autoGainControl: { ideal: false }
                }
            });

            console.log("acesso ok!");

            return stream;

        } catch (err) {
            alert("tem que ter acesso!" + err);
            throw new Error("sem acesso");
        }
    }

    function stopRecording(): Promise<Blob> {
        if (recorder == null || audioChunks == null) {
            throw new Error("error");
        }

        if (recorder.state !== 'inactive') {
            recorder.stop();
            console.log("parando...");
        }

        return new Promise((resolve) => {

            recorder.onstop = () => {
                const blob = new Blob(audioChunks, { type: 'audio/webm' });
                resolve(blob);
            };

            console.log("gravacao parou.");
        });
    }   

    async function setUpMediaRecorder(): Promise<MediaRecorder> {
        const options: MediaRecorderOptions = {
            mimeType: 'audio/webm; codecs=opus'
        };
        const stream = await setupMediaStream();
        return new MediaRecorder(stream, options);
    }

    async function startRecording(): Promise<RecordingComponents> {
        const chunks: Blob[] = [];
        const mediaRecorder = !recorder ? await setUpMediaRecorder() : recorder;

        let processing = false;

        // é acionado quando passa o timeslap determinado ou quando é chamado .stop()
        mediaRecorder.ondataavailable = async (e: BlobEvent) => {
            if (!e.data.size)
                return;

            chunks.push(e.data); // audio acumulados -> esperam a gravação agora

            if (processing || mediaRecorder.state === 'inactive') // se estiver inativo, ou seja, .stop() foi chamado -> ele interrompe o envio "prévio", pois deve apenas "focar" no envio final.
                return;

            processing = true;

            const blob = new Blob(chunks, { type: 'audio/webm' });
            const text: string = await getDataResponse(blob);

            setText(text.substring(text.length - 1) == "." ? text + ".." : text + "...");

            processing = false;
        };

        mediaRecorder.start(2500);

        console.log("gravacao comecou!");

        return {
            mediaRecorder,
            chunks
        };
    }

    async function getDataResponse(blob: Blob) {
        const response = await transcriptePost(blob);
        const data = await response.json();

        console.log("Resposta da requisição");

        return data.text;
    }

    return (
        <div className="audio_button_container">
            <button
                id="audio_button"
                onClick={handleRecordAudio}
                className={isActive ? 'active' : ''}
            >
                <FaMicrophone size={80} />
            </button>
        </div>
    );

}

