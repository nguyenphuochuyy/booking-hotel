import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import ScrollToTop from './components/ScrollToTop'
import PopupAdvertisement from './components/PopupAdvertisement/PopupAdvertisement'
import './App.css'

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppRoutes />
      <PopupAdvertisement />
    </Router>
  )
}

export default App
