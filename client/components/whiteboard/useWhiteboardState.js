import { useState, useEffect } from "react";
import { WELCOME_HTML } from "./constants";
import { processToolCalls } from "./processToolCalls";
import { sendPreviousWhiteboard } from "./utils.js";

export function useWhiteboardState(isSessionActive, sendClientEvent, events) {
  const [whiteboardHtml, setWhiteboardHtml] = useState(WELCOME_HTML);
  const [whiteboardHistory, setWhiteboardHistory] = useState([]);
  const [isResponseComplete, setIsResponseComplete] = useState(true);
  const [lastResponseId, setLastResponseId] = useState(null);

  const updateCurrentWhiteboardInHistory = (whiteboardContent) => {
    setWhiteboardHistory([
      ...whiteboardHistory.slice(0, whiteboardHistory.length - 1),
      whiteboardContent,
    ]);
  };
  const appendWhiteboardToHistory = (whiteboardContent) => {
    setWhiteboardHistory([
      ...whiteboardHistory,
      whiteboardContent,
    ]);
  }

  // Last element in the history is the current whiteboard, we want the previous one.
  // If there is no element before the current one, we cannot go back.
  const goBack = whiteboardHistory.length > 1 ? () => {
    const newWhiteboard = whiteboardHistory[whiteboardHistory.length - 2];
    setWhiteboardHtml(newWhiteboard);
    setWhiteboardHistory([...whiteboardHistory.slice(0, whiteboardHistory.length - 1)]);

    // Tell the AI that the current whiteboard has changed.
    sendPreviousWhiteboard(sendClientEvent, newWhiteboard);
  } : null;

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
      updateCurrentWhiteboardInHistory,
      appendWhiteboardToHistory,
      sendClientEvent,
    );
  }, [events, lastResponseId, whiteboardHtml, sendClientEvent]);

  return {
    whiteboardHtml,
    isResponseComplete,
    goBack,
  };
}
