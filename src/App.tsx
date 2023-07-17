import React from 'react';
import './App.css';
import './Global.css';
import request from './Requests/RequestFactory';
import { ToastContainer, toast } from 'react-toastify';
import { GroceryList, Category } from './Types';
import Table from './Table/Table';
import Login from './User/Login/Login';
import Loading from './Loading/Loading';
import Settings from './Settings/Settings';
import { validateLocaleAndSetLanguage } from 'typescript';



interface Props{
}

interface States{
  isLogged: boolean,
  isServerUp: boolean,
  baseUrl: string
}

class App extends React.Component<Props, States>{
  constructor(props: Props){
    super(props);
    let storageBaseUrl = localStorage.getItem('grocerylistbaseurl');

    if(storageBaseUrl === null) storageBaseUrl = "http://localhost:5000/api";
    this.state = {
      isLogged: false,
      isServerUp: true,
      baseUrl: storageBaseUrl
    }
  }

  changeToLogged = (value :boolean) => {
    this.setState({
      isLogged: value
    });
  }

  changeBaseUrl = (value: string) => {
    localStorage.setItem('grocerylistbaseurl', value);
    localStorage.removeItem('jwt');
    this.setState({ baseUrl: value, isLogged: false });
  }

  render(): React.ReactNode {
    const { isLogged, baseUrl } = this.state;

    return (
      <div className="App">
        {/* login row */}
        <div className='row'>
          <div className='col'style={{justifyContent: 'center', display: 'flex'}}>
            <Login changeBaseUrl={this.changeBaseUrl} isLogged={isLogged} baseUrl={baseUrl} changeToLogged={this.changeToLogged}></Login>
          </div>
        </div>
        {isLogged && 
        <div className='row' style={{justifyContent: 'center', display: 'flex'}}>
          <div className='col-6' >
            <Table baseUrl={baseUrl}></Table>
          </div>
        </div>}
        <ToastContainer
        position="top-center"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        //pauseOnFocusLoss
        //draggable
        //pauseOnHover
        theme="dark"
        />
      </div>
    )
  }
}

export default App