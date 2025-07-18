import WhiteboardOutput from "./whiteboard/WhiteboardOutput";
import { useWhiteboardState } from "./whiteboard/useWhiteboardState";
import { UserInput } from "./UserInput";

import { TopBar } from "./TopBar";

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
          <div className={`flex flex-col gap-2 w-full h-full grow bg-white text-lg rounded-md p-4 overflow-y-auto border-2 align-center ${!isResponseComplete ? 'border-blue-400 pulse-border' :
            (isWelcomeScreen ? 'border-green-300' : 'border-gray-300')
            }`}>

            <TopBar state={state} goBack={goBack} goToNextPage={goToNextPage} />

            <WhiteboardOutput
              whiteboardHtml={whiteboardHtml}
              isLoading={!isResponseComplete}
              isSessionActive={isSessionActive}
              answerStream={answerStream}
              questionStream={questionStream}
            />

            <UserInput
              sendTextMessage={sendTextMessage}
              questionStream={questionStream}
              answerStream={answerStream}
              state={state}
              isSessionActive={isSessionActive}
              isMicrophoneActive={isMicrophoneActive}
              toggleMicrophone={toggleMicrophone}
            />
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
