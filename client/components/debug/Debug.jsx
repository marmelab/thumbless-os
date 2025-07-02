import { VolumeX } from "react-feather";
import Button from "../Button";
import EventLog from "./EventLog";
import SessionControls from "./SessionControls";

export function Debug({
  startSession,
  stopSession,
  sendClientEvent,
  sendTextMessage,
  events,
  isSessionActive,
  sessionError,
  stopSpeaking,
  state,
}) {
  return (
    <section className="absolute top-0 w-[380px] right-0 bottom-0 flex flex-col">
      <section className="absolute h-18 left-0 right-0 top-0 pb-4">
        <SessionControls
          startSession={startSession}
          stopSession={stopSession}
          sendClientEvent={sendClientEvent}
          sendTextMessage={sendTextMessage}
          events={events}
          isSessionActive={isSessionActive}
          sessionError={sessionError}
        />
      </section>
      <section className="absolute top-14 left-0 right-0 bottom-4 px-4 overflow-y-auto">
        <EventLog events={events} />
      </section>
      <section
        className={`absolute h-18 left-0 right-0 bottom-0 pt-4 ${state === "answering" ? "flex" : "hidden"} flex-col items-center w-full`}
      >
        <Button
          className="cursor-pointer gap-3"
          type="button"
          onClick={stopSpeaking}
        >
          <VolumeX />
          Stop speaking
        </Button>
      </section>
    </section>
  );
}
