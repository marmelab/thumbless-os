// Whiteboard constants

// Initial HTML for the welcome screen
export const WELCOME_HTML = `<div id="welcome-container" style="text-align:center; margin-top:20px;">
  <h2 id="welcome-title" style="color:#2563eb; margin-bottom:15px;">Welcome to AI Teaching Assistant</h2>
  <p id="welcome-intro" style="font-size:1.1em; margin-bottom:20px;">I'm ready to help you learn any topic with visual explanations.</p>
  <div id="getting-started" style="padding:10px; border:1px dashed #666; display:inline-block; text-align:left;">
    <p id="start-heading"><strong>How to get started:</strong></p>
    <ol id="start-steps" style="margin-top:5px; padding-left:20px;">
      <li id="step-1">Ask me to explain any concept or topic</li>
      <li id="step-2">I'll provide visual elements to illustrate key points</li>
      <li id="step-3">Ask follow-up questions anytime</li>
    </ol>
  </div>
</div>`;

// Function names used in the tool calls
export const FUNCTION_NAMES = {
  write: "write_to_whiteboard",
  update: "update_whiteboard_element",
  add: "add_to_whiteboard",
  search: "web_search",
  calendar: "calendar_request",
};
