<<<<<<< HEAD
import './App.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

=======
import React from 'react'
import ReactDOM from 'react-dom/client'
>>>>>>> feature/booking-form
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom' // Import this

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* Wrap App inside BrowserRouter */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)