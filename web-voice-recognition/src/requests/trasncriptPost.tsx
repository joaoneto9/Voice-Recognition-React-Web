export async function transcriptePost(blob: Blob): Promise<Response> {

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