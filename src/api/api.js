// //import axios from "axios";

// const API_URL = "http://localhost:5153/api/"; // Adjust based on your .NET API

// export const getCloudProviders = async () => {
//     return await fetch(`${API_URL}CloudProviders`).then((res) => res.json());
//   };
  
//   export const getInstanceTypes = async (providerId) => {
//     return await fetch(`${API_URL}instances/${providerId}`).then((res) => res.json());
//   };
  
//   export const getGridEmissions = async (providerId) => {
//     return await fetch(`${API_URL}gridemissions/${providerId}`).then((res) => res.json());
//   };
  
//   export const calculateSCI = async (payload) => {
//     return await fetch("http://localhost:5153/api/sci/calculate", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     }).then((res) => res.json());
//   };
  
import axios from "axios";

const API_URL = "http://localhost:5153/api/"; // Adjust based on your .NET API

// ✅ Cloud APIs

// Fetch cloud providers for the first select box
export const getCloudProviders = () => axios.get(`${API_URL}CloudProviders`);

// Fetch grid emissions for the selected provider
export const getGridEmissions = (providerId) =>
  axios.get(`${API_URL}gridemissions/${providerId}`);

// Fetch instance types based on the selected provider
export const getInstanceTypes = (cloudProviderId) =>
  axios.get(`${API_URL}instances/${cloudProviderId}`);

// Fetch vCPU options for a specific instance type
// export const getVcpuOptions = async (instanceId) => {
//   try {
//     const response = await fetch(`${API_URL}instances/cpucores/${instanceId}`);
//     const data = await response.json();
//     return { data }; // Wrap in object to match axios-style response
//   } catch (err) {
//     console.error("Error fetching vCPUs:", err);
//     return { data: 0 };
//   }
// };

// Calculate SCI for cloud deployment
export const calculateSCI = async (userInputData) => {
  try {
    const response = await fetch(`${API_URL}sci/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userInputData),
    });

    const data = await response.json();
    console.log("Cloud SCI API Response:", data);
    return data;
  } catch (error) {
    console.error("Error calculating Cloud SCI:", error);
    return null;
  }
};

// fetch hardware vendors
export const getHardwareVendors = () => axios.get(`${API_URL}hardwarevendor`);


//fetch cpuinfo
export const getCpuInfo = (vendorId) =>
    axios.get(`${API_URL}cpuinfo/${vendorId}`);

//fetch countrygridemissions
export const getCoutnryGridEmission = () => axios.get(`${API_URL}countrygridemissions`);


// ✅ On-Premise SCI Calculation (add this if needed)
export const calculateOnPremSCI = async (userInputData) => {
  try {
    const response = await fetch(`${API_URL}sci/calculate-onprem`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userInputData),
    });

    const data = await response.json();
    console.log("On-Prem SCI API Response:", data);
    return data;
  } catch (error) {
    console.error("Error calculating On-Prem SCI:", error);
    return null;
  }
};
