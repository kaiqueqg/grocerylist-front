import React from 'react';
import './ItemRow.css';
import { Item } from '../../Types';
import request from '../../Requests/RequestFactory'
import { toast } from 'react-toastify';
import Loading from '../../Loading/Loading';

interface Props{
  item: Item,
  updateItemsDisplay: () => Promise<void>, 
  isPair: boolean,
  baseUrl: string
}

interface States{
  item: Item,
  isEditing: boolean,
  isDeleting: boolean,
  isSavingItem: boolean,
  isSavingIsChecked: boolean,
  isSavingQuantity: boolean,
  textValue: string,
  quantityValue: number,
  quantityUnit: string,
  goodPrice: string,
}

class ItemRow extends React.Component<Props,States>{

  constructor(props: Props){
    super(props);

    this.state = {
      item: props.item,
      isEditing: false,
      isDeleting: false,
      isSavingItem: false,
      isSavingIsChecked: false,
      isSavingQuantity: false,
      textValue: props.item.text,
      quantityValue: props.item.quantity,
      quantityUnit: props.item.quantityUnit,
      goodPrice: props.item.goodPrice,
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

    const response = await request(this.props.baseUrl + '/DeleteItem', 'DELETE', JSON.stringify(this.state.item));
    
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
    const response = await request(this.props.baseUrl + '/PatchItem', 'PATCH', JSON.stringify(item));

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

  handleTextInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ textValue: event.target.value });
  }

  handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ quantityValue: parseInt(event.target.value) });
  }

  handleQuantityUnitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ quantityUnit: event.target.value });
  }

  handleQuantityGoodPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ goodPrice: event.target.value });
  }

  handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if(event.key === 'Enter'){
      this.doneEdit();
    }
    else if(event.key === 'Escape'){
      this.cancelEdit();
    }
  }

  doneEdit = async () => {
    const { item } = this.state;
    const newItem: Item = {
      id: item.id,
      text: this.state.textValue.toUpperCase(),
      quantity: this.state.quantityValue,
      quantityUnit: this.state.quantityUnit,
      goodPrice: this.state.goodPrice,
      myCategory: item.myCategory,
      isChecked: item.isChecked
    }

    if(newItem.text !== item.text || newItem.quantity !== item.quantity || newItem.quantityUnit !== item.quantityUnit || newItem.goodPrice !== item.goodPrice) {
      this.setState({ isSavingItem: true });

      const response = await request(this.props.baseUrl + '/PatchItem', 'PATCH', JSON.stringify(newItem));

      if(response !== undefined && response.ok){
        this.setState({
          item: newItem,
          isEditing: false
        });
      }

      setTimeout(() => {
        this.setState({ isSavingItem: false });
      }, 1000); 
    }
    else{
      this.setState({
        isEditing: false
      });
    }
  }

  cancelEdit = () => {
    const { item } = this.state;
    this.setState({
      textValue: item.text,
      isEditing: false
    });
  }

  increaseQuantity = async () => {
    this.setState({ isSavingQuantity: true });

    const { item } = this.state;
    const response = await request(this.props.baseUrl + '/PatchItem', 'PATCH', JSON.stringify({...item, quantity: item.quantity+1}));

      if(response !== undefined && response.ok){
        this.setState({
          item: {...item, quantity: item.quantity+1},
          isEditing: false
        });
      }

      setTimeout(() => {
        this.setState({ isSavingQuantity: false });
      }, 200); 

    this.setState({
      quantityValue: this.state.quantityValue+1
    });
  }

  decreaseQuantity = async () => {
    const { item } = this.state;
    if(item.quantity > 1) {
      this.setState({ isSavingQuantity: true });
      
      const response = await request(this.props.baseUrl + '/PatchItem', 'PATCH', JSON.stringify({...item, quantity: item.quantity-1}));
  
        if(response !== undefined && response.ok){
          this.setState({
            item: {...item, quantity: item.quantity-1},
            isEditing: false
          });
        }
  
        setTimeout(() => {
          this.setState({ isSavingQuantity: false });
        }, 200); 
  
      this.setState({
        quantityValue: this.state.quantityValue+1
      });
    }
  }

  render(): React.ReactNode {
    const { isPair } = this.props;
    const { item, isEditing, isDeleting, isSavingItem, isSavingIsChecked, textValue, quantityValue, quantityUnit, goodPrice } = this.state;

    let displayText = item.text;
    if(!isEditing){
      if(item.quantity !== null) displayText = (item.quantity + 'x ') + displayText;
      if(item.goodPrice !== null && item.goodPrice !== '') displayText = displayText + (' (' + item.goodPrice + ')');
    }

    return(
      <React.Fragment>
        <tr className={isPair? 'item-row-color-one' : 'item-row-color-two'}>
          <td>
            {isEditing && !isDeleting && <img src={'./images/trash.png'} className="item-row-image" alt='meaningfull text' onClick={this.displayConfirmDeleteRow}></img>}
            {isEditing && isDeleting && <Loading></Loading>}
            {!isEditing && 
              <React.Fragment>
                <img className="item-row-image item-row-image-plusminus" src={'./images/minus.png'} alt='meaningfull text' onClick={this.decreaseQuantity}></img>
                <img className="item-row-image item-row-image-plusminus" src={'./images/add.png'} alt='meaningfull text' onClick={this.increaseQuantity}></img>
              </React.Fragment>
            }
          </td>
          {isSavingItem ? 
          <Loading></Loading>
          :
          (isEditing ?
            <td className="item-row-details">
              <div className={'item-row-details-line'}>
                <div className={'item-row-details-text'}>TEXT:</div>
                <input className='form-control item-row-input' type='text' value={textValue.toUpperCase()} onChange={this.handleTextInputChange} onKeyDown={this.handleKeyDown} autoFocus></input>
              </div>
              <div className={'item-row-details-line'}>
                <div className={'item-row-details-text'} >QUANTITY:</div>
                <input className='form-control item-row-input' style={{width: '10%', minWidth:'100px'}} type='number' value={quantityValue} onChange={this.handleQuantityChange} onKeyDown={this.handleKeyDown}></input>
              </div>
              <div className={'item-row-details-line'}>
                <div className={'item-row-details-text'}>GOOD PRICE:</div>
                <input className='form-control item-row-input' type='text' value={goodPrice} onChange={this.handleQuantityGoodPriceChange} onKeyDown={this.handleKeyDown}></input>
              </div>
              <div className={'item-row-details-line'}>
                <div className={'item-row-details-text'}>QUANTITY UNIT:</div>
                <input className='form-control item-row-input' type='text' value={quantityUnit} onChange={this.handleQuantityUnitChange} onKeyDown={this.handleKeyDown}></input>
              </div>
              <img src={'./images/done.png'} className="item-row-image" alt='meaningfull text' style={{marginRight: '30px'}} onClick={this.doneEdit}></img>
              <img src={'./images/cancel.png'} className="item-row-image" alt='meaningfull text' onClick={this.cancelEdit}></img>
            </td>
            :
            <td className="item-row-text" onClick={this.handleRowClick}>{displayText}</td>
          )
          }
          <td>
            {isSavingIsChecked ? 
              <Loading></Loading>
              :
              <img src={item.isChecked ? './images/checked.png' : './images/unchecked.png'} className="item-row-image" alt='meaningfull text' onClick={this.changeIsChecked}></img>
            }
          </td>
          
        </tr>
      </React.Fragment>
    );
  }
}

export default ItemRow;