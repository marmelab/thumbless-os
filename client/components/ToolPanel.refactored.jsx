import { useEffect, useState, useRef } from 'react';

// ----- Constants -----

// Detailed instructions for the AI about using the whiteboard
const AI_WHITEBOARD_INSTRUCTIONS = `
You are an AI Teaching Assistant explaining concepts to a student. Seamlessly integrate visual elements as you teach.

CONVERSATION FLOW:
- IMPORTANT: DO NOT speak or write until the user asks a question or specifies a topic first
- Wait for the user to initiate the conversation with a learning request
- Once the user has spoken, respond using both voice and visuals together

TEACHING GUIDELINES FOR SEAMLESS EXPLANATION:

1. Integrate visual elements NATURALLY in your teaching:
   - Use write_to_whiteboard when introducing new topics or for complete visual overhauls
   - Use update_whiteboard_element to modify specific sections as your explanation evolves
   - Use add_to_whiteboard to build content incrementally as you teach
   - Use clear_whiteboard only when shifting to an entirely new topic

2. Structure your visual content with semantic HTML using IDs for sections:
   - Use id attributes for all major elements (e.g., <div id="intro">, <section id="steps">, etc.)
   - Use headings (<h1 id="main-title">, <h2 id="subtopic">, etc.) for clear section breaks
   - Create organized lists (<ul id="key-points">, <ol id="procedure">) for steps or points
   - Use tables for comparing items or showing structured data
   - Use <div> with consistent styling for visual organization

3. NEVER explicitly mention the whiteboard:
   - Instead of "Let me show you on the whiteboard", just say "Let's look at..." or "Here's how..."
   - Never say "I'll write this down" or "Let me draw this" - just seamlessly integrate visuals
   - Speak as if the visual content is naturally appearing alongside your explanation
   - Treat the visual elements as an extension of your teaching, not a separate tool

4. Create well-structured content with IDs for easy updating:
   - Always assign semantic IDs to sections (id="introduction", id="example-1", etc.)
   - Use consistent IDs like "main-concept", "definition", "examples", "steps", "summary"
   - This allows you to target and update specific sections later
   - Include proper HTML structure with sections, divs, and semantic elements

5. Use effective visual organization techniques:
   - Create visual hierarchy with headings, colors, and spacing
   - Use color minimally for emphasis (blue for titles, subtle colors for highlights)
   - Add borders, backgrounds, or subtle styling for section separation

Examples of good HTML:
<h2 style="color:#2563eb">Main Concept</h2>
<ul>
  <li><strong>Key Point 1:</strong> Explanation...</li>
  <li><strong>Key Point 2:</strong> Explanation...</li>
</ul>
<hr>
<div style="margin:10px 0">Additional information here...</div>
`;

// Session instructions for proper AI behavior
const SESSION_INSTRUCTIONS = `You are an AI Teaching Assistant who explains concepts with a seamless integration of voice and visual elements.
              
CRITICAL: DO NOT SPEAK FIRST! Wait for the user to ask a question or specify a topic before you begin teaching.

TEACHING APPROACH:
- Begin with a brief verbal introduction to the topic
- Create visual elements with structured organization to support your teaching
- NEVER explicitly mention "the whiteboard" - treat visuals as a natural part of your explanation
- Instead of "Let me show you on the whiteboard", just say "Let's look at this diagram" or "Here's how it works"
- Refer to visual elements naturally as you explain concepts

TECHNICAL IMPLEMENTATION:
- Use semantic HTML with IDs for all major elements
- Structure your content with sections like <div id="introduction">, <div id="key-points">, etc.
- Use consistent IDs like "main-concept", "definition", "examples", "steps", "summary"
- Assign IDs to all major elements (e.g., <h2 id="subtopic">, <ul id="properties">)
- This enables targeted updates to specific sections later

VISUAL ELEMENT USAGE:
- Use write_to_whiteboard for initial content or major changes
- Use update_whiteboard_element to modify specific sections by their ID
- Use add_to_whiteboard to append new content as you teach
- Use clear_whiteboard only when changing to an entirely new topic`;

