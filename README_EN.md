# Fiscra
Fiscra is a account app based on TypeScript and python.
Now it is a demo version 





[中文](README.md) | [English](README_EN.md)
## Run Locally

**Prerequisites:**  [Node.js](https://nodejs.org/en/download), [Python](https://www.python.org/downloads/)


1. Install dependencies:
   `make setup`
2. Create a `.env.local` file and Set the `GEMINI_API_KEY` in order to use AI service
3. Run the app:
   `make run`
4. Kill corresponding service
   `make kill` to kill frontend and backend service
   `make kill SERVICE=frontend ` to kill frontend service
   `make kill SERVICE=backend` to kill backend service
