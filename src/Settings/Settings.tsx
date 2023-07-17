import React from 'react';
import './Settings.css'
import { toast } from 'react-toastify';

interface Props{
  baseUrl: string,
  changeBaseUrlCallback: (value: string) => void
}

interface States{
  textValue: string
}

class Settings extends React.Component<Props, States>{
  constructor(props: Props){
    super(props);

    this.state = {
      textValue: this.props.baseUrl
    };
  }

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ textValue: event.target.value });
  }

  handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    const newText: string = this.state.textValue.trim();

    if(event.key === 'Enter'){
      if(this.props.baseUrl !== newText) {
        this.props.changeBaseUrlCallback(newText);
        this.setState({ textValue: '' })
      }
    }
  }

  render(): React.ReactNode {
    return(
      <div className='row'>
        <div className="col">
          <div className="input-group mb-3">
            <input key='baseurl' type="text" onChange={this.handleInputChange} onKeyDown={this.handleKeyDown} className="form-control" placeholder={this.props.baseUrl} aria-label="baseurl"></input>
          </div>
        </div>
      </div>
    );
  }
}

export default Settings