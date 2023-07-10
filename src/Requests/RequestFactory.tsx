import {  toast } from 'react-toastify';

// const baseUrl = process.env.GROCERYLIST_PATH;
const baseUrl = process.env.GROCERYLIST_API_PATH + "/api";

const errors = [400, 404, 409, 500, 503]

async function request(
  endpoint: string, 
  method: string, 
  body?: string,
  fError?: () => void): Promise<any>
{
  const headers: {[key: string]: string} = {};
  headers['Content-Type'] = 'application/json';

  const token = localStorage.getItem('jwt');
  if(token !== null) headers['Authorization'] = "Bearer " + token;

  try {
    const response = await fetch(baseUrl + endpoint, {
      headers,
      method,
      mode: 'cors',
      body: body
    });
    if(response !== undefined && errors.includes(response.status)){
      const message = await response.text();
      toast.warning(message, { autoClose: 10000});
    }

    return response;
  } catch (error) {
    if(fError !== undefined) fError();
    else toast.error("Untreated error...", { autoClose: 5000 });
    return undefined;
  }
}

export default request;