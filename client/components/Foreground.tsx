export const Foreground = () => {
  const isSpeaking = true; // TODO: Replace with actual speaking state logic
  const isProcessing = true; // TODO: Replace with actual processing state logic

  return (
    <>
      {(isSpeaking || isProcessing) && (
        <div className="absolute w-full h-full bg-black opacity-50" />
      )}
      {isSpeaking && (
        <div className="absolute w-full h-full p-8 flex justify-center items-end">
          <img
            src="/assets/microphone.svg"
            alt="Microphone Icon"
            className="w-30"
          />
        </div>
      )}
      {isProcessing && (
        <div className="absolute w-full h-5/6 flex justify-center items-end">
          <img
            src="/assets/loading.svg"
            alt="Processing Icon"
            className="w-3xs"
          />
        </div>
      )}
    </>
  );
};
