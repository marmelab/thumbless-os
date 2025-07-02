import { useState } from "react";
import { MessageSquare } from "react-feather";
import Button from "../Button";
import InputPrompt from "./InputPrompt";

export function SendMessage({ sendTextMessage, stopSpeaking }) {
  const [message, setMessage] = useState("");

  function handleSendClientEvent() {
    stopSpeaking();
    sendTextMessage(message);
    setMessage("");
  }

  return (
    <div className="flex items-center w-full gap-4">
      <InputPrompt isSessionActive={true} />
      <input
        onKeyDown={(e) => {
          if (e.key === "Enter" && message.trim()) {
            handleSendClientEvent();
          }
        }}
        type="text"
        placeholder="Ask any question or type a topic to learn about..."
        className="border border-gray-200 rounded-full p-3 flex-1 bg-white shadow-2xl"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button
        onClick={() => {
          if (message.trim()) {
            handleSendClientEvent();
          }
        }}
        icon={<MessageSquare height={16} />}
        className="bg-blue-400 cursor-pointer"
      >
        Send
      </Button>
    </div>

  );
}
