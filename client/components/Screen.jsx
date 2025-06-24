import { useEffect, useState } from "react";
import { ModelIndicator } from "./ModelIndicator";
import { UserIndicator } from "./UserIndicator";
import WhiteboardOutput from "./whiteboard/WhiteboardOutput";
import { useWhiteboardState } from "./whiteboard/useWhiteboardState";

export default function Screen({
  isSessionActive,
  sendClientEvent,
  events,
  questionStream,
  answerStream,
}) {
  // Use our custom hook for whiteboard state management
  const { whiteboardHtml, isResponseComplete } = useWhiteboardState(
    isSessionActive,
    sendClientEvent,
    events,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (events[0] && events[0].type === "conversation.item.created")
      setIsProcessing(true);
    if (events[0] && events[0].type === "output_audio_buffer.started")
      setIsProcessing(false);
  }, [events]);

  return (
    <section
      className="absolute top-0 left-0 right-[380px] bottom-0 p-4 pt-0 flex justify-center items-start"
      style={{
        background:
          "url('/assets/colorful-abstract-wave-on-transparent-background.png')",
        backgroundPositionY: "center",
        backgroundSize: "100% auto",
      }}
    >
      <div className="w-full max-w-[450px] h-full flex relative">
        <div className="flex-1 bg-white rounded-md">
          {true ? (
            <div className="w-full h-full text-lg flex flex-col">
              <div className="flex justify-center">
                <ModelIndicator
                  audioStream={answerStream}
                  isSessionActive={true}
                  isProcessing={isProcessing}
                />
              </div>
              <WhiteboardOutput
                whiteboardHtml={whiteboardHtml}
                isLoading={!isResponseComplete}
                isSessionActive={isSessionActive}
                answerStream={answerStream}
                questionStream={questionStream}
              />
              <div className="flex justify-center">
                <UserIndicator
                  audioStream={questionStream}
                  isSessionActive={true}
                />
              </div>
            </div>
          ) : (
            <div className="h-full bg-gray-50 rounded-md border-2 border-gray-300 p-4 flex items-center justify-center">
              <p>Start the session to use the assistant...</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// All helper functions have been moved to utility files
