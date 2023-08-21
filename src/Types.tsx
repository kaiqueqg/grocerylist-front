export interface GroceryList{
  categories: Category[]
}

export interface Category{
  id: string,
  text: string,
  isOpen: boolean
}

export interface Item{
  id: string,
  text: string,
  isChecked: boolean,
  myCategory: string,
  quantity: number,
  quantityUnit: string,
  goodPrice: string,
}

export interface UserPrefsModel{
  shouldCreateNewItemWhenCreateNewCategory: boolean,
  hideQuantity: boolean,
}

export interface UserModel{
  id?: number,
  username: string,
  password?: string,
  userPrefs: UserPrefsModel,
}

export interface LoginModel{
  user?: UserModel,
  token: string,
  errorMessage: string,
}