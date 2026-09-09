import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import { EmotionProvider } from "./context/EmotionContext.jsx";

import "./styles/globals.css";
import "./styles/layout.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Root element with id "root" was not found.');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <EmotionProvider>
        <App />
      </EmotionProvider>
    </BrowserRouter>
  </React.StrictMode>
);