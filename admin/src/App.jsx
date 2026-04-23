import React from 'react'
import {useNavigate,Routes,Route } from 'react-router-dom'
import Signup from './pages/Signup'
import Issues from './pages/Issues'
import Admin from './pages/Admin'

const App = () => {
  return (
    <div>
      <Routes>
      <Route path="/signup" element={<Signup/>}/>
      <Route path="/onlyforadminakjfdbk" element={<Admin/>}/>
      <Route path="/" element={<Issues/>}/>
    </Routes>
    </div>
  )
}

export default App
