import EventLog from "./EventLog";
import SessionControls from "./SessionControls";
import { SendMessage } from "./SendMessage";

export function Debug({
    startSession,
    stopSession,
    sendClientEvent,
    sendTextMessage,
    events,
    isSessionActive,
    sessionError
}) {
    return (
        <section className="absolute top-0 w-[420px] right-0 bottom-0 flex flex-col">
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
        </section>
    );
}
