import { UserModel } from '../Types';


type StorageKeys = {
  JwtToken: string,
  User: string,
  BaseUrl: string,
};

const keys: StorageKeys = {
  JwtToken: '@grocerylist:jwt',
  User: '@grocerylist:user',
  BaseUrl: '@grocerylist:baseurl',
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
  getBaseUrl() : string{
    const value = localStorage.getItem(keys.BaseUrl);
    if(value === null) return 'http://localhost:5000/api'
    else return value;
  },
  setBaseUrl(baseUrl: string) {
    localStorage.setItem(keys.BaseUrl, baseUrl);
  },
}


export default storage;