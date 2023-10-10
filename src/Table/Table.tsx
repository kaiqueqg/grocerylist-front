import React, { useEffect, useState } from 'react';
import './Table.scss';
import { Category, GroceryList, Item } from '../Types';
import { toast } from 'react-toastify';
import CategoryRow from './Category/CategoryRow';
import request from '../Requests/RequestFactory';
import { useUserContext } from '../Contexts/UserContext';

interface TableProps{
}

const Table: React.FC<TableProps> = (props) => {
  const [data, setData] = useState<GroceryList>({categories: []});
  const [isGettingCategoryList, setIsGettingCategoryList] = useState<boolean>(false);
  const [areAllOpen, setAreAllOpen] = useState<boolean>(false);
  
  const {shouldCreateNewItemWhenCreateNewCategory, baseUrl, testServer} = useUserContext();

  useEffect(() => {getCategoryList();}, []);

  const getCategoryList = async () => {
    setIsGettingCategoryList(true);
    const response = await request(baseUrl + '/GetCategoryList', 'GET', undefined, () => {testServer();});
    
    if(response !== undefined && response.ok){
      const data = await response.json();

      let areAnyOneOpen = false;
      for(let i = 0; i < data.length && !areAnyOneOpen; i++){
        areAnyOneOpen = data[i].isOpen;
      }
      setAreAllOpen(areAnyOneOpen);
      setData({categories: data});
      setIsGettingCategoryList(false);
    }
    setIsGettingCategoryList(true);
  }

  const addNewCategory = async () => {
    let newCategory: Category = {
      id: '',
      text: '',
      isOpen: true,
    }

    const response = await request(baseUrl + '/PutCategory', 'PUT', JSON.stringify(newCategory), () => {testServer();});

    if(response != null){
      if(response.ok){
        if(shouldCreateNewItemWhenCreateNewCategory){
          const category: Category = await response.json();
          const emptyItem: Item = {
            id: '',
            text: '',
            isChecked: false,
            myCategory: category.id,
            quantity: 1,
            goodPrice: '$',
            quantityUnit: '',
          };

          await request(baseUrl + '/PutItem', 'PUT', JSON.stringify(emptyItem), () => {testServer();});
        }

        getCategoryList();
      }
      else if(response.status === 409){
        toast.warning("Item already exist!");
      }
      else{
        toast.error("Error...");
      }
    }
  }

  const redrawCallback = () => {
    getCategoryList();
  }

  return(
    <>
      <table key='table' className='grocerylist-table'>
        <thead>
          <tr className='header-row'>
            <td>
              <img src={'./images/doubledown-chevron.png'} className="unfold-image" alt='meaningfull text' style={{opacity: 0}}></img>
            </td>
            <td className='grocerylist-table-title'>
              GROCERY LIST
            </td>
            <td>
              <img src={'./images/add.png'} className="category-add-image" alt='meaningfull text' onClick={addNewCategory}></img>
            </td>
          </tr>
        </thead>
        <tbody key='tbody'>
          { data.categories.map((category) => (
            <CategoryRow 
              key={'category' + category.id} 
              redrawCallback={redrawCallback}
              category={category}></CategoryRow>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default Table;