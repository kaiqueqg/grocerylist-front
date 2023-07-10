import React from 'react';
import './Login.css'
import request from '../../Requests/RequestFactory'
import { User } from '../../Types'
import { toast } from 'react-toastify';
import Loading from '../../Loading/Loading';

interface Props{
  changeToLogged: (value :boolean) => void
}

interface States{
  isLogged: boolean,
  isLogging: boolean,
  username: string, 
  password: string
}

class Login extends React.Component<Props, States>{

  constructor(props: Props){
    super(props);

    this.state = {
      isLogged: false,
      isLogging: false,
      username: '',
      password: ''
    };
  }

  componentDidMount(): void {
    const { isLogged } = this.state;
    if(!isLogged) this.login();
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
    const user: User = {
      username: username,
      password: password
    };

    const fetchData = async () => {
      this.setState({ isLogging: true })

      try {
        const response = await request('/Login', 'POST', JSON.stringify(user));

        if(response.ok){
          const jsonData = await response.json();
          localStorage.setItem('jwt', jsonData.token)
          this.login();
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

  login = () => {
    // toast('log in');
    const token = localStorage.getItem('jwt');

    if(token != null && token !== undefined){
      const parsedToken = this.parseJwt(token);
      const now = new Date();
      const tokenDate = new Date(parsedToken.exp * 1000);

      if(tokenDate > now){
        this.props.changeToLogged(true);
        this.setState({ isLogged :true});
      }
      else{
        this.props.changeToLogged(false);
        this.setState({ isLogged :false});
      }
    }
  }
  
  logout = () => {
    localStorage.removeItem('jwt');

    this.props.changeToLogged(false);
    this.setState({ isLogged :false});
  }

  render(): React.ReactNode {
    const { isLogged, isLogging } = this.state;

    return(
      <div>
        {!isLogging ? 
          (!isLogged ? 
            <div className='row login-row'>
              <div className="col login-col">
                <div className="input-group mb-3">
                  <input key='username' type="text" onChange={this.changeUsername} className="form-control" placeholder="Username" aria-label="Username"></input>
                </div>
              </div>
              <div className="col login-col">
                <div className="input-group mb-3">
                  <input key='password' type="password" onChange={this.changePassword} className="form-control" placeholder="Password" aria-label="Server"></input>
                </div>
              </div>
              <div className="col login-col">
                <div className="input-group mb-3">
                    <button type="button" className="btn btn-primary" onClick={this.requestAuthenticationToken}>Login</button>
                </div>
              </div>
            </div>
            :
            <div className='row login-row'>
              <div className='col login-col'>
                <button type="button" className="btn btn-danger" onClick={this.logout}>Logout</button>
              </div>
            </div>)
            :
            <Loading></Loading>
        }
      </div>
    );
  }
}

export default Login