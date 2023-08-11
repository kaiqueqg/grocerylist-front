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

export interface User{
  id?: number,
  username: string,
  password?: string,
  email?: string,
  role?: string
}