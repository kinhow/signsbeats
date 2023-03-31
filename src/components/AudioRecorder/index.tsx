import React, { useState, useEffect, useRef } from "react";

const AudioRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [duration, setDuration] = useState(0);
  const [audioReady, setAudioReady] = useState(false);
  const audio = useRef(null);
  const audioStream = useRef(null);
  const mediaRecorder = useRef(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioStream.current = stream;
    mediaRecorder.current = new MediaRecorder(stream);

    mediaRecorder.current.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) {
        setAudioChunks((chunks) => [...chunks, event.data]);
      }
    });

    mediaRecorder.current.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder.current.stop();
    audioStream.current.getTracks().forEach((track) => track.stop());
    setRecording(false);
    setAudioReady(true);
  };

  const playRecording = () => {
    if (audio.current) {
      audio.current.play();
    }
  };

  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (recording) {
      const timer = setInterval(() => {
        setDuration((duration) => duration + 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setDuration(0);
    }
  }, [recording]);

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
      audio.current = new Audio(audioUrl);
    }
  }, [audioUrl]);

  return (
    <div>
      <div>{formatDuration(duration)}</div>
      <button onClick={startRecording} disabled={recording}>
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!recording}>
        Stop Recording
      </button>
      <button onClick={playRecording} disabled={!audioReady}>
        Play Recording
      </button>
    </div>
  );
};

export default AudioRecorder;
