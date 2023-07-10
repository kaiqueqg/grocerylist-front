import React from 'react'
import './Loading.css'

class Loading extends React.Component{
  render(): React.ReactNode {
    return(
      <img src={'./images/refresh.png'} className="loading-image rotate-icon" alt='a'></img>
    );
  }
}

export default Loading