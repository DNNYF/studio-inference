# Chat Studio - Your Local LLM Playground

This is a Next.js application designed to be a "Chat Studio," allowing you to interact with local Large Language Models (LLMs) through an intuitive chat interface. It's built with modern web technologies to provide a smooth and responsive user experience.

## Features

*   **Chat Interface**: Engage in conversations with your configured LLM.
*   **Session Management**:
    *   Create new chat sessions.
    *   View and switch between past conversation sessions.
    *   Delete individual sessions or clear all history.
*   **LM Studio Integration**: Configurable API endpoint to connect to your local LM Studio instance.
*   **Message History**: View past messages within a session.
*   **Export Conversations**: Export all your chat sessions to a JSON file.
*   **Theme Toggle**: Switch between light and dark modes.
*   **Responsive Design**: Works on desktop and mobile devices.
*   **Persistent State**: Chat sessions and API endpoint settings are saved in your browser's local storage.

## Tech Stack

*   **Next.js**: React framework for server-side rendering and static site generation.
*   **React**: JavaScript library for building user interfaces.
*   **TypeScript**: Superset of JavaScript for type safety.
*   **Tailwind CSS**: Utility-first CSS framework for styling.
*   **ShadCN UI**: Re-usable UI components built with Radix UI and Tailwind CSS.
*   **Lucide React**: Icon library.
*   **Geist**: Font family for Vercel-like aesthetics.
*   **Genkit (Firebase AI)**: For integrating AI capabilities (though current chat functionality uses a direct API call to LM Studio).
*   **date-fns**: For date formatting.
*   **uuid**: For generating unique IDs.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will typically be available at `http://localhost:9002`.

4.  **Configure LM Studio:**
    *   Ensure LM Studio is running and its API server is active (usually at `http://localhost:1234/v1`).
    *   In the Chat Studio app, click the Settings (gear) icon in the sidebar.
    *   Verify or update the API URL to match your LM Studio endpoint. The default is `http://localhost:1234/v1/chat/completions`.

## Building for Production

To build the application for production:
```bash
npm run build
```
Then, to start the production server:
```bash
npm run start
```

## Scripts

*   `dev`: Starts the Next.js development server with Turbopack on port 9002.
*   `genkit:dev`: Starts Genkit in development mode.
*   `genkit:watch`: Starts Genkit in development mode with file watching.
*   `build`: Builds the Next.js application for production.
*   `start`: Starts the Next.js production server.
*   `lint`: Runs Next.js's built-in ESLint checks.
*   `typecheck`: Runs TypeScript type checking.

## Project Structure

*   `src/app/`: Main application pages and layout (using Next.js App Router).
*   `src/components/`: Reusable React components, including UI components from ShadCN.
*   `src/hooks/`: Custom React hooks.
*   `src/lib/`: Utility functions and type definitions.
*   `src/ai/`: Genkit related AI flows and configuration (if used).
*   `public/`: Static assets.

---

This project was initialized in Firebase Studio.
