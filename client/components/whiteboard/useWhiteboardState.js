import { useState, useEffect, useRef } from "react";
import {
  SESSION_INSTRUCTIONS,
  SYSTEM_INSTRUCTIONS,
  WELCOME_HTML,
  SYSTEM_MESSAGES,
  AI_WHITEBOARD_INSTRUCTIONS,
} from "./constants";
import {
  createSessionUpdate,
  sendSystemMessageAndResponse,
  handleWriteToWhiteboard,
  handleUpdateWhiteboardElement,
  handleAddToWhiteboard,
  handleClearWhiteboard,
} from "./utils";

export function useWhiteboardState(isSessionActive, sendClientEvent, events) {
  const [toolsAdded, setToolsAdded] = useState(false);
  const [whiteboardHtml, setWhiteboardHtml] = useState(WELCOME_HTML);
  const [isResponseComplete, setIsResponseComplete] = useState(true);
  const [lastResponseId, setLastResponseId] = useState(null);
  const [userHasSpoken, setUserHasSpoken] = useState(false);
  const prevWhiteboardHtmlRef = useRef(whiteboardHtml);

  // Initialize tools when session becomes active
  useEffect(() => {
    if (!events || events.length === 0) return;

    // Find the most recent session.created event
    const sessionCreatedEvent = events.find(
      (event) => event.type === "session.created",
    );

    if (sessionCreatedEvent && !toolsAdded) {
      console.log("Session created, registering tools...");
      initializeSession(
        sendClientEvent,
        setToolsAdded,
        AI_WHITEBOARD_INSTRUCTIONS,
        SESSION_INSTRUCTIONS,
        SYSTEM_INSTRUCTIONS,
      );
    }
  }, [events, toolsAdded, sendClientEvent]);

  // Process function calls and events
  useEffect(() => {
    if (!events || events.length === 0) return;

    processFunctionCalls(
      events,
      lastResponseId,
      setLastResponseId,
      isResponseComplete,
      setIsResponseComplete,
      whiteboardHtml,
      setWhiteboardHtml,
      sendClientEvent,
    );
  }, [
    events,
    lastResponseId,
    isResponseComplete,
    whiteboardHtml,
    sendClientEvent,
  ]);

  // Reset state when session becomes inactive
  useEffect(() => {
    if (!isSessionActive) {
      setToolsAdded(false);
      setWhiteboardHtml(WELCOME_HTML);
      setUserHasSpoken(false);
    }
  }, [isSessionActive]);

  // Monitor for first user message
  useEffect(() => {
    if (!events || events.length === 0) return;

    detectUserFirstMessage(
      events,
      userHasSpoken,
      setUserHasSpoken,
      sendClientEvent,
    );
  }, [events, userHasSpoken, sendClientEvent]);

  // Avoid unnecessary updates by checking if whiteboard content has changed
  useEffect(() => {
    if (
      isSessionActive &&
      toolsAdded &&
      whiteboardHtml !== prevWhiteboardHtmlRef.current
    ) {
      prevWhiteboardHtmlRef.current = whiteboardHtml;
      console.log(
        "Whiteboard content changed, but no need to send session update",
      );
    }
  }, [whiteboardHtml, isSessionActive, toolsAdded]);

  return {
    toolsAdded,
    whiteboardHtml,
    isResponseComplete,
    userHasSpoken,
  };
}

// Helper functions for useWhiteboardState hook

function initializeSession(sendClientEvent, whiteboardHtml, setToolsAdded) {
  // Register tools with a slight delay to ensure session is fully established
  setTimeout(() => {
    // First, register the tools
    sendClientEvent(createSessionUpdate(AI_WHITEBOARD_INSTRUCTIONS));
    setToolsAdded(true);
    console.log("Tools registered with session");

    // Send instructions as a system message to ensure the assistant behaves correctly
    setTimeout(() => {
      // First update the session instructions
      sendClientEvent({
        type: "session.update",
        session: {
          instructions: SESSION_INSTRUCTIONS,
        },
      });

      // Then add an explicit system message for initial silence and proper behavior
      setTimeout(() => {
        sendClientEvent({
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "system",
            content: [
              {
                type: "input_text",
                text: SYSTEM_INSTRUCTIONS,
              },
            ],
          },
        });

        console.log("System instructions sent, waiting for user to speak...");
      }, 500);
    }, 1500);
  }, 1000);
}

