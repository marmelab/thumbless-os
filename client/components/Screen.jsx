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
  toggleMicrophone,
}) {
  // Use our custom hook for whiteboard state management
  const { whiteboardHtml, isResponseComplete, goBack, goToNextPage } = useWhiteboardState(
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
            <div className="flex justify-between">
              {
                goBack &&
                  <button className="bg-gray-800 mb-2 w-fit text-white rounded-full py-2 px-4 hover:opacity-90" type="button" onClick={goBack}>
                    &lt; Go back
                  </button>
              }
              {
                goToNextPage &&
                  <button className="bg-gray-800 mb-2 ml-auto w-fit text-white rounded-full py-2 px-4 hover:opacity-90" type="button" onClick={goToNextPage}>
                    &gt; Next page
                  </button>
              }
            </div>

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
                isMicrophoneActive={isMicrophoneActive}
                toggleMicrophone={toggleMicrophone}
              />
              <div>
                <SendMessage sendTextMessage={sendTextMessage} />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-gray-50 rounded-md border-2 border-gray-300 p-4 flex items-center justify-center">
            <p>Start the session to use the assistant...</p>
          </div>
        )}
      </div>
    </section>
  );
}
