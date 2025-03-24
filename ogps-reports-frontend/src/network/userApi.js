import axios from "axios";

const userApiInstance = axios.create({
  baseURL: "http://localhost:8080/v1", // Base URL para todas las solicitudes
  headers: {
    "Content-Type": "application/json",
  },
});
// Definir funciones específicas para la API
const userApi = {
  login: (credentials) => userApiInstance.post("/users/login", credentials),  
  logout: () => {
    const token = localStorage.getItem("authToken");
    return userApiInstance.post("/users/logout", {
      headers: { Authorization: `${token}` },
    });
  },
  //crear funciones que faltan para los  demas endpoints
  register: (userData) => {
      return axios.post(`${API_URL}/users`, userData); // Ajusta el endpoint según tu backend
    },
};

export default userApi;