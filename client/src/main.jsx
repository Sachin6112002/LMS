import React, { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AppContextProvider } from './context/AppContext.jsx'
import Loading from './components/student/Loading';

const ErrorBoundary = ({ children }) => {
  return children;
};

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AppContextProvider>
      <Suspense fallback={<Loading />}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </Suspense>
    </AppContextProvider>
  </BrowserRouter>,
)
