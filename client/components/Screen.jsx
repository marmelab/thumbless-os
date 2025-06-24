import WhiteboardOutput from "./whiteboard/WhiteboardOutput";
import { useWhiteboardState } from "./whiteboard/useWhiteboardState";
import { ActivityIndicator } from "./ActivityIndicator";
import { SendMessage } from "./debug/SendMessage";

export default function Screen({
  isSessionActive,
  sendClientEvent,
  events,
  questionStream,
  answerStream,
  state,
  isMicrophoneActive,
  sendTextMessage,
}) {
  // Use our custom hook for whiteboard state management
  const { whiteboardHtml, isResponseComplete } = useWhiteboardState(
    isSessionActive,
    sendClientEvent,
    events,
  );

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
      <div className="w-full max-w-[450px] h-full flex bg-white rounded-md">
        {isSessionActive ? (
          <div className="w-full h-full text-lg flex flex-col">
            <WhiteboardOutput
              whiteboardHtml={whiteboardHtml}
              isLoading={!isResponseComplete}
              isSessionActive={isSessionActive}
              answerStream={answerStream}
              questionStream={questionStream}
            />
            <div className="absolute flex w-full bottom-0 left-1/2 right-1/2 transform -translate-x-1/2 flex-col items-center justify-center gap-2 p-8">
              <ActivityIndicator
                questionStream={questionStream}
                answerStream={answerStream}
                state={state}
                isSessionActive={isSessionActive}
              />
              <div>
                {!isMicrophoneActive && (
                  <SendMessage sendTextMessage={sendTextMessage} />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full bg-gray-50 rounded-md border-2 border-gray-300 p-4 flex items-center justify-center">
            <p>Start the session to use the assistant...</p>
          </div>
        )}
      </div>
    </section>
  );
}
