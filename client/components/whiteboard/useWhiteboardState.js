import { useState, useEffect } from "react";
import { WELCOME_HTML } from "./constants";
import { processToolCalls } from "./processToolCalls";
import { sendPreviousWhiteboard } from "./utils.js";

export function useWhiteboardState(isSessionActive, sendClientEvent, events) {
  const [whiteboardHtml, setWhiteboardHtml] = useState(WELCOME_HTML);
  const [whiteboardHistory, setWhiteboardHistory] = useState([]);
  const [historyTarget, setHistoryTarget] = useState(0);
  const [isResponseComplete, setIsResponseComplete] = useState(true);
  const [lastResponseId, setLastResponseId] = useState(null);

  const updateCurrentWhiteboardInHistory = (whiteboardContent) => {
    setWhiteboardHistory([
      ...whiteboardHistory.slice(0, whiteboardHistory.length - 1 - historyTarget),
      whiteboardContent,
    ]);
  };
  const appendWhiteboardToHistory = (whiteboardContent) => {
    setWhiteboardHistory([
      ...whiteboardHistory.slice(0, whiteboardHistory.length - historyTarget),
      whiteboardContent,
    ]);
    setHistoryTarget(0);
  }

  // Target element in the history should be the current whiteboard, we want the one before.
  // If there is no element before the current one, we cannot go back.
  const goBack = whiteboardHistory.length - historyTarget > 1 ? () => {
    const newWhiteboard = whiteboardHistory[(whiteboardHistory.length - 1) - historyTarget - 1];
    setWhiteboardHtml(newWhiteboard);
    setHistoryTarget(historyTarget + 1);

    // Tell the AI that the current whiteboard has changed.
    sendPreviousWhiteboard(sendClientEvent, newWhiteboard);
  } : null;
  const goToNextPage = historyTarget > 0 ? () => {
    const newWhiteboard = whiteboardHistory[(whiteboardHistory.length - 1) - historyTarget + 1];
    setWhiteboardHtml(newWhiteboard);
    setHistoryTarget(historyTarget - 1);

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
      goBack,
      sendClientEvent,
    );
  }, [events, lastResponseId, whiteboardHtml, sendClientEvent]);

  return {
    whiteboardHtml,
    isResponseComplete,
    goBack,
    goToNextPage,
  };
}
