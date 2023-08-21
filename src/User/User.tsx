import React from 'react';
import './User.css';
import Login from './Login/Login';
import Settings from './Settings/Settings';
import { UserModel, UserPrefsModel } from '../Types';
import storage from '../Storage/Storage';

interface P{
  changeUser: (user: UserModel|null) => void,
  changeBaseUrl: (baseurl: string) => void,
  changeUserPrefs: (userPrefs: UserPrefsModel) => void,
  baseUrl: string,
  user: UserModel|null,
}

interface S{
  isShowingPreferences: boolean,
}

class User extends React.Component<P,S>{
  constructor(props: P){
    super(props);

    this.state = {
      isShowingPreferences: false,
    };  
  }

  changeShowingUserSettings = () => {
    this.setState({ isShowingPreferences: !this.state.isShowingPreferences });
  }

  logout = () => {
    storage.deleteToken();
    storage.deleteUser();
    this.props.changeUser(null);
  }

  render(): React.ReactNode {
    const { user } = this.props;
    return(
      <div className='col user-container'>
        {user === null || user === undefined?
          <Login changeUser={this.props.changeUser} baseUrl={this.props.baseUrl} changeBaseUrl={this.props.changeBaseUrl} logout={this.logout}></Login>
          :
          <React.Fragment>
            <div className="user-top-bar">
              <img className="user-image" src={'./images/user.png'} alt='meaningfull text' onClick={this.changeShowingUserSettings}></img>
            </div>
            {this.state.isShowingPreferences && 
              <Settings user={user} baseUrl={this.props.baseUrl} changeUserPrefs={this.props.changeUserPrefs} logout={this.logout}></Settings>
            }
          </React.Fragment>
        }
      </div>
    );
  }
}

export default User;