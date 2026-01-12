import { apiClient } from ".";

export const fetchCloudProvider = () => apiClient.get(`/cloudproviders`);
export const fetchInstanceType = (id) => apiClient.get(`/instances/${id}`);
export const fetchRegion = (id) => apiClient.get(`/gridemissions/${id}`);
export const calculateSCI = (data) => apiClient.post('/sci/calculate', data);
export const uploadMultiApp = (formData) => apiClient.post('/SCIExcelUpload/upload-template', formData, {
    headers: {
        "Content-Type": "multipart/form-data",
    },
});
//adding recommendations api call
export const getRecommendations = (recommendationPayload) => apiClient.post("/Recommendations", recommendationPayload);
export const getOptimization  = (optimizationPayload) => apiClient.post("/Optimization", optimizationPayload);


