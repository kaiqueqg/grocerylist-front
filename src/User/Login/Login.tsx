import React, { useEffect, useState } from 'react';
import './Login.scss'
import request from '../../Requests/RequestFactory'
import { LoginModel, UserModel } from '../../Types'
import Loading from '../../Loading/Loading';
import { toast } from 'react-toastify';
import storage from '../../Storage/Storage';
import { useUserContext } from '../../Contexts/UserContext';

interface LoginProps{
  logout: () => void,
}

const Login: React.FC<LoginProps> = (props) => {
  const [isLogging, setIsLogging] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const { baseUrl, setBaseUrl, setUser, testServer } = useUserContext();

  useEffect(() => {
    login();
  });
  
  const parseJwt = (token :string) => {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }

  const requestAuthenticationToken = () => {
    if(username.trim() === ""){
      toast.warning("Type username to login!");
      return;
    }

    if(password.trim() === ""){
      toast.warning("Type password to login!");
      return;
    }

    const user: UserModel = {
      username: username,
      password: password,
      userPrefs: {hideQuantity: false, shouldCreateNewItemWhenCreateNewCategory: false}
    };

    const fetchData = async () => {
      setIsLogging(true);

      try {
        const response = await request(baseUrl + '/Login', 'POST', JSON.stringify(user), () => {
          toast.warning("Error trying to login!");
          testServer();
        });

        if(response !== undefined) {
          if(response.ok){
            const jsonData: LoginModel = await response.json();
            if(jsonData.user !== undefined && jsonData.token !== undefined){
              storage.setToken(jsonData.token);
              storage.setUser(jsonData.user);
              setUser(jsonData.user);
            }
          }
        }
      } catch (error) {
        console.log('Error:', error);
      }
      setTimeout(() => {
        setIsLogging(false);
    }, 1000); 
    };
    fetchData();
  }

  const changeBaseUrl = (event: any) =>{
    setBaseUrl(event.target.value);
  }

  const changeUsername = (event: any) => {
    setUsername(event.target.value);
  }

  const changePassword = (event: any) => {
    setPassword(event.target.value);
  }

  const checkForLoginToken = () =>{
    const token = storage.getToken();

    if(token != null && token !== undefined){
      const parsedToken = parseJwt(token);
      const now = new Date();
      const tokenDate = new Date(parsedToken.exp * 1000);

      return tokenDate > now;
    }

    return false;
  }

  const login = () => {
    const token = storage.getToken();
    const user = storage.getUser();

    if(token != null && token !== undefined && user != null && user !== undefined){
      const parsedToken = parseJwt(token);
      const now = new Date();
      const tokenDate = new Date(parsedToken.exp * 1000);

      if(tokenDate > now){
        setUser(storage.getUser());
      }
      else{
        props.logout();
      }
    }
  }

  return(
    <div className='login-container'>
      {!isLogging ? 
        <div className="col login-box">
          <div className='login-row'>
            <input className="form-control baseurl" type="text" onChange={changeBaseUrl} value={baseUrl} placeholder={baseUrl} aria-label="BaseUrl"></input>
          </div>
          <div className="login-row">
            <input className="form-control username" type="text" onChange={changeUsername}  placeholder="Username" aria-label="Username"></input>
          </div>
          <div className="login-row">
            <input className="form-control password"  type="password" onChange={changePassword} placeholder="Password" aria-label="Server"></input>
          </div>
          <div className="login-row">
            <button className="btn-login" type="button"  onClick={requestAuthenticationToken}>Login</button>
          </div>
        </div>
        :
        <Loading></Loading>
      }
    </div>
  );
}

export default Login