import { AudioRecordButton } from "../components/AudioRecordButton";
import { Header } from "../components/Header";
import { useState } from "react";
import TextResult from "../components/TextResult";

function RecordAudioPage() {
  const [text, setText] = useState<string>("");

  return (
    <>
      <body>
        <Header />
        <main>
          <AudioRecordButton setText={setText}/>
          <TextResult text={text}></TextResult>
        </main>
      </body>
    </>
  );
}

export default RecordAudioPage;