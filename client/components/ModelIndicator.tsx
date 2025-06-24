import { SoundVisualizer } from "./SoundVisualizer";

export const ModelIndicator = ({ audioStream, isSessionActive, isProcessing }:{
  audioStream: MediaStream;
  isSessionActive: boolean;
  isProcessing: boolean;
}) => {
  return (
    <div className="relative">
      {isProcessing && (
        <img
          className="absolute"
          src="/assets/loading.svg"
          alt="Processing Icon"
        />
      )}
      <SoundVisualizer
        audioStream={audioStream}
        isSessionActive={isSessionActive}
      />
    </div>
  );
};
