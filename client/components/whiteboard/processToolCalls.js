import { handleWebSearch } from "../../tools/webSearch";
import { FUNCTION_NAMES } from "./constants";
import {
  handleAddToWhiteboard,
  handleSendEmail,
  handleUpdateWhiteboardElement,
  handleWriteToWhiteboard,
} from "./utils";

export function processToolCalls(
  events,
  lastResponseId,
  setLastResponseId,
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

  const response = responseDoneEvents[0];
  if (!response.response) return;
  if (response.response.id === lastResponseId) return;
  if (!response.response?.output) return;

  // Process function calls in the response

  // Flag to track if we found and processed any function calls
  let foundFunctionCalls = false;

  response.response.output.forEach((output) => {
    if (output.type === "function_call") {
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
          case FUNCTION_NAMES.write:
            if (args.html) {
              handleWriteToWhiteboard(args, setWhiteboardHtml, sendClientEvent);
            } else {
              console.error(
                "Missing html argument in write_to_whiteboard call",
              );
              console.log(args);
            }
            break;

          case FUNCTION_NAMES.update:
            if (args.elementId && args.html) {
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

          case FUNCTION_NAMES.add:
            if (args.html) {
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
          case "search_unsplash_image":
            if (args.query) {
              fetch(`${import.meta.env.VITE_API_URL}/unsplash-image?q=${encodeURIComponent(args.query)}`)
                .then(res => res.json())
                .then(data => {
                  if (data.url) {
                    sendClientEvent({
                      type: "conversation.item.create",
                      item: {
                        type: "message",
                        role: "system",
                        content: [
                          {
                            type: "input_text",
                            text: `Here is an Unsplash image for "${args.query}": ${data.url}. You can use this image in your next whiteboard update by including in your HTML.`,
                          },
                        ],
                      },
                    });
                  } else {
                    console.error("No Unsplash image found for query", args.query);
                  }
                   // Create a new response to continue the flow
                  sendClientEvent({ type: "response.create" });
                })
                .catch(err => {
                  console.error("Error fetching Unsplash image:", err);
                });
            } else {
              console.error("Missing query argument in search_unsplash_image call");
            }
            break;
          case FUNCTION_NAMES.search:
            if (args.query) {
              handleWebSearch(
                args.query,
                output.call_id,
                sendClientEvent,
              );
            } else {
              console.error("Missing query argument in web_search call");
            }
            break;

          case "search_unsplash_image":
            if (args.query) {
              fetch(`${import.meta.env.VITE_API_URL}/unsplash-image?q=${encodeURIComponent(args.query)}`)
                .then(res => res.json())
                .then(data => {
                  if (data.url) {
                    sendClientEvent({
                      type: "conversation.item.create",
                      item: {
                        type: "message",
                        role: "system",
                        content: [
                          {
                            type: "input_text",
                            text: `Here is an Unsplash image for "${args.query}": ${data.url}. You can use this image in your next whiteboard update by including in your HTML.`,
                          },
                        ],
                      },
                    });
                  } else {
                    console.error("No Unsplash image found for query", args.query);
                  }
                   // Create a new response to continue the flow
                  sendClientEvent({ type: "response.create" });
                })
                .catch(err => {
                  console.error("Error fetching Unsplash image:", err);
                });
            } else {
              console.error("Missing query argument in search_unsplash_image call");
            }
            break;

          case FUNCTION_NAMES.search:
            if (args.query) {
              handleWebSearch(args.query, output.call_id, sendClientEvent);
            } else {
              console.error("Missing query argument in web_search call");
            }
            break;
          case "send_email":
            if ((args.to, args.from, args.subject, args.body)) {
              handleSendEmail(
                args,
                whiteboardHtml,
                setWhiteboardHtml,
                sendClientEvent,
              );
            } else {
              console.error("Missing arguments in send_email call");
            }
            break;

          default:
            console.log("Unknown function call:", output.name);
        }
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
  setLastResponseId(response.response.id);
  setIsResponseComplete(true);
}
