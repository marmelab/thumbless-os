import WhiteboardOutput from './whiteboard/WhiteboardOutput';
import DebugPanel from './whiteboard/DebugPanel';
import { useWhiteboardState } from './whiteboard/useWhiteboardState';

export default function ToolPanel({
  isSessionActive,
  sendClientEvent,
  events,
}) {
  // Use our custom hook for whiteboard state management
  const {
    whiteboardHtml,
    isResponseComplete
  } = useWhiteboardState(isSessionActive, sendClientEvent, events);

  return (
    <section className="h-full w-full flex flex-col gap-4">
      <div className="h-full flex flex-col">
        <h2 className="text-lg font-bold mb-2">AI Whiteboard</h2>
        <div className="flex-1 bg-white rounded-md">
          {isSessionActive ? (
            <WhiteboardOutput 
              whiteboardHtml={whiteboardHtml} 
              isLoading={!isResponseComplete}
            />
          ) : (
            <div className="h-full bg-gray-50 rounded-md p-4 flex items-center justify-center">
              <p>Start the session to use the whiteboard...</p>
            </div>
          )}
        </div>
        <DebugPanel events={events} isSessionActive={isSessionActive} />
      </div>
    </section>
  );
}

// All helper functions have been moved to utility files
