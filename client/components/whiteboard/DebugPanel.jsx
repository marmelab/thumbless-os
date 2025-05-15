export default function DebugPanel({ events, isSessionActive }) {
  // Filter for relevant events
  const sessionEvents = events.filter(event => 
    event.type === 'session.created' || 
    event.type === 'session.update'
  );
  
  const functionCallEvents = events.filter(event => 
    event.type === 'response.done' && 
    event.response?.output?.some(output => output.type === 'function_call')
  );

  return (
    <div className="mt-4 p-2 bg-gray-100 rounded-md text-xs">
      <h3 className="font-bold">Debug Panel</h3>
      
      <div className="mt-2">
        <h4 className="font-semibold">Session Status</h4>
        <p>Session Active: {isSessionActive ? 'Yes' : 'No'}</p>
        <p>Session Events: {sessionEvents.length}</p>
        <p>Function Call Events: {functionCallEvents.length}</p>
      </div>
      
      {sessionEvents.length > 0 && (
        <div className="mt-2">
          <h4 className="font-semibold">Latest Session Event</h4>
          <pre className="mt-1 p-1 bg-gray-200 rounded overflow-x-auto" style={{ maxHeight: '100px' }}>
            {JSON.stringify(sessionEvents[0], null, 2)}
          </pre>
        </div>
      )}
      
      {functionCallEvents.length > 0 && (
        <div className="mt-2">
          <h4 className="font-semibold">Latest Function Call</h4>
          <pre className="mt-1 p-1 bg-gray-200 rounded overflow-x-auto" style={{ maxHeight: '100px' }}>
            {JSON.stringify(functionCallEvents[0].response.output.find(o => o.type === 'function_call'), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
