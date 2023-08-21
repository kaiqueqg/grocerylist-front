import React from 'react';
import './Table.css';
import { Category, GroceryList, Item, UserPrefsModel } from '../Types';
import { toast } from 'react-toastify';
import CategoryRow from './Category/CategoryRow';
import request from '../Requests/RequestFactory';

interface P{
  baseUrl: string,
  userPrefs: UserPrefsModel,
  testIsServerUp: () => void,
}

interface S{
  data: GroceryList,
  isGettingCategoryList: boolean,
  areAllOpen: boolean,
}

class Table extends React.Component<P, S> {

  constructor(props: P){
    super(props);

    this.state = {
      data: {categories: []},
      isGettingCategoryList: false,
      areAllOpen: false,
    }
  }

  componentDidMount(): void {
    this.getCategoryList();
  }

  getCategoryList = async () => {
    this.setState({
      isGettingCategoryList: true
    }, async () => {
      const response = await request(this.props.baseUrl + '/GetCategoryList', 'GET', undefined, async () => {
        this.props.testIsServerUp();
      });
      
      if(response !== undefined && response.ok){
        const data = await response.json();

        let areAnyOneOpen = false;
        for(let i = 0; i < data.length && !areAnyOneOpen; i++){
          areAnyOneOpen = data[i].isOpen;
        }

        this.setState({
          areAllOpen: areAnyOneOpen,
          data: {categories: data},
          isGettingCategoryList: false
        });
      }
    });
  }

  addNewCategory = async () => {
    let newCategory: Category = {
      id: '',
      text: '',
      isOpen: true,
    }

    const response = await request(this.props.baseUrl + '/PutCategory', 'PUT', JSON.stringify(newCategory));

    if(response != null){
      if(response.ok){
        if(this.props.userPrefs.shouldCreateNewItemWhenCreateNewCategory){
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

          const response2 = await request(this.props.baseUrl + '/PutItem', 'PUT', JSON.stringify(emptyItem));
        }

        this.getCategoryList();
      }
      else if(response.status === 409){
        toast.warning("Item already exist!");
      }
      else{
        toast.error("Error...");
      }
    }
  }

  redrawCallback = () => {
    this.getCategoryList();
  }

  render() {
    const { data } = this.state;

    return(
      <React.Fragment>
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
                <img src={'./images/add.png'} className="category-add-image" alt='meaningfull text' onClick={this.addNewCategory}></img>
              </td>
            </tr>
          </thead>
          <tbody key='tbody'>
            { data.categories.map((category) => (
              <CategoryRow 
                key={'category' + category.id} 
                baseUrl={this.props.baseUrl} 
                userPrefs={this.props.userPrefs}
                redrawCallback={this.redrawCallback}
                category={category}></CategoryRow>
            ))}
          </tbody>
        </table>
      </React.Fragment>
    );
  }
}

export default Table;