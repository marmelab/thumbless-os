// Whiteboard constants

// Initial HTML for the welcome screen
export const WELCOME_HTML = `<div id="welcome-container">
  <h2 id="welcome-title" class="text-xl font-semibold mt-1 mb-12">Welcome to Thumbless OS</h2>
  <p id="instructions" class="leading-8 mb-12">
  Ask me about any concept or topic,
  and I'll provide visual elements to illustrate key points.<br />
  Ask follow-up questions anytime.
  </p>
  <p id="examples" class="leading-8">Example conversation starters:
    <ul class="list-disc pl-6">
      <li><a href="#" class="underline" onclick="userReply('Explain the concept of gravity')">Can you explain the concept of gravity?</a></li>
      <li><a href="#" class="underline" onclick="userReply('What dog breed would you recommend for a family?')">What dog breed would you recommend for a family?</a></li>
      <li><a href="#" class="underline" onclick="userReply('What s the weather like today in Nancy, France?')">What's the weather like today in Nancy, France?</a></li>
    </ul>
  </p>
</div>`;

// Function names used in the tool calls
export const FUNCTION_NAMES = {
  write: "write_to_whiteboard",
  update: "update_whiteboard_element",
  add: "add_to_whiteboard",
  image: "search_unsplash_image",
  search: "web_search",
};
