import {
  handleWriteToWhiteboard,
  handleUpdateWhiteboardElement,
  handleAddToWhiteboard,
} from "./utils";

export function processToolCalls(
  events,
  lastResponseId,
  setLastResponseId,
  isResponseComplete,
  setIsResponseComplete,
  whiteboardHtml,
  setWhiteboardHtml,
  sendClientEvent,
) {
  const responseDoneEvents = events.filter(
    (event) =>
      event.type === "response.done" &&
      event.response?.output &&
      Array.isArray(event.response.output),
  );
  if (responseDoneEvents.length === 0) return;

  const latestResponse = responseDoneEvents[0];
  if (!latestResponse.response) return;
  if (latestResponse.response.id === lastResponseId) return;

  // Process function calls in the response
  processFunctionCallsInResponse(
    latestResponse,
    setIsResponseComplete,
    whiteboardHtml,
    setWhiteboardHtml,
    sendClientEvent,
  );
  setLastResponseId(latestResponse.response.id);
  setIsResponseComplete(true);
}

function processFunctionCallsInResponse(
  response,
  setIsResponseComplete,
  whiteboardHtml,
  setWhiteboardHtml,
  sendClientEvent,
) {
  if (!response.response?.output) return;

  // Flag to track if we found and processed any function calls
  let foundFunctionCalls = false;

  response.response.output.forEach((output) => {
    if (output.type === "function_call") {
      console.log("Function call detected:", output.name);
      foundFunctionCalls = true;
      setIsResponseComplete(false); // Response is ongoing when we see function calls

      try {
        // Safely parse arguments with fallback to empty object
        const args = (() => {
          try {
            return JSON.parse(output.arguments);
          } catch (e) {
            console.warn("Failed to parse function arguments:", e);
            return {};
          }
        })();

        switch (output.name) {
          case "write_to_whiteboard":
            if (args.html) {
              console.log(
                "Writing to whiteboard with HTML:",
                args.html.substring(0, 100) + "...",
              );
              handleWriteToWhiteboard(args, setWhiteboardHtml, sendClientEvent);
            } else {
              console.error(
                "Missing html argument in write_to_whiteboard call",
              );
            }
            break;

          case "update_whiteboard_element":
            if (args.elementId && args.html) {
              console.log(
                `Updating element #${args.elementId} with HTML:`,
                args.html.substring(0, 100) + "...",
              );
              handleUpdateWhiteboardElement(
                args,
                whiteboardHtml,
                setWhiteboardHtml,
                sendClientEvent,
              );
            } else {
              console.error(
                "Missing required arguments in update_whiteboard_element call",
              );
            }
            break;

          case "add_to_whiteboard":
            if (args.html) {
              console.log(
                "Adding to whiteboard with HTML:",
                args.html.substring(0, 100) + "...",
              );
              handleAddToWhiteboard(
                args,
                whiteboardHtml,
                setWhiteboardHtml,
                sendClientEvent,
              );
            } else {
              console.error("Missing html argument in add_to_whiteboard call");
            }
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

  // If no function calls were found in this response but we have text content,
  // and the whiteboard is empty or just has the welcome message,
  // remind the AI to use visual elements
  if (
    !foundFunctionCalls &&
    (whiteboardHtml.includes("Welcome to AI Teaching Assistant") ||
      whiteboardHtml === "")
  ) {
    const hasTextContent = response.response.output.some(
      (out) =>
        out.type === "message" &&
        out.content &&
        out.content.some(
          (c) => c.type === "text" && c.text && c.text.trim().length > 0,
        ),
    );

    if (hasTextContent) {
      console.log(
        "Response contains text but no visuals, prompting for visual content",
      );
      sendClientEvent({
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "system",
          content: [
            {
              type: "input_text",
              text: "Please use write_to_whiteboard to create visual content that supports your explanation.",
            },
          ],
        },
      });

      // Create a new response to continue the flow
      sendClientEvent({ type: "response.create" });
    }
  }
}
