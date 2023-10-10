import React, { useState } from 'react';
import './ItemRow.scss';
import { Item, UserPrefsModel } from '../../Types';
import request from '../../Requests/RequestFactory'
import { toast } from 'react-toastify';
import Loading from '../../Loading/Loading';
import { useUserContext } from '../../Contexts/UserContext';

interface ItemRowProps{
  item: Item,
  updateItemsDisplay: () => Promise<void>, 
  isPair: boolean,
}

const ItemRow: React.FC<ItemRowProps> = (props) => {

  const [item, setItem] = useState(props.item);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [isSavingIsChecked, setIsSavingIsChecked] = useState(false);
  const [isSavingQuantity, setIsSavingQuantity] = useState(false);
  const [textValue, setTextValue] = useState(props.item.text);
  const [quantityValue, setQuantityValue] = useState(props.item.quantity);
  const [quantityUnit, setQuantityUnit] = useState(props.item.quantityUnit);
  const [goodPrice, setGoodPrice] = useState(props.item.goodPrice);
  
  const { hideQuantity, baseUrl, testServer } = useUserContext();

  const displayConfirmDeleteRow = () => {
    deleteItem();
  }

  const deleteItem = async () =>{
    setIsDeleting(true);

    const response = await request(baseUrl + '/DeleteItem', 'DELETE', JSON.stringify(item), () => {testServer();});
    
    if(response !== undefined && response.ok){
      props.updateItemsDisplay();
    }
    else{
      toast('Delete item went wrong!');
    }

    setTimeout(() => {
      setIsDeleting(false);
    }, 500); 
  }

  const changeIsChecked = async () => {
    setIsSavingIsChecked(true);

    const newItem: Item = { ...item, isChecked: !item.isChecked};
    const response = await request(baseUrl + '/PatchItem', 'PATCH', JSON.stringify(newItem), () => {testServer();});

    if(response !== undefined && response.ok){
      setItem(newItem);
      setTimeout(() => {
        setIsSavingIsChecked(false);
      }, 500); 
    }
    else{
      toast('patch ischecked problem');
      setIsSavingIsChecked(false);
    }
  }

  const handleRowClick = (event: any) => {
    if(!isEditing) {
      setIsEditing(true);
      const inputElement = event.target as HTMLInputElement;
      inputElement.focus();
    }
  }

  const handleTextInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTextValue(event.target.value);
  }

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuantityValue(parseInt(event.target.value));
  }

  const handleQuantityUnitChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuantityUnit(event.target.value);
  }

  const handleQuantityGoodPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGoodPrice(event.target.value);
  }

  const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if(event.key === 'Enter'){
      doneEdit();
    }
    else if(event.key === 'Escape'){
      cancelEdit();
    }
  }

  const doneEdit = async () => {
    const newItem: Item = {
      id: item.id,
      text: textValue.toUpperCase(),
      quantity: quantityValue,
      quantityUnit: quantityUnit,
      goodPrice: goodPrice,
      myCategory: item.myCategory,
      isChecked: item.isChecked
    }

    if(newItem.text !== item.text || newItem.quantity !== item.quantity || newItem.quantityUnit !== item.quantityUnit || newItem.goodPrice !== item.goodPrice) {
      setIsSavingItem(true);

      const response = await request(baseUrl + '/PatchItem', 'PATCH', JSON.stringify(newItem), () => {testServer();});

      if(response !== undefined && response.ok){
        setItem(newItem);
        setIsEditing(false);
      }

      setTimeout(() => {
        setIsSavingItem(false);
      }, 1000); 
    }
    else{
      setIsEditing(false);
    }
  }

  const cancelEdit = () => {
    setTextValue(item.text);
    setIsEditing(false);
  }

  const increaseQuantity = async () => {
    setIsSavingQuantity(true);

    const response = await request(baseUrl + '/PatchItem', 'PATCH', JSON.stringify({...item, quantity: item.quantity+1}), () => {testServer();});

    if(response !== undefined && response.ok){
      setItem({...item, quantity: item.quantity+1});
      setIsEditing(false);
    }

    setTimeout(() => {
      setIsSavingQuantity(false);
    }, 200); 

    setQuantityValue(quantityValue+1);
  }

  const decreaseQuantity = async () => {
    if(item.quantity > 1) {
      setIsSavingQuantity(true);
      
      const response = await request(baseUrl + '/PatchItem', 'PATCH', JSON.stringify({...item, quantity: item.quantity-1}), () => {testServer();});
  
      if(response !== undefined && response.ok){
        setItem({...item, quantity: item.quantity-1});
        setIsEditing(false);
      }
      
      setTimeout(() => {
        setIsSavingQuantity(false);
      }, 200); 

      setQuantityValue(quantityValue+1);
    }
  }

  const getDisplayText = () => {
    let displayText = item.text;
    if(!isEditing){
      if(!hideQuantity && item.quantity !== null) displayText = (item.quantity + 'x ') + displayText;
      if(item.goodPrice !== null && item.goodPrice !== '' && item.goodPrice !== '$') displayText = displayText + (' (' + item.goodPrice + ')');
    }

    return displayText;
  }
  

  return(
    <>
      <tr className={props.isPair? 'item-row-color-one' : 'item-row-color-two'}>
        <td style={{textAlign: 'center'}}>
          {isEditing && !isDeleting && <img src={'./images/trash.png'} className="item-row-image" alt='meaningfull text' onClick={displayConfirmDeleteRow}></img>}
          {isEditing && isDeleting && <Loading></Loading>}
          {!isEditing && !hideQuantity && 
            <>
              <img className="item-row-image item-row-image-plusminus" src={'./images/minus.png'} alt='meaningfull text' onClick={decreaseQuantity}></img>
              <img className="item-row-image item-row-image-plusminus" src={'./images/add.png'} alt='meaningfull text' onClick={increaseQuantity}></img>
            </>
          }
        </td>
        {isSavingItem ? 
        <Loading></Loading>
        :
        (isEditing ?
          <td className="item-row-details">
            <div className={'item-row-details-line'}>
              <div className={'item-row-details-text'}>TEXT:</div>
              <input className='form-control item-row-input' type='text' value={textValue.toUpperCase()} onChange={handleTextInputChange} onKeyDown={handleKeyDown} autoFocus></input>
            </div>
            <div className={'item-row-details-line'}>
              <div className={'item-row-details-text'} >QUANTITY:</div>
              <input className='form-control item-row-input' style={{width: '10%', minWidth:'100px'}} type='number' value={quantityValue} onChange={handleQuantityChange} onKeyDown={handleKeyDown}></input>
            </div>
            <div className={'item-row-details-line'}>
              <div className={'item-row-details-text'}>GOOD PRICE:</div>
              <input className='form-control item-row-input' type='text' value={goodPrice} onChange={handleQuantityGoodPriceChange} onKeyDown={handleKeyDown}></input>
            </div>
            <div className={'item-row-details-line'}>
              <div className={'item-row-details-text'}>QUANTITY UNIT:</div>
              <input className='form-control item-row-input' type='text' value={quantityUnit} onChange={handleQuantityUnitChange} onKeyDown={handleKeyDown}></input>
            </div>
            <img src={'./images/done.png'} className="item-row-image" alt='meaningfull text' style={{marginRight: '30px'}} onClick={doneEdit}></img>
            <img src={'./images/cancel.png'} className="item-row-image" alt='meaningfull text' onClick={cancelEdit}></img>
          </td>
          :
          <td className="item-row-text" onClick={handleRowClick}>{getDisplayText()}</td>
        )
        }
        <td>
          {isSavingIsChecked ? 
            <Loading></Loading>
            :
            <img src={item.isChecked ? './images/checked.png' : './images/unchecked.png'} className="item-row-image" alt='meaningfull text' onClick={changeIsChecked}></img>
          }
        </td>
        
      </tr>
    </>
  );
}

export default ItemRow;