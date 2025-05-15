import { useEffect, useState, useRef } from "react";

// Detailed instructions for the AI about using the whiteboard
const aiWhiteboardInstructions = `
You are an AI Teaching Assistant explaining concepts to a student. Use the whiteboard to help illustrate your explanations.

CONVERSATION FLOW:
- IMPORTANT: DO NOT speak or write until the user asks a question or specifies a topic first
- Wait for the user to initiate the conversation with a learning request
- Once the user has spoken, respond using both voice and whiteboard together

FOLLOW THESE GUIDELINES FOR A SMOOTH TEACHING EXPERIENCE:

1. When explaining concepts, ALWAYS use the whiteboard tools to support your explanation:
   - Use write_to_whiteboard for the initial content or complete rewrites
   - Use add_to_whiteboard to build upon existing content incrementally 
   - Use clear_whiteboard only when changing to an entirely new topic

2. Structure your whiteboard content with semantic HTML:
   - Use headings (<h1>, <h2>, etc.) for clear section breaks
   - Use lists (<ul>, <ol>) for steps or bullet points
   - Use tables for comparing items or showing structured data
   - Use <div> with inline CSS for visual organization
   - Use <hr> to separate sections

3. Always complete your thoughts and explanations:
   - After writing to the whiteboard, verbally explain what you've written
   - When adding to the whiteboard, connect new content to what's already there
   - Use color and emphasis for important points (use inline CSS sparingly)

4. Create simple diagrams with ASCII art or HTML/CSS when explaining visual concepts

5. Keep content organized - don't overload the whiteboard, add content progressively
   as you explain each part of the concept.

Examples of good HTML:
<h2 style="color:#2563eb">Main Concept</h2>
<ul>
  <li><strong>Key Point 1:</strong> Explanation...</li>
  <li><strong>Key Point 2:</strong> Explanation...</li>
</ul>
<hr>
<div style="margin:10px 0">Additional information here...</div>
`;

// Function to create session update with DOM manipulation tools
function createSessionUpdate(whiteboardHtml) {
  return {
    type: "session.update",
    session: {
      tools: [
        {
          type: "function",
          name: "write_to_whiteboard",
          description: "Replace the current whiteboard content with new HTML content.",
          parameters: {
            type: "object",
            properties: {
              html: {
                type: "string",
                description: "HTML content to display on the whiteboard. Use semantic HTML tags for structure.",
              },
            },
            required: ["html"],
          },
        },
        {
          type: "function",
          name: "add_to_whiteboard",
          description: "Append HTML content to the current whiteboard.",
          parameters: {
            type: "object",
            properties: {
              html: {
                type: "string",
                description: "HTML content to append to the whiteboard.",
              },
            },
            required: ["html"],
          },
        },
        {
          type: "function",
          name: "clear_whiteboard",
          description: "Clear all content from the whiteboard.",
          parameters: {
            type: "object",
            properties: {},
          },
        }
      ],
      tool_choice: "auto",
      instructions: aiWhiteboardInstructions,
    },
  };
}

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

function WhiteboardOutput({ whiteboardHtml, isLoading }) {
  const isWelcomeScreen = whiteboardHtml.includes("Welcome to AI Teaching Assistant");
  
  return (
    <div className="relative w-full h-full">
      <div 
        className={`w-full h-full bg-white rounded-md p-4 overflow-y-auto border-2 ${
          isLoading ? 'border-blue-400 pulse-border' : 
          (isWelcomeScreen ? 'border-green-300' : 'border-gray-300')
        }`}
        dangerouslySetInnerHTML={{ __html: whiteboardHtml }}
      />
      {isLoading ? (
        <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
          Writing...
        </div>
      ) : isWelcomeScreen ? (
        <div className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full animate-pulse">
          Waiting for your question...
        </div>
      ) : null}
    </div>
  );
}

