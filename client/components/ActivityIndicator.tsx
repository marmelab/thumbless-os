import React from "react";
import { SoundVisualizer } from "./SoundVisualizer";

export const ActivityIndicator = ({
  questionStream,
  answerStream,
  isSessionActive,
  state,
  isMicrophoneActive,
  toggleMicrophone,
}: {
  questionStream: MediaStream;
  answerStream: MediaStream;
  isSessionActive: boolean;
  state: "asking" | "processing" | "answering";
  isMicrophoneActive: boolean;
  toggleMicrophone: () => void;
}) => {
  return (
    <button
      className="relative cursor-pointer transition-all duration-300 ease-in-out hover:scale-110"
      onClick={() => toggleMicrophone()}
    >
      {state === "processing" ? (
        <img
          className="absolute"
          src="/assets/loading.svg"
          alt="Processing Icon"
        />
      ) : (
        (!isMicrophoneActive || state === "asking") && (
          <img
            className="absolute w-20 h-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            src={`/assets/microphone${isMicrophoneActive ? "" : "-disabled"}.svg`}
            alt="Processing Icon"
          />
        )
      )}
      <SoundVisualizer
        audioStream={state === "answering" ? answerStream : questionStream}
        isSessionActive={isSessionActive}
      />
    </button>
  );
};
