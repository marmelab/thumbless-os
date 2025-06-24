// Whiteboard constants

// Initial HTML for the welcome screen
export const WELCOME_HTML = `
  <h2>Welcome to AI Teaching Assistant</h2>
  <p id="welcome-intro">I'm ready to help you learn any topic with visual explanations.</p>
  <div id="getting-started">
    <p id="start-heading"><strong>How to get started:</strong></p>
    <ul id="start-steps">
      <li id="step-1">Ask me to explain any concept or topic</li>
      <li id="step-2">I'll provide visual elements to illustrate key points</li>
      <li id="step-3">Ask follow-up questions anytime</li>
    </ul>
  </div>
`;

// Function names used in the tool calls
export const FUNCTION_NAMES = {
  write: "write_to_whiteboard",
  update: "update_whiteboard_element",
  add: "add_to_whiteboard",
};
