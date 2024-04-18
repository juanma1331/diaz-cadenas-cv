import { useRecordWebcam } from "react-record-webcam";
import { generateId } from "lucia";
import React, { useEffect, useRef, useState } from "react";

import VideoContainer from "./container";
import { VideoRecorder } from "./recorder";
import { VideoPreview } from "./preview";

export type VideoProps = {
  onAddToForm: (recording: File) => void;
};

export default function Video({ onAddToForm }: VideoProps) {
  const [recordingID, setRecordingID] = useState<string | undefined>();
  const [progress, setProgress] = useState<number>(0);
  const [formattedTime, setFormattedTime] = useState<string>("00:00");
  const recordingTimeRef = useRef<{ startTime: number; elapsedTime: number }>({
    startTime: 0,
    elapsedTime: 0,
  });
  const progressIntervalRef = useRef<NodeJS.Timeout>();

  const {
    createRecording,
    activeRecordings,
    openCamera,
    startRecording,
    stopRecording,
    clearAllRecordings,
    resumeRecording,
    errorMessage,
    pauseRecording,
  } = useRecordWebcam({
    options: {
      fileType: "webm",
      timeSlice: 1000,
    },
    mediaRecorderOptions: { mimeType: "video/webm; codecs=vp8" },
  });

  // Start new recording on component mount
  useEffect(() => {
    // TODO: We should check if device has webcam
    const startNewRecording = async () => await newRecording();

    startNewRecording();
  }, []);

  // Start a new camera whenever recordingID changes
  useEffect(() => {
    const startCamera = async () => {
      if (recordingID) {
        await openCamera(recordingID);
      }
    };

    startCamera();
  }, [recordingID]);

  async function handleOnAddToForm() {
    const recording = activeRecordings.find((r) => r.id === recordingID);

    if (recording) {
      const fileName = `cv-video-${generateId(15)}.webm`;
      const file = new File([recording.blob!], fileName, {
        type: "video/webm",
        lastModified: Date.now(),
      });

      onAddToForm(file);
    }
  }

  async function pause() {
    if (recordingID) {
      await pauseRecording(recordingID);

      const now = Date.now();
      recordingTimeRef.current.elapsedTime +=
        now - recordingTimeRef.current.startTime;
      recordingTimeRef.current.startTime = 0;
      clearInterval(progressIntervalRef.current);
    }
  }

  async function stop() {
    if (recordingID) {
      clearInterval(progressIntervalRef.current);
      await stopRecording(recordingID);
    }
  }

  async function resume() {
    if (recordingID) {
      await resumeRecording(recordingID);
      recordingTimeRef.current.startTime = Date.now();
      startNewRecordingInterval();
    }
  }

  async function newRecording() {
    clearAllRecordings();

    const recording = await createRecording();
    if (recording) {
      setRecordingID(recording.id);
      setProgress(0);
      setFormattedTime("00:00");
      recordingTimeRef.current = { startTime: 0, elapsedTime: 0 };
    }
  }

  async function start() {
    if (recordingID) {
      await startRecording(recordingID);
      recordingTimeRef.current.startTime = Date.now();
      startNewRecordingInterval();
    }
  }

  function startNewRecordingInterval() {
    progressIntervalRef.current = setInterval(() => {
      const elapsedTime =
        Date.now() -
        recordingTimeRef.current.startTime +
        recordingTimeRef.current.elapsedTime;
      const progress = Math.min(100, (elapsedTime / 60000) * 100);
      setProgress(progress);
      setFormattedTime(formatTime(elapsedTime));

      if (progress >= 99) {
        // With >= 99 we get an exact 1min video
        stop();
      }
    }, 1000);
  }

  if (errorMessage) {
    return <VideoContainer>ERROR</VideoContainer>;
  }

  return activeRecordings.map((r, i) => {
    return (
      <React.Fragment key={`video-recording-${r.id}`}>
        <div className={`${r.status !== "STOPPED" ? "hidden" : ""}`}>
          <VideoContainer>
            <VideoPreview
              ref={r.previewRef}
              onAddToForm={handleOnAddToForm}
              onNewRecording={newRecording}
            />
          </VideoContainer>
        </div>

        <div className={`${r.status === "STOPPED" ? "hidden" : ""}`}>
          <VideoContainer>
            <VideoRecorder
              ref={r.webcamRef}
              formattedTime={formattedTime}
              progress={progress}
              status={r.status}
              onPause={pause}
              onResume={resume}
              onStart={start}
              onStop={stop}
            />
          </VideoContainer>
        </div>
      </React.Fragment>
    );
  });
}

function formatTime(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}
