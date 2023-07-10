import React from 'react';
import './ItemRow.css';
import { Item } from '../../Types';
import request from '../../Requests/RequestFactory'
import { toast } from 'react-toastify';
import Loading from '../../Loading/Loading';

interface Props{
  item: Item, 
  updateItemsDisplay: () => Promise<void>, 
  isPair: boolean
}

interface States{
  item: Item,
  isEditing: boolean,
  isDeleting: boolean,
  isSavingText: boolean,
  isSavingIsChecked: boolean,
  textValue: string
}

class ItemRow extends React.Component<Props,States>{

  constructor(props: Props){
    super(props);

    this.state = {
      item: props.item,
      isEditing: false,
      isDeleting: false,
      isSavingText: false,
      isSavingIsChecked: false,
      textValue: props.item.text
    }
  }

  displayConfirmDeleteRow = () => {
    //* for now, no confirmation
    // toast.warning('Are you sure?', {
    //   closeButton: <button className='btn btn-primary' onClick={this.deleteItem}>YES</button>,
    //   autoClose: 5000,
    //   draggable: false,
    //   pauseOnHover: false,
    // });

    this.deleteItem();
  }

  deleteItem = async () =>{
    this.setState({ isDeleting: true });

    const response = await request('/DeleteItem', 'DELETE', JSON.stringify(this.state.item));
    
    if(response !== undefined && response.ok){
      this.props.updateItemsDisplay();
    }
    else{
      toast('Delete item went wrong!');
    }

    setTimeout(() => {
      this.setState({ isDeleting: false });
    }, 500); 
  }

  changeIsChecked = async () => {
    this.setState({ isSavingIsChecked: true });

    const item: Item = { ...this.state.item, isChecked: !this.state.item.isChecked};
    const response = await request('/PatchItem', 'PATCH', JSON.stringify(item));

    if(response !== undefined && response.ok){
      this.setState({
        item: item
      }, () => {
        setTimeout(() => {
          this.setState({ isSavingIsChecked: false });
        }, 500); 
      });
    }
    else{
      toast('patch ischecked problem');
      this.setState({ isSavingIsChecked: false });
    }
  }

  handleRowClick = (event: any) => {
    if(!this.state.isEditing) {
      this.setState({
        isEditing: true
      }, () => {
        const inputElement = event.target as HTMLInputElement;
        inputElement.focus();
      });
    }
  }

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ textValue: event.target.value });
  }

  handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    const newText: string = this.state.textValue.toUpperCase();
    const { item } = this.state;
    const inputElement = event.target as HTMLInputElement;

    if(event.key === 'Enter'){
      if(newText !== item.text) {
        this.setState({ isSavingText: true });
        const response = await request('/PatchItem', 'PATCH', JSON.stringify({...item, text: newText}));
  
        if(response !== undefined && response.ok){
          this.setState({
            item: {...item, text: newText},
            isEditing: false
          }, () => {
            inputElement.blur();
          });
        }

        setTimeout(() => {
          this.setState({ isSavingText: false });
        }, 1000); 
      }
      else{
        this.setState({
          isEditing: false
        }, () => {
          inputElement.blur();
        });
      }
    }
    else{
      if(event.key === 'Escape') {
        this.setState({
          textValue: item.text,
          isEditing: false
        }, () => {
          inputElement.blur();
        });
      }
    }
  }

  render(): React.ReactNode {
    const { isPair } = this.props;
    const { item, isEditing, isDeleting, isSavingText, isSavingIsChecked, textValue } = this.state;

    return(
        <tr className={isPair? 'item-row-color-one' : 'item-row-color-two'}>
          <td>
            {isSavingIsChecked ? 
              <Loading></Loading>
              :
              <img src={item.isChecked ? './images/checked.png' : './images/unchecked.png'} className="checked-image" alt='meaningfull text' onClick={this.changeIsChecked}></img>}
          </td>
          {isSavingText ? 
          <Loading></Loading>
          :
          (
            isEditing ? 
            <td className="item-row-text">
              <input className='form-control item-row-input' type='text'  value={textValue.toUpperCase()} onChange={this.handleInputChange} onKeyDown={this.handleKeyDown} autoFocus></input>
            </td>
            :
            <td className="item-row-text" onClick={this.handleRowClick}>{item.text.toUpperCase()}</td>
          )
          }
          <td>
            {isEditing && !isDeleting && <img src={'./images/trash.png'} className="trash-image" alt='meaningfull text' onClick={this.displayConfirmDeleteRow}></img>}
            {isEditing && isDeleting && <Loading></Loading>}
            {!isEditing && <img src={'./images/trash.png'} className="trash-image" style={{opacity: 0}} alt='meaningfull text'></img>}
          </td>
        </tr>
    );
  }
}

export default ItemRow;