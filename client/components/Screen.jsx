import WhiteboardOutput from './whiteboard/WhiteboardOutput';
import { useWhiteboardState } from './whiteboard/useWhiteboardState';

export default function Screen({
  isSessionActive,
  sendClientEvent,
  events,
}) {
  // Use our custom hook for whiteboard state management
  const {
    whiteboardHtml,
    isResponseComplete,
  } = useWhiteboardState(isSessionActive, sendClientEvent, events);

  return (
    <section className="absolute top-0 left-0 right-[380px] bottom-0 p-4 pt-0 flex justify-center items-start">
      <div className="w-full max-w-[380px] h-full flex">
        <div className="flex-1 bg-white rounded-md ">
          {isSessionActive ? (
            <WhiteboardOutput
              whiteboardHtml={whiteboardHtml}
              isLoading={!isResponseComplete}
            />
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
