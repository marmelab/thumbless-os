import { SoundVisualizer } from "./SoundVisualizer";
import { SendMessage } from "./SendMessage";

export const UserInput = ({
  sendTextMessage,
  questionStream,
  answerStream,
  isSessionActive,
  state,
  isMicrophoneActive,
  toggleMicrophone,
}: {
  sendTextMessage: (message: string) => void;
  questionStream: MediaStream;
  answerStream: MediaStream;
  isSessionActive: boolean;
  state: "asking" | "processing" | "answering";
  isMicrophoneActive: boolean;
  toggleMicrophone: () => void;
}) => {
  return (
    <div className="flex w-full flex-row items-center justify-center gap-4">
      <button
        className="relative cursor-pointer transition-all duration-300 ease-in-out hover:scale-110"
        onClick={() => toggleMicrophone()}
      >
        {(!isMicrophoneActive || state === "asking") && (
          <img
            className="absolute w-10 h-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            src={`/assets/microphone${
              isMicrophoneActive ? "" : "-disabled"
            }.svg`}
            alt="Microphone Icon"
          />
        )}
        <SoundVisualizer
          audioStream={state === "answering" ? answerStream : questionStream}
          isSessionActive={isSessionActive}
        />
      </button>
      <div>
        <SendMessage sendTextMessage={sendTextMessage} />
      </div>
    </div>
  );
};
