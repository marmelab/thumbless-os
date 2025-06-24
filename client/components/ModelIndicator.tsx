import { SoundVisualizer } from "./SoundVisualizer";

export const ModelIndicator = ({ audioStream, isSessionActive }) => {
  return (
    <div className="relative">
      <img
        className="absolute"
        src="/assets/loading.svg"
        alt="Processing Icon"
      />
      <SoundVisualizer
        audioStream={audioStream}
        isSessionActive={isSessionActive}
      />
    </div>
  );
};
