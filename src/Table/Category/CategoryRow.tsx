import React, { useEffect, useState } from 'react';
import { Item, Category } from '../../Types';
import './CategoryRow.scss';
import { toast } from 'react-toastify';
import request from '../../Requests/RequestFactory'
import ItemRow from '../Item/ItemRow';
import Loading from '../../Loading/Loading';
import { useUserContext } from '../../Contexts/UserContext';

interface CategoryProps{
  category: Category,
  redrawCallback: () => void,
}

const CategoryRow: React.FC<CategoryProps> = (props) => {
  const [category, setCategory] = useState(props.category);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textValue, setTextValue] = useState(props.category.text);
  const [isSavingText, setIsSavingText] = useState(false);
  const [isCreatingNewItem, setIsCreatingNewItem] = useState(false);
  const [isRequestingItems, setIsRequestingItems] = useState(false);
  const [items, setItems] = useState([]);

  const {baseUrl} = useUserContext();

  useEffect(() => {if(category.isOpen) getItemList();}, []);

  const displayConfirmDeleteRow = () => {
    if( items.length > 0){
      toast.warning('Are you sure?', {
        closeButton: <button className='btn btn-warning' onClick={deleteCategory} style={{marginTop: '5px', marginBottom: '5px'}}>YES</button>,
        autoClose: 5000,
        draggable: false,
        pauseOnHover: false,
      });
    }
    else{
      deleteCategory();
    }
  }

  const deleteCategory = async () => {    
    setIsDeleting(true);
    const response = await request(baseUrl + '/DeleteCategory', 'DELETE', JSON.stringify(category));
  
    if(response !== undefined && response.ok){
      props.redrawCallback();
    }
    else{
      toast('Delete item went wrong!');
    }

    setTimeout(() => {
      setIsDeleting(false);
    }, 1000); 
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTextValue(event.target.value);
  }

  const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    const newText: string = textValue.toUpperCase().trim();
    const inputElement = event.target as HTMLInputElement;

    if(event.key === 'Enter'){
      if(category.text !== newText) {
        setIsSavingText(true);
        const response = await request(baseUrl + '/PatchCategory', 'PATCH', JSON.stringify({...category, text: newText}), () => {
          toast.warning("There was a problem trying to modify the category name, server may be down.", { autoClose: 10000 });
        });

        if(response !== undefined && response.ok){
          updateItemsDisplay();
          setCategory({...category, text: newText});
          setIsEditing(false);
          inputElement.blur();
        }

        setTimeout(() => {
          setIsSavingText(false);
        }, 1000);
      }
      else{
        setIsEditing(false);
        inputElement.blur();
      }
    }
    else{
      if(event.key === 'Escape') {
        setTextValue(category.text);
        setIsEditing(false);
        inputElement.blur();
      }
    }
  }

  const handleRowClick = (event: any) => {
    if(!isEditing) {
      setIsEditing(true);
      const inputElement = event.target as HTMLInputElement;
      inputElement.focus();
    }
  }

  const handleInputBlur = (event: any) => {
    const inputElement = event.target as HTMLInputElement;
    setIsEditing(false);
    inputElement.blur();
  }

  const addNewItem = async () => {

    if(!category.isOpen) changeItemsDisplay();

    const emptyItem: Item = {
      id: '',
      text: '',
      isChecked: false,
      myCategory: category.id,
      quantity: 1,
      goodPrice: '$',
      quantityUnit: '',
    }

    setIsCreatingNewItem(true);

    const response = await request(baseUrl + '/PutItem', 'PUT', JSON.stringify(emptyItem), () => {
      toast.warning("There was a problem trying to create a new item, server may be down.")
    });

    if(response !== undefined && response.ok){
      updateItemsDisplay();
    }

    setTimeout(() => {
      setIsCreatingNewItem(false);
    }, 500);
  }

  const updateItemsDisplay = async () => {
    console.log('updateItemsDisplay');
    setIsRequestingItems(true);
    const response = await request(baseUrl + '/GetItemListInCategory?categoryId='+ category.id, 'GET');

    if(response !== undefined && response.ok){
      const returnItems = await response.json();

      setIsRequestingItems(false);
      setItems(returnItems);
    }
    else{
      //toast(response);
    }
  }

  const getItemList = async () => {

    setIsRequestingItems(true);

    const response = await request(baseUrl + '/GetItemListInCategory?categoryId=' + category.id, 'GET');

    if(response !== undefined && response.ok){
      const returnItems = await response.json();

      setIsRequestingItems(false);
      setItems(returnItems);
    }
    else{
      //toast(response);
    }
  }

  const changeItemsDisplay = async () => {
    const newState = !category.isOpen;
    const response = await request(baseUrl + '/PatchCategory', 'PATCH', JSON.stringify({...category, isOpen: newState}))

    if(response != null){
      if(response.ok){
        const newCategory = await response.json();

        setCategory(newCategory);
        if(newCategory.isOpen){
          getItemList();
        }
        else{
          setItems([]);
        }
      }
      else{
        toast.error('Error...');
      }
    }
  }

  return(
    <>
      <tr className='category-row' >
        <td style={{width: '15%', textAlign:'center'}}  >
          {category.isOpen ?
            <img src={'./images/down-chevron.png'} className="unfold-image" alt='meaningfull text' onClick={changeItemsDisplay}></img>
            :
            <img src={'./images/up-chevron.png'} className="fold-image" alt='meaningfull text' onClick={changeItemsDisplay}></img>
          }
        </td>
        {!isEditing ? 
          <td style={{width: '75%', textAlign: 'center'}} onClick={handleRowClick}>
            {(isSavingText ?
            <Loading></Loading>
            :
            <div className='category-row-text'>{category.text.toUpperCase()}</div>)}
          </td>
          :
          <td>
            <input className='form-control category-row-input' type='text' value={textValue.toUpperCase()} onChange={handleInputChange} onKeyDown={handleKeyDown} autoFocus></input>
          </td>
        }
        <td style={{width: '10%'}}>
          {isEditing && !isDeleting && <img src={'./images/trash.png'} className="trash-image" alt='meaningfull text' onClick={displayConfirmDeleteRow}></img>}
          {isEditing && isDeleting && <Loading></Loading>}
          {category.isOpen && !isEditing && 
            (isCreatingNewItem ? 
              <Loading></Loading>
              :
              <img src={'./images/add.png'} className="add-image" alt='meaningfull text' onClick={addNewItem}></img>)
          }
          {!category.isOpen && !isEditing && <img src={'./images/add.png'} className="add-image" alt='meaningfull text' onClick={addNewItem}></img>}
        </td>
      </tr>
      {category.isOpen &&
      (isRequestingItems ? 
        <tr>
          <td></td>
            <td className="loading-items"><Loading></Loading></td>            
          <td></td>
        </tr>
        :
        items.map((item: Item, index: number) => (
          <ItemRow 
            key={'item' + item.id} 
            item={item} 
            updateItemsDisplay={updateItemsDisplay} 
            isPair={index % 2===0}></ItemRow>
        )))}
    </>
  );
}

export default CategoryRow