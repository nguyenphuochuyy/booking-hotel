import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import Navigation from './components/Navigation'
import AppRoutes from './routes/AppRoutes'
import Footer from './components/Footer'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <AppRoutes />
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
