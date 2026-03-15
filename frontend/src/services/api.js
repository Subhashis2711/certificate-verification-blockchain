import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000/api"
});

export const getCertificatesApi = async (organizationId) => {
  const response = await API.get(`/certificates?organizationId=${organizationId}`);
  return response.data;
};

export const issueCertificateApi = (data) =>
  API.post("/issue", data, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

export const verifyCertificateApi = (data) =>
  API.post("/verify", data, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

export const revokeCertificateApi = (data) =>
  API.post("/revoke", data);