export default function ToolPanel({
  isSessionActive,
  sendClientEvent,
  events,
}) {
  const [toolsAdded, setToolsAdded] = useState(false);
  const [whiteboardHtml, setWhiteboardHtml] = useState(`<div style="text-align:center; margin-top:20px;">
  <h2 style="color:#2563eb; margin-bottom:15px;">Welcome to AI Teaching Assistant</h2>
  <p style="font-size:1.1em; margin-bottom:20px;">I'm ready to help you learn any topic using this whiteboard.</p>
  <div style="padding:10px; border:1px dashed #666; display:inline-block; text-align:left;">
    <p><strong>How to get started:</strong></p>
    <ol style="margin-top:5px; padding-left:20px;">
      <li>Ask me to explain any concept or topic</li>
      <li>I'll use this whiteboard to illustrate key points</li>
      <li>Ask follow-up questions anytime</li>
    </ol>
  </div>
</div>`);

  // State for tracking response continuation
  const [isResponseComplete, setIsResponseComplete] = useState(true);
  const [lastResponseId, setLastResponseId] = useState(null);
  
  // Monitor events for session creation and tool function calls
  useEffect(() => {
    if (!events || events.length === 0) return;

    // Find the most recent session.created event
    const sessionCreatedEvent = events.find(event => event.type === "session.created");
    
    if (sessionCreatedEvent && !toolsAdded) {
      console.log("Session created, registering tools...");
      // Register tools with a slight delay to ensure session is fully established
      setTimeout(() => {
        // First, register the tools
        sendClientEvent(createSessionUpdate(whiteboardHtml));
        setToolsAdded(true);
        console.log("Tools registered with session");
        
        // Send instructions as a system message to ensure the assistant behaves correctly
        setTimeout(() => {
          // First update the session instructions
          sendClientEvent({
            type: "session.update",
            session: {
              instructions: `You are an AI Teaching Assistant who explains concepts using both voice and a whiteboard.
              
CRITICAL: DO NOT SPEAK FIRST! Wait for the user to ask a question or specify a topic before you begin teaching.

TEACHING GUIDELINES (AFTER user has spoken):
- Always use BOTH voice AND whiteboard together harmoniously
- Speak naturally while writing key points on the whiteboard
- First introduce topics verbally, then use the whiteboard to illustrate
- Break complex topics into steps with visual organization
- Verbally reference and explain what you write on the whiteboard
- Use diagrams, bullet points, and visual elements on the whiteboard

WHITEBOARD USAGE:
- Use write_to_whiteboard for initial content or complete rewrites
- Use add_to_whiteboard for building content incrementally
- Use clear_whiteboard only when changing to a new topic entirely`
            }
          });
          
          // Then add an explicit system message for initial silence
          setTimeout(() => {
            sendClientEvent({
              type: "conversation.item.create",
              item: {
                type: "message",
                role: "system",
                content: [
                  {
                    type: "input_text",
                    text: "IMPORTANT: Do not speak until the user asks a question or specifies a topic they want to learn about. Wait silently for user input."
                  }
                ]
              }
            });
            
            console.log("System instructions sent, waiting for user to speak...");
          }, 500);
        }, 1500);
      }, 1000);
    }
    
    // Check for cases where the assistant stopped mid-explanation
    const responseDoneEvents = events.filter(
      event => event.type === "response.done" && 
              event.response?.output && 
              Array.isArray(event.response.output)
    );

    // Track if we have a complete response with function calls
    if (responseDoneEvents.length > 0) {
      const latestResponse = responseDoneEvents[0];
      
      // If we get a response.done but no function call, and we have content on whiteboard,
      // we might need to prompt the AI to continue
      if (latestResponse.response && latestResponse.response.id !== lastResponseId) {
        setLastResponseId(latestResponse.response.id);
        
        // Check if this response had any function calls
        const hasFunctionCalls = latestResponse.response.output.some(output => output.type === "function_call");
        const hasText = latestResponse.response.output.some(output => 
          output.type === "message" && 
          output.content && 
          output.content.some(c => c.type === "text" || c.type === "audio")
        );
        
        // If we have text but no function calls, and there's already teaching content on the whiteboard,
        // we might need to prompt the AI to use the whiteboard
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
                    text: "Continue your explanation by updating the whiteboard to visualize what you're explaining. Make sure to use both your voice and the whiteboard together."
                  }
                ]
              }
            });
            
            // Create a new response to continue the flow
            sendClientEvent({ type: "response.create" });
          }, 1500);
        }
        
        setIsResponseComplete(true);
      }

      // Process function calls
      latestResponse.response.output.forEach((output) => {
        if (output.type === "function_call") {
          console.log("Function call detected:", output.name);
          setIsResponseComplete(false); // Response is ongoing when we see function calls
          
          try {
            const args = JSON.parse(output.arguments);
            
            switch (output.name) {
              case "write_to_whiteboard":
                console.log("Writing to whiteboard:", args.html);
                setWhiteboardHtml(args.html);
                
                // After writing to whiteboard, request AI to continue explanation with a direct response
                setTimeout(() => {
                  sendClientEvent({
                    type: "conversation.item.create",
                    item: {
                      type: "message",
                      role: "system",
                      content: [
                        {
                          type: "input_text",
                          text: "You've updated the whiteboard. Now continue your verbal explanation of what you've written. Speak naturally about the content you've just added to the whiteboard."
                        }
                      ]
                    }
                  });
                  
                  // Create a new response to continue the flow
                  sendClientEvent({ type: "response.create" });
                }, 800);
                break;
                
              case "add_to_whiteboard":
                console.log("Adding to whiteboard:", args.html);
                setWhiteboardHtml(prev => prev + args.html);
                
                // After adding to whiteboard, request AI to continue explanation with a direct response
                setTimeout(() => {
                  sendClientEvent({
                    type: "conversation.item.create",
                    item: {
                      type: "message",
                      role: "system",
                      content: [
                        {
                          type: "input_text",
                          text: "You've added content to the whiteboard. Now verbally explain this new content in detail to help the user understand what you've added."
                        }
                      ]
                    }
                  });
                  
                  // Create a new response to continue the flow
                  sendClientEvent({ type: "response.create" });
                }, 800);
                break;
                
              case "clear_whiteboard":
                console.log("Clearing whiteboard");
                setWhiteboardHtml("");
                
                // After clearing whiteboard, prompt for new content with a direct response
                setTimeout(() => {
                  sendClientEvent({
                    type: "conversation.item.create",
                    item: {
                      type: "message",
                      role: "system",
                      content: [
                        {
                          type: "input_text",
                          text: "You've cleared the whiteboard. Now continue your teaching by first speaking about the topic, then writing a new outline on the whiteboard."
                        }
                      ]
                    }
                  });
                  
                  // Create a new response to continue the flow
                  sendClientEvent({ type: "response.create" });
                }, 500);
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
  }, [events, sendClientEvent]);

  // Reset state when session becomes inactive
  useEffect(() => {
    if (!isSessionActive) {
      setToolsAdded(false);
      setWhiteboardHtml(`<div style="text-align:center; margin-top:20px;">
  <h2 style="color:#2563eb; margin-bottom:15px;">Welcome to AI Teaching Assistant</h2>
  <p style="font-size:1.1em; margin-bottom:20px;">I'm ready to help you learn any topic using this whiteboard.</p>
  <div style="padding:10px; border:1px dashed #666; display:inline-block; text-align:left;">
    <p><strong>How to get started:</strong></p>
    <ol style="margin-top:5px; padding-left:20px;">
      <li>Ask me to explain any concept or topic</li>
      <li>I'll use this whiteboard to illustrate key points</li>
      <li>Ask follow-up questions anytime</li>
    </ol>
  </div>
</div>`);
    }
  }, [isSessionActive]);

  // Track if the user has asked a question yet
  const [userHasSpoken, setUserHasSpoken] = useState(false);
  
  // Monitor for user messages
  useEffect(() => {
    if (!events || events.length === 0) return;
    
    // Check for user message events
    const userMessageEvent = events.find(event => 
      event.type === "conversation.item.create" && 
      event.item?.role === "user"
    );
    
    if (userMessageEvent && !userHasSpoken) {
      console.log("User has spoken, enabling AI response");
      setUserHasSpoken(true);
      
      // After the user speaks, send a follow-up instruction to reinforce the speaking pattern
      // Instead of using session.update with meta, use response.create with instructions
      setTimeout(() => {
        sendClientEvent({
          type: "response.create",
          response: {
            instructions: "The user has now asked a question. Please respond to their question using both your voice and the whiteboard. First introduce the topic verbally, then use the whiteboard to illustrate key points."
          }
        });
      }, 500);
    }
  }, [events, userHasSpoken, sendClientEvent]);
  
  // Store previous whiteboard HTML to avoid unnecessary updates
  const prevWhiteboardHtmlRef = useRef(whiteboardHtml);
  
  // Add an effect to update the whiteboard state when it changes
  useEffect(() => {
    // Only update if the whiteboard content has actually changed
    if (isSessionActive && toolsAdded && whiteboardHtml !== prevWhiteboardHtmlRef.current) {
      prevWhiteboardHtmlRef.current = whiteboardHtml;
      
      // We don't need to update the model with the whiteboard state via session.update
      // The model doesn't need to track this, and session.meta is not supported
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
