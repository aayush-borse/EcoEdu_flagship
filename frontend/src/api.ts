// frontend/src/api.ts
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:5000',  // must match your Flask server
  headers: { 'Content-Type': 'application/json' },
});

export default API;
