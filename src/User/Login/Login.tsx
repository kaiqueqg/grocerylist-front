import React from 'react';
import './Login.css'
import request from '../../Requests/RequestFactory'
import { LoginModel, UserModel } from '../../Types'
import Loading from '../../Loading/Loading';
import { toast } from 'react-toastify';
import storage from '../../Storage/Storage';

interface Props{
  changeUser: (newUser: UserModel|null) => void,
  changeBaseUrl: (baseurl: string) => void,
  logout: () => void,
  baseUrl: string,
}

interface States{
  isLogging: boolean,
  username: string, 
  password: string
}

class Login extends React.Component<Props, States>{

  constructor(props: Props){
    super(props);

    this.state = {
      isLogging: false,
      username: '',
      password: ''
    };
  }

  componentDidMount(): void {
    this.login();
  }
  
  parseJwt = (token :string) => {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  }

  requestAuthenticationToken = () => {
    const { username, password } = this.state;

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
      this.setState({ isLogging: true })

      try {
        const response = await request(this.props.baseUrl + '/Login', 'POST', JSON.stringify(user));

        if(response !== undefined) {
          if(response.ok){
            const jsonData: LoginModel = await response.json();
            if(jsonData.user !== undefined && jsonData.token !== undefined){
              storage.setToken(jsonData.token);
              storage.setUser(jsonData.user);
              this.props.changeUser(jsonData.user);
            }
          }
        }
      } catch (error) {
        console.log('Error:', error);
      }
      setTimeout(() => {
      this.setState({ isLogging: false });
    }, 1000); 
    };
    fetchData();
  }

  changeUsername = (event: any) => {
    this.setState({
      username: event.target.value
    });
  }

  changePassword = (event: any) => {
    this.setState({
      password: event.target.value
    });
  }

  checkForLoginToken = () =>{
    const token = storage.getToken();

    if(token != null && token !== undefined){
      const parsedToken = this.parseJwt(token);
      const now = new Date();
      const tokenDate = new Date(parsedToken.exp * 1000);

      return tokenDate > now;
    }

    return false;
  }

  login = () => {
    const token = storage.getToken();
    const user = storage.getUser();

    if(token != null && token !== undefined && user != null && user !== undefined){
      const parsedToken = this.parseJwt(token);
      const now = new Date();
      const tokenDate = new Date(parsedToken.exp * 1000);

      if(tokenDate > now){
        this.props.changeUser(storage.getUser());
      }
      else{
        this.props.logout();
      }
    }
  }

  render(): React.ReactNode {
    const { isLogging } = this.state;

    return(
      <div className='login-container'>
        {!isLogging ? 
          <div className="col login-box">
            <div className='login-row'>
              <input key='baseurl' type="text" className="form-control baseurl" placeholder={this.props.baseUrl} aria-label="BaseUrl"></input>
            </div>
            <div className="login-row">
              <input className="form-control username" type="text" onChange={this.changeUsername}  placeholder="Username" aria-label="Username"></input>
            </div>
            <div className="login-row">
              <input className="form-control password"  type="password" onChange={this.changePassword} placeholder="Password" aria-label="Server"></input>
            </div>
            <div className="login-row">
              <button className="btn btn-login" type="button"  onClick={this.requestAuthenticationToken}>Login</button>
            </div>
          </div>
          :
          <Loading></Loading>
        }
      </div>
    );
  }
}

export default Login