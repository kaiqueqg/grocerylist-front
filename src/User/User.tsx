import React, { useState } from 'react';
import './User.scss';
import Login from './Login/Login';
import Settings from './Settings/Settings';
import storage from '../Storage/Storage';
import { useUserContext } from '../Contexts/UserContext';

interface UserProps{
}

const User: React.FC<UserProps> = (props) => {

  const [isShowingPreferences, setIsShowingPreferences] = useState(false);
  const {user, setUser } =  useUserContext();

  const changeShowingUserSettings = () => {
    setIsShowingPreferences(!isShowingPreferences);
  }

  const logout = () => {
    storage.deleteToken();
    storage.deleteUser();
    setUser(null);
  }

  return(
    <div className='user-container'>
      {user === null || user === undefined?
        <Login logout={logout}></Login>
        :
        <React.Fragment>
          <div className="user-top-bar">
            <img className="user-image" src={'./images/user.png'} alt='meaningfull text' onClick={changeShowingUserSettings}></img>
          </div>
          {isShowingPreferences && 
            <Settings 
              logout={logout}></Settings>
          }
        </React.Fragment>
      }
    </div>
  );
}

export default User;