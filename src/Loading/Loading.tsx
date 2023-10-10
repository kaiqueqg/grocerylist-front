import React from 'react'
import './Loading.scss'

class Loading extends React.Component{
  render(): React.ReactNode {
    return(
      <img src={'./images/refresh.png'} className="loading-image rotate-icon" alt='a'></img>
    );
  }
}

export default Loading