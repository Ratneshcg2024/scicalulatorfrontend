import { apiClient } from ".";

export const fetchCloudProvider = () => apiClient.get(`/cloudproviders`);
export const fetchInstanceType = (id) => apiClient.get(`/instances/${id}`);
export const fetchRegion = (id) => apiClient.get(`/gridemissions/${id}`);
export const calculateSCI = (data) => apiClient.post('/sci/calculate', data);