import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Hotels from '../pages/Hotels'
import About from '../pages/About'
import Booking from '../pages/Booking'
import News from '../pages/News'
import NotFound from '../pages/NotFound'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/hotels" element={<Hotels />} />
      <Route path="/about" element={<About />} />
      <Route path="/booking" element={<Booking />} />
      <Route path="/news" element={<News />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
