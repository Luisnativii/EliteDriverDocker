import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

const api = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(response => response, error => {
  if (axios.isCancel(error)) return Promise.reject(error);
  const body = error.response?.data;
  const message = body?.fields ? Object.values(body.fields).join(' ') : body?.message || body?.error;
  return Promise.reject(new Error(message || 'No se pudo completar la consulta. Intenta nuevamente.'));
});
export const getSuppliers = async () => (await api.get('/admin/suppliers')).data;
export const saveSupplier = async (id, data) => (await (id ? api.put(`/admin/suppliers/${id}`,data) : api.post('/admin/suppliers',data))).data;
export const deleteSupplier = async id => { await api.delete(`/admin/suppliers/${id}`); };
export const getCustomers = async (params, signal) => (await api.get('/admin/customers',{params,signal})).data;
export const getCustomerHistory = async (id, params, signal) => (await api.get(`/admin/customers/${id}/reservations`,{params,signal})).data;
