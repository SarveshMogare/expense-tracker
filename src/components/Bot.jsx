import { Fab, Webchat } from '@botpress/webchat'
import { useState } from 'react'
import '../index.css' 
import '../bot.css' 

function Bot() {
  const [isWebchatOpen, setIsWebchatOpen] = useState(false)
  const toggleWebchat = () => {
    setIsWebchatOpen((prevState) => !prevState)
  }
  return (
    <>
      <Webchat
        clientId="991633d7-fa45-4ed8-a86e-d3c68cd63b63" // Your client ID here
        style={{
          width: '400px',
          height: '600px',
          display: isWebchatOpen ? 'flex' : 'none',
          position: 'fixed',
          bottom: '90px',
          right: '20px',
        }}
        config={{
            stylesheet: './bot.css' 
          }}
        
      />
      <Fab onClick={() => toggleWebchat()} style={{ height:'60px', width:'60px', position: 'fixed', bottom: '20px', right: '20px' }} />
    </>
  )
}

export default Bot