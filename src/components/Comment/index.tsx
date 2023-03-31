import { ChangeEvent, useRef, useState, useEffect } from "react";
import Textarea from "@mui/joy/Textarea";

declare var MediaRecorder: any;

const MAX_DURATION = 60; // max duration in seconds

const Comment = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isRecordShowing, setIsRecordShowing] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordDuration, setRecordDuration] = useState<number>(0);
  const [audioChunks, setAudioChunks] = useState<Array<string>>([]);
  const [audioBlob, setAudioBlob] = useState<BlobPart | null>(null);
  const [audioUrl, setAudioUrl] = useState<null>(null);
  const [duration, setDuration] = useState(0);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [playTime, setPlayTime] = useState<number>(0);
  const audioRef = useRef(null);
  const audioStream = useRef(null);
  const mediaRecorder = useRef(null);
  const audioContext = useRef(null);
  const audioBuffer = useRef(null);

  const [file, setFile] = useState<File>();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadClick = () => {
    // 👇 We redirect the click event onto the hidden input element
    inputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }

    setFile(e.target.files[0]);

    // 🚩 do the file upload here normally...
  };

  const formatDuration = (duration: number) => {
    if (duration !== Infinity || !isNaN(duration)) {
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);

      const returnedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
      const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

      return `${returnedMinutes}:${returnedSeconds}`;
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioStream.current = stream;
    mediaRecorder.current = new MediaRecorder(stream, {
      mimeType: "audio/webm",
    });

    mediaRecorder.current.addEventListener(
      "dataavailable",
      (event: { data: { size: number } }) => {
        if (event.data.size > 0) {
          setAudioChunks((chunks) => [...chunks, event.data]);
        }
      }
    );

    mediaRecorder.current.start();
    setIsRecording(true);
    setIsRecordShowing(true);
  };

  const stopRecording = () => {
    mediaRecorder.current.stop();
    audioStream.current
      .getTracks()
      .forEach((track: { stop: () => any }) => track.stop());
    setIsRecording(false);
    setIsAudioReady(true);
    setIsPlaying(false);
  };

  const closeRecording = () => {
    setIsRecordShowing(false);
    // setIsAudioReady(true);
    setIsPlaying(false);
    setIsRecording(false);
  };

  const playRecording = () => {
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const pauseRecording = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const deleteRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setAudioChunks([]);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordDuration(0);
    setIsRecordShowing(false);
  };

  const handleSeek = (event: { target: { value: any } }) => {
    if (audioRef.current) {
      audioRef.current.currentTime = event.target.value;
      setPlayTime(audioRef.current.currentTime);
    }
  };

  const handleSeekEnd = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  useEffect(() => {
    if (isRecording) {
      const timer = setInterval(() => {
        setDuration((duration) => duration + 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setDuration(0);
    }
  }, [isRecording]);

  useEffect(() => {
    if (audioChunks.length > 0) {
      setAudioBlob(new Blob(audioChunks, { type: "audio/webm" }));
    }
  }, [audioChunks]);

  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
    }
  }, [audioBlob]);

  useEffect(() => {
    if (audioUrl) {
      const audioElement = new Audio(audioUrl);

      audioElement.addEventListener("ended", () => {
        setIsPlaying(false);
      });

      audioElement.addEventListener("timeupdate", () => {
        setPlayTime(audioElement.currentTime);
      });

      audioElement.addEventListener("ended", () => {
        setPlayTime(0);
      });

      audioRef.current = audioElement;

      // Create an AudioContext and decode the audio data from the blob
      const fileReader = new FileReader();
      audioContext.current = new AudioContext();
      fileReader.readAsArrayBuffer(audioBlob);
      fileReader.onloadend = () => {
        audioContext.current.decodeAudioData(fileReader.result, (buffer) => {
          audioBuffer.current = buffer;
          setRecordDuration(buffer.duration);
        });
      };
    }
  }, [audioUrl]);

  return (
    <div className="bg-[#ffffff] rounded-lg border border-[#E1E2E5]">
      <h3>Comment</h3>
      <p>Share your diet and how your body feel on 2022-12-28</p>
      <div className="flex items-center my-4">
        <div className="bg-[#F4E1C1] py-2.5 px-4 rounded-full text-center">
          E
        </div>
        {isRecordShowing ? (
          <div className="bg-[#F9F0EE] p-2 flex items-center mx-3 rounded-md min-w-[456px] min-h-[45px]">
            {audioUrl ? <audio ref={audioRef} src={audioUrl} /> : null}
            <div className="flex items-center">
              {isRecording ? (
                <>
                  <button
                    onClick={stopRecording}
                    className="cursor-pointer border-none h-6 bg-transparent"
                  >
                    <img src="stop.png" alt="stop" />
                  </button>
                  <div>{formatDuration(duration)}</div>
                </>
              ) : (
                <>
                  {isPlaying ? (
                    <button
                      onClick={pauseRecording}
                      className="cursor-pointer border-none h-6 bg-transparent"
                    >
                      <img src="pause.png" alt="stop" />
                    </button>
                  ) : (
                    <button
                      onClick={playRecording}
                      className="cursor-pointer border-none h-6 bg-transparent"
                    >
                      <img src="play.png" alt="stop" />
                    </button>
                  )}
                  {/* <div>
                    {recordDuration ? formatDuration(recordDuration) : null}
                  </div> */}
                  <div>{`${formatDuration(playTime)} / ${formatDuration(
                    recordDuration
                  )}`}</div>
                  <input
                    type="range"
                    min="0"
                    max={recordDuration}
                    value={playTime}
                    onChange={handleSeek}
                    onMouseUp={handleSeekEnd}
                    onTouchEnd={handleSeekEnd}
                  />
                </>
              )}
            </div>
            {/* <progress value={30 - countdown} /> */}
            {/* <button onClick={stopRecording}>Stop</button> */}
          </div>
        ) : (
          <Textarea
            sx={{
              margin: "0 10px",
              alignItems: "center",
              justifyItems: "center",
              flexDirection: "row",
            }}
            placeholder="Comment"
            endDecorator={
              <input
                type="file"
                accept="image/jpeg, image/png, pdf"
                ref={inputRef}
                onChange={handleFileChange}
              />
            }
          />
        )}
        {isRecording ? (
          <button
            onClick={closeRecording}
            className="w-11 h-11 rounded-md bg-[#F9F0EE] cursor-pointer border-none"
          >
            <img src="close.png" alt="close" />
          </button>
        ) : (
          <>
            {isRecordShowing ? (
              <button
                onClick={deleteRecording}
                className="w-11 h-11 rounded-md bg-[#F9F0EE] cursor-pointer border-none"
              >
                <img src="delete.png" alt="audio" />
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="w-11 h-11 rounded-md bg-[#F9F0EE] cursor-pointer border-none"
              >
                <img src="audio.png" alt="audio" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Comment;
