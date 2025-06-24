import { useState, useEffect } from "react";
import { WELCOME_HTML } from "./constants";
import { declareTools } from "./declareTools";
import { processToolCalls } from "./processToolCalls";
import { getProfile } from "../../profile";

export function useWhiteboardState(isSessionActive, sendClientEvent, events) {
  const [toolsAdded, setToolsAdded] = useState(false);
  const [whiteboardHtml, setWhiteboardHtml] = useState(WELCOME_HTML);
  const [isResponseComplete, setIsResponseComplete] = useState(true);
  const [lastResponseId, setLastResponseId] = useState(null);

  // Initialize tools when session becomes active
  useEffect(() => {
    if (!events || events.length === 0 || toolsAdded) return;
    // Find the most recent session.created event
    const sessionCreatedEvent = events.find(
      (event) => event.type === "session.created",
    );
    const profile = getProfile();
    if (!sessionCreatedEvent) return;
    sendClientEvent(declareTools(profile));
    setToolsAdded(true);
  }, [events, toolsAdded, sendClientEvent]);

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

  // Reset state when session becomes inactive
  useEffect(() => {
    if (!isSessionActive) {
      setToolsAdded(false);
    }
  }, [isSessionActive]);

  return {
    whiteboardHtml,
    isResponseComplete,
  };
}
