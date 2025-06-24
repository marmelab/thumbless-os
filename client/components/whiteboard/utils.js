export function sendSystemMessageAndResponse(sendClientEvent, message) {
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
    `Continue your explanation naturally, referring to the visual elements you've just created. Explain these concepts in detail, but NEVER mention the whiteboard itself. You can also use the whiteboard to create new visual elements as you explain. Here is the whiteboard by the way:
    ${args.html}
    `,
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
  let newWhiteboardHTML = whiteboardHtml;

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
      newWhiteboardHTML = tempDiv.innerHTML;
      console.log(`Element #${args.elementId} updated successfully`);
    } else if (args.createIfNotExist) {
      // If element doesn't exist and createIfNotExist is true, append new element
      const newContent = `<div id="${args.elementId}">${args.html}</div>`;
      newWhiteboardHTML = whiteboardHtml + newContent;
      console.log(`Element #${args.elementId} created and appended`);
    } else {
      console.warn(`Element with ID ${args.elementId} not found`);
    }
  }
  setWhiteboardHtml(newWhiteboardHTML);

  // Continue explanation naturally
  sendSystemMessageAndResponse(
    sendClientEvent,
    `Continue your explanation naturally, referring to the updated visual elements. Focus on the concepts and explain what these visuals represent without explicitly mentioning that they're on a whiteboard.
     You can also update the whiteboard to support your response. Here is the whiteboard by the way:
    ${newWhiteboardHTML}`,
  );
}

// Handle add_to_whiteboard function call
export function handleAddToWhiteboard(
  args,
  whiteboardHtml,
  setWhiteboardHtml,
  sendClientEvent,
) {
  console.log("Adding additional visual content");
  setWhiteboardHtml(whiteboardHtml + args.html);

  // Continue explanation naturally
  sendSystemMessageAndResponse(
    sendClientEvent,
    `Continue your explanation by elaborating on the new visual elements you've just added. Refer to them naturally in your teaching without mentioning that they're on a whiteboard.
    You can also update the whiteboard to support your response. Here is the whiteboard by the way:
    ${whiteboardHtml + args.html}`,
  );
}

// Handle sending an email function call
export async function handleSendEmail(
  args,
  whiteboardHtml,
  setWhiteboardHtml,
  sendClientEvent,
) {
  console.log("Sending email:", args);

  const emailResult = await fetch("/email", {
    method: "POST",
    body: JSON.stringify(args),
    headers: {
      "Content-Type": "application/json",
    },
  });

  console.log(await emailResult.json());

  handleAddToWhiteboard(
    {
      html: `
      <p>Email envoyé à ${args.to} par ${args.from} avec le sujet "${args.subject}". 
      <br/>
      <span>${args.body}</span></p>
      `,
    },
    whiteboardHtml,
    setWhiteboardHtml,
    sendClientEvent,
  );
}
