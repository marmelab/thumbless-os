// Utility functions for handling whiteboard tool operations
import { FUNCTION_NAMES, SYSTEM_MESSAGES } from "./constants";

// Function to create session update with DOM manipulation tools
export function createSessionUpdate(whiteboardHtml) {
  return {
    type: "session.update",
    session: {
      tools: [
        {
          type: "function",
          name: FUNCTION_NAMES.write,
          description:
            "Replace the entire visual content with new HTML. Use this for initial content or complete overhauls. Always include semantic IDs for all major elements.",
          parameters: {
            type: "object",
            properties: {
              html: {
                type: "string",
                description:
                  'HTML content to display. Use semantic HTML tags and include IDs for all major elements (e.g., <div id="intro">, <h2 id="main-concept">, etc.)',
              },
            },
            required: ["html"],
          },
        },
        {
          type: "function",
          name: FUNCTION_NAMES.update,
          description:
            "Update a specific element on the whiteboard by its ID. Use this to modify specific sections rather than the entire content.",
          parameters: {
            type: "object",
            properties: {
              elementId: {
                type: "string",
                description:
                  'ID of the HTML element to update (e.g., "introduction", "main-concept", "examples", etc.)',
              },
              html: {
                type: "string",
                description:
                  "New HTML content to replace within the selected element. Can include nested elements with their own IDs.",
              },
              createIfNotExist: {
                type: "boolean",
                description:
                  "If true and the element doesn't exist, the content will be appended to the whiteboard with the given ID.",
              },
            },
            required: ["elementId", "html"],
          },
        },
        {
          type: "function",
          name: FUNCTION_NAMES.add,
          description:
            "Append HTML content to the current visuals. Use this to add new sections as your explanation progresses.",
          parameters: {
            type: "object",
            properties: {
              html: {
                type: "string",
                description:
                  "HTML content to append. Always include IDs for new major elements to allow future updates.",
              },
            },
            required: ["html"],
          },
        },
        {
          type: "function",
          name: FUNCTION_NAMES.clear,
          description:
            "Clear all visual content. Use this only when changing to a completely new topic.",
          parameters: {
            type: "object",
            properties: {},
          },
        },
      ],
      tool_choice: "auto",
      instructions: whiteboardHtml,
    },
  };
}

// Send a system message followed by triggering a response
export function sendSystemMessageAndResponse(
  sendClientEvent,
  message,
  delay = 800,
) {
  setTimeout(() => {
    sendClientEvent({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "system",
        content: [
          {
            type: "input_text",
            text: message,
          },
        ],
      },
    });

    // Create a new response to continue the flow
    sendClientEvent({ type: "response.create" });
  }, delay);
}

// Handle write_to_whiteboard function call
export function handleWriteToWhiteboard(
  args,
  setWhiteboardHtml,
  sendClientEvent,
) {
  console.log("Writing new visual content:", args.html);
  setWhiteboardHtml(args.html);

  // Continue explanation naturally without mentioning the whiteboard
  sendSystemMessageAndResponse(
    sendClientEvent,
    SYSTEM_MESSAGES.continueExplanation,
  );
}

// Handle update_whiteboard_element function call
export function handleUpdateWhiteboardElement(
  args,
  whiteboardHtml,
  setWhiteboardHtml,
  sendClientEvent,
) {
  console.log("Updating specific element:", args.elementId);

  // Find and update the specified element
  if (args.elementId) {
    // Create a temporary DOM element to parse and manipulate the HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = whiteboardHtml;

    // Find the element with the specified ID
    const targetElement = tempDiv.querySelector(`#${args.elementId}`);

    if (targetElement) {
      // Update the element's content
      targetElement.innerHTML = args.html;
      setWhiteboardHtml(tempDiv.innerHTML);
      console.log(`Element #${args.elementId} updated successfully`);
    } else if (args.createIfNotExist) {
      // If element doesn't exist and createIfNotExist is true, append new element
      const newContent = `<div id="${args.elementId}">${args.html}</div>`;
      setWhiteboardHtml((prev) => prev + newContent);
      console.log(`Element #${args.elementId} created and appended`);
    } else {
      console.warn(`Element with ID ${args.elementId} not found`);
    }
  }

  // Continue explanation naturally
  sendSystemMessageAndResponse(
    sendClientEvent,
    SYSTEM_MESSAGES.updateReference,
  );
}

// Handle add_to_whiteboard function call
export function handleAddToWhiteboard(
  args,
  setWhiteboardHtml,
  sendClientEvent,
) {
  console.log("Adding additional visual content");
  setWhiteboardHtml((prev) => prev + args.html);

  // Continue explanation naturally
  sendSystemMessageAndResponse(sendClientEvent, SYSTEM_MESSAGES.elaborateNew);
}

// Handle clear_whiteboard function call
export function handleClearWhiteboard(setWhiteboardHtml, sendClientEvent) {
  console.log("Clearing all visual content");
  setWhiteboardHtml("");

  // Continue with a new topic
  sendSystemMessageAndResponse(sendClientEvent, SYSTEM_MESSAGES.newTopic, 500);
}

// Initialize session with tools and instructions
export function initializeSession(
  sendClientEvent,
  setToolsAdded,
  AI_WHITEBOARD_INSTRUCTIONS,
  SESSION_INSTRUCTIONS,
  SYSTEM_INSTRUCTIONS,
) {
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

// Process function calls in a response
export function processFunctionCallsInResponse(
  output,
  whiteboardHtml,
  setWhiteboardHtml,
  sendClientEvent,
  setIsResponseComplete,
) {
  if (output.type !== "function_call") return;

  console.log("Function call detected:", output.name);
  setIsResponseComplete(false);

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

// Check if AI needs to be prompted to update visual content
export function checkNeedForVisualPrompt(
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

// Detect when user first speaks and send appropriate instructions
export function detectUserFirstMessage(
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
