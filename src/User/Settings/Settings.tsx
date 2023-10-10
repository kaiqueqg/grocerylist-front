import { useUserContext } from '../../Contexts/UserContext';
import { UserModel, UserPrefsModel } from '../../Types';
import './Settings.scss'

interface SettingsProps{
  logout: () => void,
}

const Settings:React.FC<SettingsProps> = (props) => {
  const { 
    hideQuantity,
    setHideQuantity,
    shouldCreateNewItemWhenCreateNewCategory,
    setShouldCreateNewItemWhenCreateNewCategory } = useUserContext();

  const btn =  shouldCreateNewItemWhenCreateNewCategory? 'btn settings-button' : 'btn settings-button-disabled';
  const btn2 = hideQuantity? 'btn settings-button' : 'btn settings-button-disabled';

  return(
    <div className="settings-container">
      <button className={btn} type="button" onClick={() => { setShouldCreateNewItemWhenCreateNewCategory(!shouldCreateNewItemWhenCreateNewCategory)}}>{'Auto create new item when creating new category.'}</button>
      <button className={btn2} type="button" onClick={() => { setHideQuantity(!hideQuantity) }}>{'Hide quantity information.'}</button>
      <button className={'btn btn-logout'} type='button' onClick={props.logout}>Logout</button>
    </div>
  );
}

export default Settings