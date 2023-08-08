import React from 'react';
import { Item, Category } from '../../Types';
import './CategoryRow.css';
import { toast } from 'react-toastify';
import request from '../../Requests/RequestFactory'
import ItemRow from '../Item/ItemRow';
import Loading from '../../Loading/Loading';

interface Props{
  category: Category,
  redrawCallback: () => void,
  baseUrl: string
}

interface States{
  category: Category,
  isEditing: boolean,
  isDeleting: boolean,
  textValue: string,
  isSavingText: boolean,
  isCreatingNewItem: boolean,
  isRequestingItems: boolean,
  items: Item[]
}

class CategoryRow extends React.Component<Props, States>{
  constructor(props: Props){

    super(props);
    this.state = {
      category: props.category,
      isEditing: false,
      isDeleting: false,
      textValue: props.category.text,
      isSavingText: false,
      isCreatingNewItem: false,
      isRequestingItems: false,
      items: []
    };
  }

  componentDidMount(): void {
    if(this.state.category.isOpen) this.getItemList();
  }

  displayConfirmDeleteRow = () => {
    if( this.state.items.length > 0){
      toast.warning('Are you sure?', {
        closeButton: <button className='btn btn-warning' onClick={this.deleteCategory} style={{marginTop: '5px', marginBottom: '5px'}}>YES</button>,
        autoClose: 5000,
        draggable: false,
        pauseOnHover: false,
      });
    }
    else{
      this.deleteCategory();
    }
  }

  deleteCategory = async () => {    
    this.setState({ isDeleting: true });
    const response = await request(this.props.baseUrl + '/DeleteCategory', 'DELETE', JSON.stringify(this.state.category));
  
    if(response !== undefined && response.ok){
      this.props.redrawCallback();
    }
    else{
      toast('Delete item went wrong!');
    }

    setTimeout(() => {
      this.setState({ isDeleting: false });
    }, 1000); 
  }

  handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ textValue: event.target.value });
  }

  handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    const { category } = this.state;
    const newText: string = this.state.textValue.toUpperCase().trim();
    const inputElement = event.target as HTMLInputElement;

    if(event.key === 'Enter'){
      if(category.text !== newText) {
        this.setState({ isSavingText: true })
        const response = await request(this.props.baseUrl + '/PatchCategory', 'PATCH', JSON.stringify({...category, text: newText}), () => {
          toast.warning("There was a problem trying to modify the category name, server may be down.", { autoClose: 10000 });
        });

        if(response !== undefined && response.ok){
          this.updateItemsDisplay();
          this.setState({
            category: {...category, text: newText},
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
          textValue: category.text,
          isEditing: false
        }, () => {
          inputElement.blur();
        });
      }
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

  handleInputBlur = (event: any) => {
    const inputElement = event.target as HTMLInputElement;
    this.setState({
      isEditing: false
    }, () => {
      inputElement.blur();
    });
  }

  addNewItem = async () => {
    const { category } = this.state;

    if(!category.isOpen) this.changeItemsDisplay();

    const emptyItem: Item = {
      id: '',
      text: '',
      isChecked: false,
      myCategory: category.id
    }

    this.setState({ isCreatingNewItem: true });

    const response = await request(this.props.baseUrl + '/PutItem', 'PUT', JSON.stringify(emptyItem), () => {
      toast.warning("There was a problem trying to create a new item, server may be down.")
    });

    if(response !== undefined && response.ok){
      this.updateItemsDisplay();
    }

    setTimeout(() => {
      this.setState({ isCreatingNewItem: false });
    }, 500);
  }

  updateItemsDisplay = async () => {
    const { category } = this.state;

    this.setState({
      isRequestingItems: true
    }, async () =>{
      const response = await request(this.props.baseUrl + '/GetItemListInCategory?categoryId='+ category.id, 'GET');

      if(response !== undefined && response.ok){
        const items = await response.json();

        this.setState({
          isRequestingItems: false,
          items
        });
      }
      else{
        //toast(response);
      }
    });
  }

  getItemList = async () => {
    const { category } = this.state;

    this.setState({
      isRequestingItems: true
    }, async () =>{
      const response = await request(this.props.baseUrl + '/GetItemListInCategory?categoryId=' + category.id, 'GET');

      if(response !== undefined && response.ok){
        const items = await response.json();

        this.setState({
          isRequestingItems: false,
          items
        });
      }
      else{
        //toast(response);
      }
    });
  }

  changeItemsDisplay = async () => {
    const { category } = this.state;
    const newState = !category.isOpen;
    const response = await request(this.props.baseUrl + '/PatchCategory', 'PATCH', JSON.stringify({...category, isOpen: newState}))

    if(response != null){
      if(response.ok){
        const newCategory = await response.json();

        this.setState({
          category: newCategory
        }, () => {
          if(this.state.category.isOpen){
            this.getItemList();
          }
          else{
            this.setState({ items: [] })
          }
        })
      }
      else{
        toast.error('Error...');
      }
    }
  }

  render(): React.ReactNode {
    const { 
      category,
      isEditing,
      isDeleting,
      textValue,
      isSavingText,
      isCreatingNewItem,
      isRequestingItems,
      items } = this.state;
    return(
      <React.Fragment>
        <tr className='category-row' >
          <td>
            {category.isOpen ?
              <img src={'./images/down-chevron.png'} className="unfold-image" alt='meaningfull text' onClick={this.changeItemsDisplay}></img>
              :
              <img src={'./images/up-chevron.png'} className="fold-image" alt='meaningfull text' onClick={this.changeItemsDisplay}></img>
            }
          </td>
          {!isEditing ? 
            <td onClick={this.handleRowClick}>
              {(isSavingText ?
              <Loading></Loading>
              :
              <h3 className='category-row-text'>{category.text.toUpperCase()}</h3>)}
            </td>
            :
            <td>
              <input className='form-control category-row-input' type='text' value={textValue.toUpperCase()} onChange={this.handleInputChange} onKeyDown={this.handleKeyDown} autoFocus></input>
            </td>
          }
          <td>
            {isEditing && !isDeleting && <img src={'./images/trash.png'} className="trash-image" alt='meaningfull text' onClick={this.displayConfirmDeleteRow}></img>}
            {isEditing && isDeleting && <Loading></Loading>}
            {category.isOpen && !isEditing && 
              (isCreatingNewItem ? 
                <Loading></Loading>
                :
                <img src={'./images/add.png'} className="add-image" alt='meaningfull text' onClick={this.addNewItem}></img>)
            }
            {!category.isOpen && !isEditing && <img src={'./images/add.png'} className="add-image" alt='meaningfull text' onClick={this.addNewItem}></img>}
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
          items.map((item: Item, index: number) => (<ItemRow key={'item' + item.id} item={item} baseUrl={this.props.baseUrl} updateItemsDisplay={this.updateItemsDisplay} isPair={index % 2===0}></ItemRow>)))}
      </React.Fragment>
    );
  }
}

export default CategoryRow