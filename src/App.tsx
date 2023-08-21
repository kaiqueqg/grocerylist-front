import React from 'react';
import './App.css';
import './Global.css';
import { ToastContainer } from 'react-toastify';
import Table from './Table/Table';
import User from './User/User';
import { UserModel, UserPrefsModel } from './Types';
import request from './Requests/RequestFactory';

interface Props{
}

interface States{
  isServerUp: boolean,
  baseUrl: string,
  user: UserModel|null,
}

class App extends React.Component<Props, States>{
  constructor(props: Props){
    super(props);
    let storageBaseUrl = localStorage.getItem('grocerylistbaseurl');

    if(storageBaseUrl === null) storageBaseUrl = "http://localhost:5000/api";
    this.state = {
      isServerUp: true,
      baseUrl: storageBaseUrl,
      user: null,
    }
  }

  changeUser = (newUser: UserModel|null) => {
    this.setState({
      user: newUser,
    });
  }

  changeBaseUrl = (value: string) => {
    localStorage.setItem('grocerylistbaseurl', value);
    localStorage.removeItem('jwt');
    this.setState({ baseUrl: value });
  }

  changeUserPrefs = async (newUserPrefs: UserPrefsModel) => {
    const { user } = this.state;
    if(user !== null) {
      const newUser: UserModel = {...user, userPrefs: newUserPrefs};
  
      try {
        const response = await request(this.state.baseUrl + '/PatchUserPrefs', 'PATCH', JSON.stringify(newUser));
    
        if(response !== undefined){
          if(response.ok){
            
            this.setState({
              user: newUser
            });
          }
        }
      } catch (err) { console.log('Error:', err); }
    }
  }

  testIsServerIsUp = async () => {
    const response = await request(this.state.baseUrl + '/IsUp', 'GET', undefined, () => {
      this.setState({ isServerUp: false });
    });
  }

  render(): React.ReactNode {
    const { baseUrl, user, isServerUp } = this.state;
    
    return (
      <div className="container" style={{backgroundColor: '#282c34', height: '100vh'}}>
        {isServerUp? 
          <React.Fragment>
            <div className='row'>
              <div className='col'>
                <User 
                  changeBaseUrl={this.changeBaseUrl}
                  changeUser={this.changeUser}
                  changeUserPrefs={this.changeUserPrefs}
                  baseUrl={baseUrl}
                  user={user}></User>
              </div>
            </div>
            {user !== null && user !== undefined &&
              <div className='row'>
                <div className='col'>
                  <Table baseUrl={baseUrl} userPrefs={user.userPrefs} testIsServerUp={this.testIsServerIsUp}></Table>
                </div>
              </div>
            }
          </React.Fragment>
          :
          <div className='row'>
            <div className='col '>
              <h3 className='server-down' style={{color: 'beige'}}>SERVER IS DOWN</h3>
            </div>
          </div>
        }
        <ToastContainer
        position="top-center"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        theme="dark"
        />
      </div>
    )
  }
}

export default App