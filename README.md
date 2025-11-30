# Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `make setup`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `make run`
4. Kill corresponding service
   `make kill` to kill frontend and backend service
   `make kill SERVICE=frontend ` to kill frontend service
   `make kill SERVICE=backend` to kill backend service
