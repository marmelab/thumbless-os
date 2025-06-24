import { SoundVisualizer } from "./SoundVisualizer";

export const ActivityIndicator = ({
  questionStream,
  answerStream,
  isSessionActive,
  state,
}: {
  questionStream: MediaStream;
  answerStream: MediaStream;
  isSessionActive: boolean;
  state: "asking" | "processing" | "answering";
}) => {
  return (
    <div className="relative">
      {state === "asking" && (
        <img
          className="absolute w-20 h-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          src="/assets/microphone.svg"
          alt="Processing Icon"
        />
      )}
      {state === "processing" && (
        <img
          className="absolute"
          src="/assets/loading.svg"
          alt="Processing Icon"
        />
      )}
      <SoundVisualizer
        audioStream={state === "answering" ? answerStream : questionStream}
        isSessionActive={isSessionActive}
      />
    </div>
  );
};
