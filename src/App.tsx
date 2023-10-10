import './App.scss';
import './Global.css';
import { ToastContainer } from 'react-toastify';
import Table from './Table/Table';
import User from './User/User';
import { useUserContext } from './Contexts/UserContext';


const App = () => {
  const { user } = useUserContext();

  return (
    <div className="appContainer">
      <User/>
      {user !== null && user !== undefined && <Table ></Table>}
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

export default App