// Initial system message for AI
const SYSTEM_INSTRUCTIONS = `IMPORTANT GUIDELINES:

1. Do not speak until the user asks a question or specifies a topic

2. Never explicitly mention 'the whiteboard' in your responses

3. When creating content, always use HTML elements with proper ID attributes (e.g., <div id="concept">, <h2 id="main-title">)

4. Use update_whiteboard_element to modify specific sections by their IDs

5. Treat visual elements as a natural extension of your teaching`;

// Initial whiteboard HTML for welcome screen
const WELCOME_HTML = `<div id="welcome-container" style="text-align:center; margin-top:20px;">
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

// System message templates
const SYSTEM_MESSAGES = {
  continueExplanation: "Continue your explanation naturally, referring to the visual elements you've just created. Explain these concepts in detail, but NEVER mention the whiteboard itself.",
  
  updateReference: "Continue your explanation naturally, referring to the updated visual elements. Focus on the concepts and explain what these visuals represent without explicitly mentioning that they're on a whiteboard.",
  
  elaborateNew: "Continue your explanation by elaborating on the new visual elements you've just added. Refer to them naturally in your teaching without mentioning that they're on a whiteboard.",
  
  newTopic: "Now introduce the new topic verbally first, then create visual elements to support your explanation. Remember to never explicitly mention that you're using a whiteboard.",
  
  promptUpdate: "As you continue explaining, update the visual elements to match what you're discussing. Use the update_whiteboard_element tool to modify specific sections or add new visual components that help illustrate your points. Remember to never explicitly mention that you're using a whiteboard.",
  
  userSpoken: "The user has now asked a question. Please respond to their question with a natural teaching style that integrates visual elements seamlessly. Begin by introducing the topic verbally, then create visual elements to support your explanation. Never explicitly mention the whiteboard - just naturally refer to the visuals as part of your teaching."
};

// Function names for tool calls
const FUNCTION_NAMES = {
  write: "write_to_whiteboard",
  update: "update_whiteboard_element",
  add: "add_to_whiteboard",
  clear: "clear_whiteboard"
};

// ----- Utility Functions -----

// Function to create session update with DOM manipulation tools
function createSessionUpdate(instructions) {
  return {
    type: "session.update",
    session: {
      tools: [
        {
          type: "function",
          name: FUNCTION_NAMES.write,
          description: "Replace the entire visual content with new HTML. Use this for initial content or complete overhauls. Always include semantic IDs for all major elements.",
          parameters: {
            type: "object",
            properties: {
              html: {
                type: "string",
                description: "HTML content to display. Use semantic HTML tags and include IDs for all major elements (e.g., <div id=\"intro\">, <h2 id=\"main-concept\">, etc.)",
              },
            },
            required: ["html"],
          },
        },
        {
          type: "function",
          name: FUNCTION_NAMES.update,
          description: "Update a specific element on the whiteboard by its ID. Use this to modify specific sections rather than the entire content.",
          parameters: {
            type: "object",
            properties: {
              elementId: {
                type: "string",
                description: "ID of the HTML element to update (e.g., \"introduction\", \"main-concept\", \"examples\", etc.)"
              },
              html: {
                type: "string",
                description: "New HTML content to replace within the selected element. Can include nested elements with their own IDs."
              },
              createIfNotExist: {
                type: "boolean",
                description: "If true and the element doesn't exist, the content will be appended to the whiteboard with the given ID."
              }
            },
            required: ["elementId", "html"],
          },
        },
        {
          type: "function",
          name: FUNCTION_NAMES.add,
          description: "Append HTML content to the current visuals. Use this to add new sections as your explanation progresses.",
          parameters: {
            type: "object",
            properties: {
              html: {
                type: "string",
                description: "HTML content to append. Always include IDs for new major elements to allow future updates.",
              },
            },
            required: ["html"],
          },
        },
        {
          type: "function",
          name: FUNCTION_NAMES.clear,
          description: "Clear all visual content. Use this only when changing to a completely new topic.",
          parameters: {
            type: "object",
            properties: {},
          },
        }
      ],
      tool_choice: "auto",
      instructions: instructions,
    },
  };
}

// Send a system message and trigger a response
function sendSystemMessageAndResponse(sendClientEvent, message, delay = 800) {
  setTimeout(() => {
    sendClientEvent({
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "system",
        content: [
          {
            type: "input_text",
            text: message
          }
        ]
      }
    });
    
    // Create a new response to continue the flow
    sendClientEvent({ type: "response.create" });
  }, delay);
}

// Handle write_to_whiteboard function call
function handleWriteToWhiteboard(args, setWhiteboardHtml, sendClientEvent) {
  console.log("Writing new visual content:", args.html);
  setWhiteboardHtml(args.html);
  
  // Continue explanation naturally without mentioning the whiteboard
  sendSystemMessageAndResponse(sendClientEvent, SYSTEM_MESSAGES.continueExplanation);
}

// Handle update_whiteboard_element function call
function handleUpdateWhiteboardElement(args, whiteboardHtml, setWhiteboardHtml, sendClientEvent) {
  console.log("Updating specific element:", args.elementId);
  
  if (!args.elementId) return;
  
  // Create a temporary DOM element to parse and manipulate the HTML
  const tempDiv = document.createElement('div');
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
    setWhiteboardHtml(prev => prev + newContent);
    console.log(`Element #${args.elementId} created and appended`);
  } else {
    console.warn(`Element with ID ${args.elementId} not found`);
  }
  
  // Continue explanation naturally
  sendSystemMessageAndResponse(sendClientEvent, SYSTEM_MESSAGES.updateReference);
}

