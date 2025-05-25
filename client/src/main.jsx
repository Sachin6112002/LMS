import React, { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AppContextProvider } from './context/AppContext.jsx'

const ErrorBoundary = ({ children }) => {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      {children}
    </React.Suspense>
  );
};

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AppContextProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </AppContextProvider>
  </BrowserRouter>,
)
