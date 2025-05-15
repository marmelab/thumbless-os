import WhiteboardOutput from './whiteboard/WhiteboardOutput';
import { useWhiteboardState } from './whiteboard/useWhiteboardState';

export default function ToolPanel({
  isSessionActive,
  sendClientEvent,
  events,
}) {
  // Use our custom hook for whiteboard state management
  const {
    toolsAdded,
    whiteboardHtml,
    isResponseComplete,
  } = useWhiteboardState(isSessionActive, sendClientEvent, events);

  return (
    <section className="h-full w-full flex flex-col gap-4">
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">AI Whiteboard</h2>
          {isSessionActive && (
            <div className={`text-xs px-2 py-1 rounded-full ${toolsAdded ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {toolsAdded ? 'Tools Ready' : 'Initializing...'}
            </div>
          )}
        </div>
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
      </div>
    </section>
  );
}

// All helper functions have been moved to utility files
