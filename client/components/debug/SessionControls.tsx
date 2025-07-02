import React, { useState } from "react";
import { CloudLightning, CloudOff } from "react-feather";
import Button from "../Button";

function SessionStopped({ startSession, sessionError }) {
  const [isActivating, setIsActivating] = useState(false);

  function handleStartSession() {
    if (isActivating) return;

    setIsActivating(true);
    startSession().catch(() => {
      // Reset activation state if there's an error
      setTimeout(() => setIsActivating(false), 1000);
    });
  }

  return (
    <>
      <Button
        onClick={handleStartSession}
        className={isActivating ? "bg-gray-600" : "bg-red-600"}
        icon={<CloudLightning height={16} />}
      >
        {isActivating ? "starting session..." : "start session"}
      </Button>

      {sessionError && (
        <div className="text-red-500 text-sm mt-2 max-w-md text-center">
          {sessionError}
        </div>
      )}
    </>
  );
}

function SessionActive({ stopSession }) {
  return (
    <Button onClick={stopSession} icon={<CloudOff height={16} />}>
      disconnect
    </Button>
  );
}

export default function SessionControls({
  startSession,
  stopSession,
  isSessionActive,
  sessionError,
}) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-2">
      {isSessionActive ? (
        <SessionActive stopSession={stopSession} />
      ) : (
        <SessionStopped
          startSession={startSession}
          sessionError={sessionError}
        />
      )}
    </div>
  );
}
