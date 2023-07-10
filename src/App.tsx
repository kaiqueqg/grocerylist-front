import React from 'react';
import './App.css';
import './Global.css';
import request from './Requests/RequestFactory';
import { ToastContainer, toast } from 'react-toastify';
import { GroceryList, Category } from './Types';
import Table from './Table/Table';
import Login from './User/Login/Login';
import Loading from './Loading/Loading';



interface Props{
}

interface States{
  data: GroceryList,
  isLogged: boolean,
  isServerUp: boolean
}

class App extends React.Component<Props, States>{
  constructor(props: Props){
    super(props);

    this.state = {
      data: {categories: []},
      isLogged: false,
      isServerUp: true
    }
  }

  changeToLogged = (value :boolean) => {
    this.setState({
      isLogged: value
    });
  }

  render(): React.ReactNode {
    const { data, isLogged } = this.state;

    return (
      <div className="App">
        {/* login row */}
        <div className='row'>
          <div className='col'style={{justifyContent: 'center', display: 'flex'}}>
            <Login changeToLogged={this.changeToLogged}></Login>
          </div>
        </div>
        {isLogged && 
        <div className='row' style={{justifyContent: 'center', display: 'flex'}}>
          <div className='col-6' >
            <Table data={data}></Table>
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