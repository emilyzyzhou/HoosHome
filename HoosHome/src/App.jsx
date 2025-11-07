import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div>

      <div className='title'>
        Welcome to HoosHome!
      </div>

      <div className='content'>
        <p>
          Join an Existing Home
        </p>
        <input placeholder='Enter Join Code' />
        <p>
          Create a New Home
        </p>
        <button className='createBtn'>
          Create Home
        </button>
      </div>
        
    </div>
    </>
  )
}

export default App
