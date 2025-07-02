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

// Handle draw_svg_diagram function call
export function handleDrawSvgDiagram(
  args,
  whiteboardHtml,
  setWhiteboardHtml,
  sendClientEvent,
) {
  console.log("Drawing SVG diagram");

  let newWhiteboardHTML = whiteboardHtml;

  // Wrap the SVG in a container with optional caption
  const svgContainer = `
    <div class="svg-diagram-container ${args.elementId ? `id="${args.elementId}"` : ''}" style="
      width: 100%; 
      max-width: 100%; 
      margin: 20px 0; 
      padding: 16px; 
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); 
      border-radius: 12px; 
      border: 1px solid #e2e8f0; 
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      overflow: hidden;
    ">
      <div style="width: 100%; height: auto; display: flex; justify-content: center; align-items: center;">
        ${args.svg.replace(/<svg([^>]*)>/, '<svg$1 style="width: 100%; height: auto; max-width: 100%; display: block;">')}
      </div>
      ${args.caption ? `<p style="margin-top: 12px; margin-bottom: 0; font-style: italic; color: #64748b; text-align: center; font-size: 14px;">${args.caption}</p>` : ''}
    </div>
  `;

  if (args.elementId) {
    // If elementId is provided, try to replace existing element
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = whiteboardHtml;
    const targetElement = tempDiv.querySelector(`#${args.elementId}`);

    if (targetElement) {
      // Replace existing element
      targetElement.outerHTML = svgContainer;
      newWhiteboardHTML = tempDiv.innerHTML;
      console.log(`SVG diagram replaced element #${args.elementId}`);
    } else {
      // Element doesn't exist, append new diagram
      newWhiteboardHTML = whiteboardHtml + svgContainer;
      console.log(`SVG diagram created with ID #${args.elementId}`);
    }
  } else {
    // No elementId provided, append to existing content
    newWhiteboardHTML = whiteboardHtml + svgContainer;
  }

  setWhiteboardHtml(newWhiteboardHTML);

  // Continue explanation naturally
  sendSystemMessageAndResponse(
    sendClientEvent,
    `Continue your explanation if needed. Do not describe the diagram that you created.
    You can also update the whiteboard to support your response. Here is the whiteboard by the way:
    ${newWhiteboardHTML}`,
  );
}
