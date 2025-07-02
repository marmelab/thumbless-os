import { useState, useEffect } from "react";
import { WELCOME_HTML } from "./constants";
import { processToolCalls } from "./processToolCalls";

export function useWhiteboardState(isSessionActive, sendClientEvent, events) {
  const [whiteboardHtml, setWhiteboardHtml] = useState(WELCOME_HTML);
  const [isResponseComplete, setIsResponseComplete] = useState(true);
  const [lastResponseId, setLastResponseId] = useState(null);

  // Process function calls and events
  useEffect(() => {
    if (!events || events.length === 0) return;
    processToolCalls(
      events,
      lastResponseId,
      setLastResponseId,
      setIsResponseComplete,
      whiteboardHtml,
      setWhiteboardHtml,
      sendClientEvent,
    );
  }, [events, lastResponseId, whiteboardHtml, sendClientEvent]);

  return {
    whiteboardHtml,
    isResponseComplete,
  };
}
