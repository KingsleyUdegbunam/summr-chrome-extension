# 🧠 Summr — AI Article Summarizer

Summr is a browser extension that transforms long-form articles into clean, structured summaries using an AI-powered backend. It helps users quickly extract key insights, reduce reading time, and improve information consumption efficiency.

---

## 🚀 Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/KingsleyUdegbunam/summr-chrome-extension.git
cd summr
```

### 2\. Install dependencies

```
npm install
```

### 3\. Build the extension

Since Summr runs as a Chrome extension, you must build it before loading:

```
npm run build
```

### 4\. Load into Chrome (Developer Mode)

1.  Open Chrome and go to:

    ```
    chrome://extensions/
    ```

2.  Enable **Developer Mode** (top right corner)
3.  Click **Load unpacked**
4.  Select the `dist/` or `build/` folder generated from the build step
5.  Pin the extension to your toolbar

* * * * *

🧱 Architecture Explanation
---------------------------

Summr follows a **client-extension + backend API architecture**:

### 1\. Chrome Extension (Frontend)

-   Captures article content from the active tab
-   Sends extracted text to the backend API
-   Renders structured AI-generated summaries
-   Provides caching via `chrome.storage` to avoid repeat requests

### 2\. Backend Server

-   Receives article text from the extension
-   Cleans and preprocesses content
-   Sends structured prompt to the AI model
-   Returns formatted summary response

### 3\. Data Flow

```
User → Chrome Extension → Backend API → AI Model → Backend → Extension UI
```

* * * * *

🤖 AI Integration Explanation
-----------------------------

Summr uses a Large Language Model (LLM) through a connected backend service to generate summaries.

### Workflow:

1.  The extension extracts readable article text from the active page
2.  The backend receives this text and constructs a structured prompt
3.  The prompt instructs the model to return:

-   Bullet-point summary
-   Key insight
-   Estimated reading time

### Example Prompt Format:

```
You are a concise article summarizer. Given an article text, write a clear and accurate summary in the following format:- Bullet-point summary- Key insight- Estimated reading time
```

### Why this approach works:

-   Ensures consistent structured output
-   Improves readability for UI rendering
-   Reduces ambiguity in AI responses

* * * * *

🔐 Security Decisions
---------------------

### 1\. No Client-Side API Keys

-   API keys are never exposed in the extension
-   All AI requests are handled through the backend server

### 2\. Controlled Backend Access

-   Only the extension can communicate with the API endpoint
-   Prevents direct abuse of the AI service

### 3\. Input Sanitization

-   Article text is cleaned before being sent to the backend
-   Reduces risk of prompt injection or malformed inputs

### 4\. Minimal Browser Permissions

-   Extension only accesses active tab content
-   No unnecessary permissions for browsing history or personal data

* * * * *

⚖️ Trade-offs
-------------

### 1\. Extension + Backend Dependency

-   **Trade-off:** Requires backend availability to function
-   **Benefit:** Keeps AI logic secure and scalable

* * * * *

### 2\. Build Step Requirement

-   **Trade-off:** Users must manually run `npm run build`
-   **Benefit:** Optimized production bundle for Chrome extension performance

* * * * *

### 3\. No Real-Time Streaming Responses

-   **Trade-off:** Summaries are returned in one response
-   **Benefit:** Simpler architecture and faster implementation
****
* * * * *

### 4\. Local Storage Caching

-   **Trade-off:** Cached summaries are device-specific
-   **Benefit:** Faster repeated access and reduced API calls

* * * * *
