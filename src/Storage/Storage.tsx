import {  toast } from 'react-toastify';
import { UserModel } from '../Types';


type StorageKeys = {
  JwtToken: string,
  User: string,
};

const keys: StorageKeys = {
  JwtToken: '@grocerylist:jwt',
  User: '@grocerylist:user',
};

const storage = {
  getToken(): string|null{
    return localStorage.getItem(keys.JwtToken);
  },
  setToken(token: string){
    localStorage.setItem(keys.JwtToken, token);
  },
  deleteToken(){
    localStorage.removeItem(keys.JwtToken);
  },
  getUser(): UserModel|null{
    const userJson = localStorage.getItem(keys.User);
    return userJson ? JSON.parse(userJson) : null;
  },
  setUser(user: UserModel){
    localStorage.setItem(keys.User, JSON.stringify(user));
  },
  deleteUser(){
    localStorage.removeItem(keys.User)
  },
}


export default storage;