// Handle add_to_whiteboard function call
function handleAddToWhiteboard(args, setWhiteboardHtml, sendClientEvent) {
  console.log("Adding additional visual content");
  setWhiteboardHtml(prev => prev + args.html);
  
  // Continue explanation naturally
  sendSystemMessageAndResponse(sendClientEvent, SYSTEM_MESSAGES.elaborateNew);
}

// Handle clear_whiteboard function call
function handleClearWhiteboard(setWhiteboardHtml, sendClientEvent) {
  console.log("Clearing all visual content");
  setWhiteboardHtml("");
  
  // Continue with a new topic
  sendSystemMessageAndResponse(sendClientEvent, SYSTEM_MESSAGES.newTopic, 500);
}

// Initialize session with tools and instructions
function initializeSession(sendClientEvent, setToolsAdded) {
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
          instructions: SESSION_INSTRUCTIONS
        }
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
                text: SYSTEM_INSTRUCTIONS
              }
            ]
          }
        });
        
        console.log("System instructions sent, waiting for user to speak...");
      }, 500);
    }, 1500);
  }, 1000);
}

// Process function calls in a response
function processFunctionCallsInResponse(output, whiteboardHtml, setWhiteboardHtml, sendClientEvent, setIsResponseComplete) {
  if (output.type !== "function_call") return;
  
  console.log("Function call detected:", output.name);
  setIsResponseComplete(false);
  
  try {
    const args = JSON.parse(output.arguments);
    
    switch (output.name) {
      case FUNCTION_NAMES.write:
        handleWriteToWhiteboard(args, setWhiteboardHtml, sendClientEvent);
        break;
        
      case FUNCTION_NAMES.update:
        handleUpdateWhiteboardElement(args, whiteboardHtml, setWhiteboardHtml, sendClientEvent);
        break;
        
      case FUNCTION_NAMES.add:
        handleAddToWhiteboard(args, setWhiteboardHtml, sendClientEvent);
        break;
        
      case FUNCTION_NAMES.clear:
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
function checkNeedForVisualPrompt(hasText, hasFunctionCalls, whiteboardHtml, sendClientEvent) {
  if (hasText && 
      !hasFunctionCalls && 
      !whiteboardHtml.includes("Welcome to AI Teaching Assistant") && 
      whiteboardHtml !== "") {
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
              text: SYSTEM_MESSAGES.promptUpdate
            }
          ]
        }
      });
      
      // Create a new response to continue the flow
      sendClientEvent({ type: "response.create" });
    }, 1500);
  }
}

