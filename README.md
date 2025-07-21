# Thumbless OS

Proof-of-concept for a realtime voice-based mobile OS using the [OpenAI Realtime API](https://platform.openai.com/docs/guides/realtime) with [WebRTC](https://platform.openai.com/docs/guides/realtime-webrtc). It generates the user interface on-the-fly, depending on the task performed by the end user. 

<img width="960" height="584" alt="image" src="https://github.com/user-attachments/assets/4d7c9ef3-b868-4ad5-be6b-d22d6e6dd45a" />

## Installation and usage

Before you begin, you'll need to initialize two `.env` files, one for the SPA and another for the server. You'll also need an OpenAI API key - [create one in the dashboard here](https://platform.openai.com/settings/api-keys):

```bash
# SPA env file
cp ./client/.env.example ./client/.env
# Server env file. Paste your OpenAI API key in it
cp .env.example .env
```

If you want thumbless-os be able to show images, please configure your unsplash access key `UNSPLASH_ACCESS_KEY` in the `.env`file [create your account here](https://unsplash.com/fr). 

Running this application locally requires [Node.js](https://nodejs.org/) to be installed. Install dependencies for the application with:

```bash
npm install
```

Start the application server with:

```bash
npm run dev
```

The web application is accessible on [http://localhost:3000](http://localhost:3000).

## Architecture

This application uses [express](https://expressjs.com/) to serve the React frontend contained in the [`/client`](./client) folder. The server is configured to use [vite](https://vitejs.dev/) to build the React frontend.

## License

MIT
