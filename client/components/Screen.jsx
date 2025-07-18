import { ChevronLeft, ChevronRight } from "react-feather"
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

  const isWelcomeScreen = whiteboardHtml.includes("Welcome to Thumbless OS");

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
            <div className={`w-full grow bg-white rounded-md p-4 overflow-y-auto border-2 align-center ${!isResponseComplete ? 'border-blue-400 pulse-border' :
              (isWelcomeScreen ? 'border-green-300' : 'border-gray-300')
              }`}>
              <div className="flex justify-between mb-2">
                {
                  goBack &&
                  <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 cursor-pointer size-9" type="button" onClick={goBack}>
                    <ChevronLeft />
                  </button>
                }
                {
                  goToNextPage &&
                  <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 cursor-pointer size-9" type="button" onClick={goToNextPage}>
                    <ChevronRight />
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
            </div>
            <div className="absolute flex w-full bottom-0 left-1/2 right-1/2 transform -translate-x-1/2 flex-rw items-center justify-center gap-4 p-8">
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
