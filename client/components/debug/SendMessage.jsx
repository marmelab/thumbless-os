import { useState } from "react";
import { MessageSquare } from "react-feather";
import Button from "../Button";

export function SendMessage({ sendTextMessage }) {
  const [message, setMessage] = useState("");

  function handleSendClientEvent() {
    sendTextMessage(message);
    setMessage("");
  }

  return (
    <div className="flex items-center w-full gap-4">
      <input
        onKeyDown={(e) => {
          if (e.key === "Enter" && message.trim()) {
            handleSendClientEvent();
          }
        }}
        type="text"
        placeholder="Ask any question or type a topic to learn about..."
        className="border border-gray-200 rounded-full p-3 flex-1 bg-white"
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
        variant="outline"
      >
        Send
      </Button>
    </div>

  );
}
