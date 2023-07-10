import React from 'react';
import './Table.css';
import { Category, GroceryList } from '../Types';
import { toast } from 'react-toastify';
import CategoryRow from './Category/CategoryRow';
import request from '../Requests/RequestFactory';
import Loading from '../Loading/Loading';

interface Props{
  data: GroceryList
}

interface States{
  data: GroceryList
  isGettingCategoryList: boolean,
  areAllOpen: boolean,
  isServerUp: boolean
}

class Table extends React.Component<Props, States> {

  constructor(props: Props){
    super(props);

    this.state = {
      data: this.props.data,
      isGettingCategoryList: false,
      areAllOpen: false,
      isServerUp: true
    }
  }

  componentDidMount(): void {
    this.getCategoryList();
  }

  getCategoryList = async () => {
    this.setState({
      isGettingCategoryList: true
    }, async () => {
      const response = await request('/GetCategoryList', 'GET', undefined, async () => {
        const response = await request('/IsUp', 'GET', undefined, () => {
          this.setState({ isServerUp: false });
        });
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
      isOpen: false
    }

    const response = await request('/PutCategory', 'PUT', JSON.stringify(newCategory));

    if(response != null){
      if(response.ok){
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

  // changeDisplayAllCategories = async (value: boolean) => {
  //   const response = await request('/ChangeDisplayAllCategories?value=' + value, 'GET');
  //   if(response != null){
  //     if(response.ok){
  //       this.setState({
  //         areAllOpen: value
  //       }, () => {
  //         this.getCategoryList();
  //       });
  //     }else{
  //       toast.error("Error...");
  //     }
  //   }
  // }

  redrawCallback = () => {
    this.getCategoryList();
  }

  render() {
    const { data, isServerUp } = this.state;

    return(
      <div className='col'>
        <div key='key' className='row'>
          {isServerUp? 
          <table key='ttable'>
            <thead>
              <tr className='header-row'>
                <td>
                  <img src={'./images/doubledown-chevron.png'} className="unfold-image" alt='meaningfull text' style={{opacity: 0}}></img>
                </td>
                <td>
                  GROCERY LIST
                </td>
                <td>
                  <img src={'./images/add.png'} className="category-add-image" alt='meaningfull text' onClick={this.addNewCategory}></img>
                </td>
              </tr>
            </thead>
            <tbody key='tbody'>
              { data.categories.map((category) => (
                <React.Fragment key={category.id + 'fragment'}>
                  <CategoryRow key={'category' + category.id} category={category} redrawCallback={this.redrawCallback}></CategoryRow>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        :
        <div>
          <h3 className="info-text">
            SERVER DOWN
          </h3>
        </div>}
      </div>
    </div>
    );
  }
}

export default Table;