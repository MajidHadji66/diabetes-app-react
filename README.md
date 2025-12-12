# DiaSync - Diabetes Management App

A React application with a Node.js backend to track diet and glucose, powered by Google Gemini for personalized insights.

## Run Locally

1.  **Install Dependencies**
    ```bash
    npm install
    cd server && npm install && cd ..
    ```

2.  **Configure Environment**
    Create a `.env` file in the root directory:
    ```
    GEMINI_API_KEY=your_actual_api_key
    ```

3.  **Start Application**
    Run both client and server:
    ```bash
    npm run dev
    ```
    - Frontend: http://localhost:5173
    - Backend: http://localhost:3000

## Deployment (Google Cloud)

**Important:** Do not commit your `.env` file to GitHub.

When deploying to Google Cloud (e.g., App Engine or Cloud Run):
1.  **Environment Variables:** Go to your Google Cloud Console deployment settings.
2.  **Add Variable:** Create a new environment variable named `GEMINI_API_KEY`.
3.  **Value:** Paste your actual API key there.

Google Cloud will securely inject this key into your application when it starts.
