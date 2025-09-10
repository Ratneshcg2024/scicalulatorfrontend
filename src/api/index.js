import axios from 'axios';

export const apiClient = axios.create({
   // baseURL: 'http://localhost:5153/api',
    baseURL: 'https://scicalculatorbackend.azurewebsites.net/api',
    headers:{ 'Content-Type': 'application/json' },
});