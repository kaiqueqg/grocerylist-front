import React from 'react';
import { UserModel, UserPrefsModel } from '../../Types';
import './Settings.css'

interface P{
  baseUrl: string,
  user: UserModel,
  changeUserPrefs: (userPrefs: UserPrefsModel) => void,
  logout: () => void,
}

interface S{
  textValue: string,
}

class Settings extends React.Component<P, S>{
  constructor(props: P){
    super(props);

    this.state = {
      textValue: this.props.baseUrl,
    };
  }

  render(): React.ReactNode {
    const { user } = this.props;
    const btn =  user !== undefined && user.userPrefs.shouldCreateNewItemWhenCreateNewCategory? 'btn settings-button' : 'btn settings-button-disabled';
    const btn2 = user !== undefined && user.userPrefs.hideQuantity? 'btn settings-button' : 'btn settings-button-disabled';

    return(
      <div className="settings-container">
        <button className={btn} type="button" onClick={() => {this.props.changeUserPrefs({...user.userPrefs, shouldCreateNewItemWhenCreateNewCategory: !user.userPrefs.shouldCreateNewItemWhenCreateNewCategory})}}>{'Auto create new item when creating new category.'}</button>
        <button className={btn2} type="button" onClick={() => {this.props.changeUserPrefs({...user.userPrefs, hideQuantity: !user?.userPrefs.hideQuantity})}}>{'Hide quantity information.'}</button>
        <button className={'btn btn-logout'} type='button' onClick={this.props.logout}>Logout</button>
      </div>
    );
  }
}

export default Settings