// Detect when user first speaks and send appropriate instructions
function detectUserFirstMessage(events, userHasSpoken, setUserHasSpoken, sendClientEvent) {
  // Check for user message events
  const userMessageEvent = events.find(event => 
    event.type === "conversation.item.create" && 
    event.item?.role === "user"
  );
  
  if (userMessageEvent && !userHasSpoken) {
    console.log("User has spoken, enabling AI response");
    setUserHasSpoken(true);
    
    // After the user speaks, send a follow-up instruction for a natural teaching response
    setTimeout(() => {
      sendClientEvent({
        type: "response.create",
        response: {
          instructions: SYSTEM_MESSAGES.userSpoken
        }
      });
    }, 500);
  }
}

// ----- Sub-Components -----

// Debug panel to display session and function call events
function DebugPanel({ events, isSessionActive }) {
  // Filter for relevant events
  const sessionEvents = events.filter(event => 
    event.type === 'session.created' || 
    event.type === 'session.update'
  );
  
  const functionCallEvents = events.filter(event => 
    event.type === 'response.done' && 
    event.response?.output?.some(output => output.type === 'function_call')
  );

  return (
    <div className="mt-4 p-2 bg-gray-100 rounded-md text-xs">
      <h3 className="font-bold">Debug Panel</h3>
      
      <div className="mt-2">
        <h4 className="font-semibold">Session Status</h4>
        <p>Session Active: {isSessionActive ? 'Yes' : 'No'}</p>
        <p>Session Events: {sessionEvents.length}</p>
        <p>Function Call Events: {functionCallEvents.length}</p>
      </div>
      
      {sessionEvents.length > 0 && (
        <div className="mt-2">
          <h4 className="font-semibold">Latest Session Event</h4>
          <pre className="mt-1 p-1 bg-gray-200 rounded overflow-x-auto" style={{ maxHeight: '100px' }}>
            {JSON.stringify(sessionEvents[0], null, 2)}
          </pre>
        </div>
      )}
      
      {functionCallEvents.length > 0 && (
        <div className="mt-2">
          <h4 className="font-semibold">Latest Function Call</h4>
          <pre className="mt-1 p-1 bg-gray-200 rounded overflow-x-auto" style={{ maxHeight: '100px' }}>
            {JSON.stringify(functionCallEvents[0].response.output.find(o => o.type === 'function_call'), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// Component to display the whiteboard content
function WhiteboardOutput({ whiteboardHtml, isLoading }) {
  const isWelcomeScreen = whiteboardHtml.includes("Welcome to AI Teaching Assistant");
  const whiteboardRef = useRef(null);
  
  // Add animation class to elements that changed recently
  useEffect(() => {
    if (whiteboardRef.current) {
      // Find all elements without highlight-update class
      const allElements = whiteboardRef.current.querySelectorAll('*:not(.highlight-update)');
      
      // Add the highlight class to newly added or updated elements
      allElements.forEach(el => {
        if (el.id) {
          el.classList.add('highlight-update');
          
          // Remove the class after the animation completes
          setTimeout(() => {
            if (el && el.classList) {
              el.classList.remove('highlight-update');
            }
          }, 2000);
        }
      });
    }
  }, [whiteboardHtml]);
  
  return (
    <div className="relative w-full h-full">
      <div 
        ref={whiteboardRef}
        className={`w-full h-full bg-white rounded-md p-4 overflow-y-auto border-2 ${
          isLoading ? 'border-blue-400 pulse-border' : 
          (isWelcomeScreen ? 'border-green-300' : 'border-gray-300')
        }`}
        dangerouslySetInnerHTML={{ __html: whiteboardHtml }}
      />
      {isLoading ? (
        <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
          Visualizing...
        </div>
      ) : isWelcomeScreen ? (
        <div className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full animate-pulse">
          Waiting for your question...
        </div>
      ) : null}
    </div>
  );
}

// ----- Main Component -----

export default function ToolPanel({
  isSessionActive,
  sendClientEvent,
  events,
}) {
  // State for whiteboard and session management
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
    const sessionCreatedEvent = events.find(event => event.type === "session.created");
    
    if (sessionCreatedEvent && !toolsAdded) {
      console.log("Session created, registering tools...");
      initializeSession(sendClientEvent, setToolsAdded);
    }
  }, [events, toolsAdded, sendClientEvent]);

  // Process function calls and responses
  useEffect(() => {
    if (!events || events.length === 0) return;
    
    // Check for cases where the assistant stopped mid-explanation
    const responseDoneEvents = events.filter(
      event => event.type === "response.done" && 
              event.response?.output && 
              Array.isArray(event.response.output)
    );

    // Track if we have a complete response with function calls
    if (responseDoneEvents.length > 0) {
      const latestResponse = responseDoneEvents[0];
      
      if (latestResponse.response && latestResponse.response.id !== lastResponseId) {
        setLastResponseId(latestResponse.response.id);
        
        // Check if this response had any function calls
        const hasFunctionCalls = latestResponse.response.output.some(
          output => output.type === "function_call"
        );
        
        const hasText = latestResponse.response.output.some(
          output => output.type === "message" && 
          output.content && 
          output.content.some(c => c.type === "text" || c.type === "audio")
        );
        
        // If we have text but no function calls, and there are already visual elements,
        // we might need to prompt the AI to update the visuals
        checkNeedForVisualPrompt(
          hasText, 
          hasFunctionCalls, 
          whiteboardHtml, 
          sendClientEvent
        );
        
        setIsResponseComplete(true);
      }

      // Process function calls
      latestResponse.response.output.forEach((output) => {
        if (output.type === "function_call") {
          processFunctionCallsInResponse(
            output, 
            whiteboardHtml, 
            setWhiteboardHtml, 
            sendClientEvent,
            setIsResponseComplete
          );
        }
      });
    }
  }, [events, lastResponseId, whiteboardHtml, sendClientEvent]);
  
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
    
    detectUserFirstMessage(events, userHasSpoken, setUserHasSpoken, sendClientEvent);
  }, [events, userHasSpoken, sendClientEvent]);
  
  // Avoid unnecessary updates by checking if whiteboard content has changed
  useEffect(() => {
    if (isSessionActive && toolsAdded && whiteboardHtml !== prevWhiteboardHtmlRef.current) {
      prevWhiteboardHtmlRef.current = whiteboardHtml;
      console.log("Whiteboard content changed, but no need to send session update");
    }
  }, [whiteboardHtml, isSessionActive, toolsAdded]);

  return (
    <section className="h-full w-full flex flex-col gap-4">
      <div className="h-full flex flex-col">
        <h2 className="text-lg font-bold mb-2">AI Whiteboard</h2>
        <div className="flex-1 bg-white rounded-md">
          {isSessionActive ? (
            <WhiteboardOutput 
              whiteboardHtml={whiteboardHtml} 
              isLoading={!isResponseComplete}
            />
          ) : (
            <div className="h-full bg-gray-50 rounded-md p-4 flex items-center justify-center">
              <p>Start the session to use the whiteboard...</p>
            </div>
          )}
        </div>
        <DebugPanel events={events} isSessionActive={isSessionActive} />
      </div>
    </section>
  );
}