function processFunctionCalls(
  events,
  lastResponseId,
  setLastResponseId,
  isResponseComplete,
  setIsResponseComplete,
  whiteboardHtml,
  setWhiteboardHtml,
  sendClientEvent,
) {
  // Check for cases where the assistant stopped mid-explanation
  const responseDoneEvents = events.filter(
    (event) =>
      event.type === "response.done" &&
      event.response?.output &&
      Array.isArray(event.response.output),
  );

  // Track if we have a complete response with function calls
  if (responseDoneEvents.length > 0) {
    const latestResponse = responseDoneEvents[0];

    if (
      latestResponse.response &&
      latestResponse.response.id !== lastResponseId
    ) {
      setLastResponseId(latestResponse.response.id);

      // Check if this response had any function calls
      const hasFunctionCalls = latestResponse.response.output.some(
        (output) => output.type === "function_call",
      );

      const hasText = latestResponse.response.output.some(
        (output) =>
          output.type === "message" &&
          output.content &&
          output.content.some((c) => c.type === "text" || c.type === "audio"),
      );

      // If we have text but no function calls, and there are already visual elements,
      // we might need to prompt the AI to update the visuals
      checkNeedForVisualPrompt(
        hasText,
        hasFunctionCalls,
        whiteboardHtml,
        sendClientEvent,
      );

      setIsResponseComplete(true);
    }

    // Process function calls in the response
    processFunctionCallsInResponse(
      latestResponse,
      setIsResponseComplete,
      whiteboardHtml,
      setWhiteboardHtml,
      sendClientEvent,
    );
  }
}

function checkNeedForVisualPrompt(
  hasText,
  hasFunctionCalls,
  whiteboardHtml,
  sendClientEvent,
) {
  if (
    hasText &&
    !hasFunctionCalls &&
    !whiteboardHtml.includes("Welcome to AI Teaching Assistant") &&
    whiteboardHtml !== ""
  ) {
    setTimeout(() => {
      // Use a system message followed by response.create for more reliable continuation
      sendClientEvent({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "system",
          content: [
            {
              type: "input_text",
              text: SYSTEM_MESSAGES.promptUpdate,
            },
          ],
        },
      });

      // Create a new response to continue the flow
      sendClientEvent({ type: "response.create" });
    }, 1500);
  }
}

function processFunctionCallsInResponse(
  response,
  setIsResponseComplete,
  whiteboardHtml,
  setWhiteboardHtml,
  sendClientEvent,
) {
  if (!response.response?.output) return;

  response.response.output.forEach((output) => {
    if (output.type === "function_call") {
      console.log("Function call detected:", output.name);
      setIsResponseComplete(false); // Response is ongoing when we see function calls

      try {
        const args = JSON.parse(output.arguments);

        switch (output.name) {
          case "write_to_whiteboard":
            handleWriteToWhiteboard(args, setWhiteboardHtml, sendClientEvent);
            break;

          case "update_whiteboard_element":
            handleUpdateWhiteboardElement(
              args,
              whiteboardHtml,
              setWhiteboardHtml,
              sendClientEvent,
            );
            break;

          case "add_to_whiteboard":
            handleAddToWhiteboard(args, setWhiteboardHtml, sendClientEvent);
            break;

          case "clear_whiteboard":
            handleClearWhiteboard(setWhiteboardHtml, sendClientEvent);
            break;

          default:
            console.log("Unknown function call:", output.name);
        }

        console.log("Whiteboard updated via function call");
      } catch (error) {
        console.error("Error processing function call:", error);
      }
    }
  });
}

function detectUserFirstMessage(
  events,
  userHasSpoken,
  setUserHasSpoken,
  sendClientEvent,
) {
  // Check for user message events
  const userMessageEvent = events.find(
    (event) =>
      event.type === "conversation.item.create" && event.item?.role === "user",
  );

  if (userMessageEvent && !userHasSpoken) {
    console.log("User has spoken, enabling AI response");
    setUserHasSpoken(true);

    // After the user speaks, send a follow-up instruction for a natural teaching response
    setTimeout(() => {
      sendClientEvent({
        type: "response.create",
        response: {
          instructions: SYSTEM_MESSAGES.userSpoken,
        },
      });
    }, 500);
  }
}
