import { useCallback, useEffect, useRef, useState } from "react";
import { Settings as SettingsIcon } from "react-feather";
import { Link } from "react-router";
import logo from "/assets/thumbs-up.svg";
import Screen from "./Screen";
import { Debug } from "./debug/Debug";
import { getProfile } from "../profile";
import { declareTools } from "./whiteboard/declareTools";

export default function App() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [events, setEvents] = useState([]);
  const [state, setState] = useState("asking");
  const [dataChannel, setDataChannel] = useState(null);
  const peerConnection = useRef(null);
  const audioElement = useRef(null);
  const [sessionError, setSessionError] = useState(null);
  const [answerStream, setAnswerStream] = useState(null);
  const [questionStream, setQuestionStream] = useState(null);
  const [isMicrophoneActive, setIsMicrophoneActive] = useState(false);

  const sendTextMessage = useRef(() => { });

  useEffect(() => {
    if (!questionStream) {
      return;
    }
    questionStream.getTracks()[0].enabled = isMicrophoneActive;
  }, [questionStream, isMicrophoneActive]);

  const toggleMicrophone = useCallback(() => {
    setIsMicrophoneActive((prev) => !prev);
  }, [setIsMicrophoneActive]);

  const stopSpeaking = useCallback(() => {
    console.log("Stopping speaking...");
    sendClientEvent({
      type: "response.cancel",
    });
    sendClientEvent({
      type: "output_audio_buffer.clear",
    });
  }, [dataChannel]);

  const startSession = useCallback(
    async function startSession() {
      try {
        setSessionError(null);

        if (!import.meta.env.VITE_API_URL) {
          setSessionError(
            "VITE_API_URL environment variable is not set. Please make sure you created a client/.env file.",
          );
          return;
        }

        // Get a session token for OpenAI Realtime API
        const tokenResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/token`,
        );
        const data = await tokenResponse.json();

        if (!data.client_secret || !data.client_secret.value) {
          console.error("Invalid token response:", data);
          setSessionError("Failed to get a valid token. Check your API key.");
          return;
        }

        const EPHEMERAL_KEY = data.client_secret.value;

        // Create a peer connection
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        // Add connection state logging
        pc.oniceconnectionstatechange = () => {
          console.log("ICE connection state:", pc.iceConnectionState);
        };

        pc.onconnectionstatechange = () => {
          console.log("Connection state:", pc.connectionState);
        };

        // Set up to play remote audio from the model
        audioElement.current = document.createElement("audio");
        audioElement.current.autoplay = true;
        pc.ontrack = (e) => {
          audioElement.current.srcObject = e.streams[0];
          setAnswerStream(e.streams[0]);
        };

        // Add local audio track for microphone input in the browser
        try {
          const ms = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          setQuestionStream(ms);
          pc.addTrack(ms.getTracks()[0]);
        } catch (micError) {
          console.error("Microphone access error:", micError);
          setSessionError(
            "Failed to access microphone. Please check permissions.",
          );
          return;
        }

        // Set up data channel for sending and receiving events
        const dc = pc.createDataChannel("oai-events");

        dc.onopen = () => {
          console.log("Data channel opened");
        };

        dc.onerror = (err) => {
          console.error("Data channel error:", err);
        };

        setDataChannel(dc);

        // Start the session using the Session Description Protocol (SDP)
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const baseUrl = "https://api.openai.com/v1/realtime";
        const model = "gpt-4o-mini-realtime-preview";

        // We'll send instructions via session messages later, not as headers
        const sdpResponse = await fetch(
          `${baseUrl}?model=${model}&max_token=100`,
          {
            method: "POST",
            body: offer.sdp,
            headers: {
              Authorization: `Bearer ${EPHEMERAL_KEY}`,
              "Content-Type": "application/sdp",
              "OpenAI-Beta": "assistants=v1", // Opt into the latest API behavior
            },
          },
        );

        if (!sdpResponse.ok) {
          const errorText = await sdpResponse.text();
          console.error("SDP response error:", sdpResponse.status, errorText);
          setSessionError(`API error: ${sdpResponse.status} ${errorText}`);
          return;
        }

        const sdpText = await sdpResponse.text();
        const answer = {
          type: "answer",
          sdp: sdpText,
        };

        await pc.setRemoteDescription(answer);

        peerConnection.current = pc;
      } catch (error) {
        console.error("Session setup error:", error);
        setSessionError(`Failed to start session: ${error.message}`);
      }
    },
    [
      setSessionError,
      setDataChannel,
      setIsSessionActive,
      audioElement,
      peerConnection,
      isSessionActive,
    ],
  );

  // Stop current session, clean up peer connection and data channel
  function stopSession() {
    setState("asking");
    if (dataChannel) {
      dataChannel.close();
    }

    if (!peerConnection.current) {
      return;
    }

    peerConnection.current.getSenders().forEach((sender) => {
      if (sender.track) {
        sender.track.stop();
      }
    });

    if (peerConnection.current) {
      peerConnection.current.close();
    }

    setIsSessionActive(false);
    setDataChannel(null);
    peerConnection.current = null;
    setEvents([]);
  }

  // Send an event to the model
  function sendClientEvent(event) {
    if (dataChannel) {
      event.event_id = event.event_id || crypto.randomUUID();

      // send event before setting timestamp since the backend peer doesn't expect this field
      dataChannel.send(JSON.stringify(event));

      // if guard just in case the timestamp exists by miracle
      if (!event.timestamp) {
        event.timestamp = new Date().toLocaleTimeString();
      }
      setEvents((prev) => [event, ...prev]);
    } else {
      console.error("Failed to send event - no data channel available", event);
    }
  }

  // Send a text message to the model
  sendTextMessage.current = (message) => {
    stopSpeaking();
    const event = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: message,
          },
        ],
      },
    };

    sendClientEvent(event);
    sendClientEvent({ type: "response.create" });
  };

  // Attach event listeners to the data channel when a new one is created
  useEffect(() => {
    if (dataChannel) {
      // Append new server events to the list
      dataChannel.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        switch (event.type) {
          case "conversation.item.created":
            // Ignore this internal message.
            if ((event?.item?.content?.[0]?.text ?? "").startsWith("The user went back to a previous version"))
              break;

            setState('processing');
            break;
          case "output_audio_buffer.started":
            setState("answering");
            break;
          case "output_audio_buffer.stopped":
          case "input_audio_buffer.speech_started":
          case "input_audio_buffer.speech_ended":
          case "output_audio_buffer.clear":
            setState("asking");
            break;
          default:
          // do nothing
        }

        if (
          event.type === "response.done" &&
          event.response &&
          event.response?.status === "failed"
        ) {
          console.error("Data channel error:", event.response.status_details);
        }
        if (!event.timestamp) {
          event.timestamp = new Date().toLocaleTimeString();
        }

        setEvents((prev) => [event, ...prev]);
      });

      // Set session active when the data channel is opened
      dataChannel.addEventListener("open", () => {
        // start by declaring tools
        const profile = getProfile();
        sendClientEvent(declareTools(profile));
        setIsSessionActive(true);
        setEvents([]);
      });
    }

    return () => stopSession();
  }, [dataChannel]);

  useEffect(() => {
    window.userReply = (message) => {
      console.log("User reply:", message);
      // Add userReply in front of the message because too small replies prevent the AI from responding.
      sendTextMessage.current(`userReply: ${message}`);
    };
  }, [sendTextMessage]);

  return (
    <>
      <nav className="absolute top-0 left-0 right-0 flex items-center">
        <div className="flex items-center justify-center gap-2 w-full py-3 px-4 border-0 border-b border-solid border-gray-200">
          <img style={{ width: "24px" }} src={logo} />
          <h1>Thumbless OS</h1>
          <Link to="/settings" className="ml-auto" title="Settings">
            <span className="sr-only">Settings</span>
            <SettingsIcon size={24} />
          </Link>
        </div>
      </nav>
      <main className="absolute top-16 left-0 right-0 bottom-0">
        <Screen
          state={state}
          sendClientEvent={sendClientEvent}
          sendTextMessage={sendTextMessage.current}
          events={events}
          isSessionActive={isSessionActive}
          questionStream={questionStream}
          answerStream={answerStream}
          isMicrophoneActive={isMicrophoneActive}
          toggleMicrophone={toggleMicrophone}
        />
        <Debug
          startSession={startSession}
          stopSession={stopSession}
          sendClientEvent={sendClientEvent}
          sendTextMessage={sendTextMessage.current}
          events={events}
          isSessionActive={isSessionActive}
          sessionError={sessionError}
          stopSpeaking={stopSpeaking}
          state={state}
        />
      </main>
    </>
  );
}
