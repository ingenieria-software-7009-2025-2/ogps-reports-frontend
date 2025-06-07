import axios from "axios";

const userApiInstance = axios.create({
  baseURL: "http://localhost:8080/v1",
});

const userApi = {
  login: (credentials) =>
    userApiInstance.post("/users/login", credentials, {
      headers: { "Content-Type": "application/json" },
    }),
  logout: () => {
    const token = localStorage.getItem("authToken");
    return userApiInstance
      .post("/users/logout", null, {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      })
      .finally(() => {
        localStorage.removeItem("authToken");
      });
  },
  register: (userData) =>
    userApiInstance.post("/users", userData, {
      headers: { "Content-Type": "application/json" },
    }),
  updateInfo: (userData) => {
    const token = localStorage.getItem("authToken");
    return userApiInstance.put("/users/me", userData, {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    });
  },
  getMe: () => {
    const token = localStorage.getItem("authToken");
    return userApiInstance.get("/users/me", {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    });
  },
  checkUsername: (username) =>
    userApiInstance.get(`/users/check-username?username=${username}`, {
      headers: { "Content-Type": "application/json" },
    }),
  checkEmail: (email) =>
    userApiInstance.get(`/users/check-email?email=${email}`, {
      headers: { "Content-Type": "application/json" },
    }),
  reportIncident: (incidentData, photos) => {
    const token = localStorage.getItem("authToken");
    const formData = new FormData();
    formData.append("incident", JSON.stringify(incidentData));
    console.log("Incident data being sent:", incidentData);
    if (photos && photos.length > 0) {
      photos.forEach((photo, index) => {
        formData.append("photos", photo);
        console.log(`Photo ${index}:`, photo.name, photo.size, photo.type);
      });
    } else {
      console.log("No photos attached");
    }

    return userApiInstance.post("/incidents", formData, {
      headers: {
        Authorization: `${token}`,
      },
    });
  },
  getReportedIncidents: () => {
    const token = localStorage.getItem("authToken");
    return userApiInstance.get("/incidents/my-reports", {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    });
  },
  deleteIncident: (incidentId) => {
    const token = localStorage.getItem("authToken");
    return userApiInstance.delete(`/incidents/${incidentId}`, {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    });
  },
  getAllIncidents: () => {
    const token = localStorage.getItem('authToken');
    return userApiInstance.get("/incidents/all", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  },
  getNearbyIncidents: (latitude, longitude, radius = 5.0) => {
    const token = localStorage.getItem('authToken');
    return userApiInstance.get("/incidents/nearby", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        latitude,
        longitude,
        radius
      }
    });
  },
  getIncidentsByCategories: (categories) => {
      return userApiInstance.get("/incidents/filter", {
        params: { categories },
        paramsSerializer: (params) => {
          // Serializar el array de categorías para que se envíe como múltiples parámetros
          return Object.entries(params)
            .flatMap(([key, values]) =>
              Array.isArray(values)
                ? values.map((value) => `${key}=${encodeURIComponent(value)}`)
                : `${key}=${encodeURIComponent(values)}`
            )
            .join("&");
        },
      });
    },

    getAvailableCategories: () => {
      return userApiInstance.get("/incidents/categories");
    },

    // Nuevo método para verificar incidentes
    verifyIncident: async (incidentId) => {
      const token = localStorage.getItem("authToken");

      if (!incidentId) {
        throw new Error("Incident ID is required");
      }

      try {
        // Primero obtenemos los datos del usuario para conseguir su ID
        const userResponse = await userApiInstance.get("/users/me", {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        });

        const userId = userResponse.data.id;

        // Ahora hacemos la verificación del incidente
        const response = await userApiInstance.post(`/incidents/${incidentId}/verify`,
          {
            idUser: userId
          }, {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        });

        return response;
      } catch (error) {
        console.error("Error in verifyIncident:", error.response?.data || error.message);
        throw error;
      }
    },

    // Nuevo método para obtener el contador de verificaciones
    getVerificationCount: async (incidentId) => {
      const token = localStorage.getItem("authToken");

      if (!incidentId) {
        console.error("Incident ID is required for getVerificationCount");
        throw new Error("Incident ID is required");
      }

      try {
        console.log(`Fetching verification count for incident: ${incidentId}`);
        const response = await userApiInstance.get(`/incidents/${incidentId}/verification-count`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log(`Verification count response:`, response.data);

        // Asegurarse de que retornamos un número
        const count = typeof response.data === 'number' ? response.data : parseInt(response.data) || 0;
        console.log(`Parsed verification count: ${count}`);

        return count;
      } catch (error) {
        console.error("Error getting verification count:", error.response?.data || error.message);
        console.error("Full error object:", error);

        // Si el endpoint no existe (404) o hay otro error, retornamos 0
        if (error.response?.status === 404) {
          console.log("Verification count endpoint not found, returning 0");
          return 0;
        }

        // Para otros errores, también retornamos 0 pero logueamos más detalles
        console.log("Returning 0 due to error");
        return 0;
      }
    },
};

export default userApi;