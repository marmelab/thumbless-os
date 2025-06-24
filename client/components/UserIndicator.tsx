import { SoundVisualizer } from "./SoundVisualizer";

export const UserIndicator = ({ audioStream, isSessionActive }) => {
  return (
    <div className="relative">
      <img
        className="absolute w-20 h-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        src="/assets/microphone.svg"
        alt="Processing Icon"
      />
      <SoundVisualizer
        audioStream={audioStream}
        isSessionActive={isSessionActive}
      />
    </div>
  );
};
