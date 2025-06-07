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

    // Método para verificar incidentes - CORREGIDO
    verifyIncident: async (incidentId) => {
      const token = localStorage.getItem("authToken");

      // Validación mejorada del incidentId
      if (!incidentId || incidentId === undefined || incidentId === null) {
        console.error("Invalid incident ID provided:", incidentId);
        throw new Error("Valid Incident ID is required");
      }

      // Convertir a string para asegurar que sea válido
      const validIncidentId = String(incidentId).trim();

      if (!validIncidentId || validIncidentId === "undefined" || validIncidentId === "null") {
        console.error("Invalid incident ID after validation:", validIncidentId);
        throw new Error("Valid Incident ID is required");
      }

      console.log("Verifying incident with ID:", validIncidentId);

      try {
        // Primero obtenemos los datos del usuario para conseguir su ID
        const userResponse = await userApiInstance.get("/users/me", {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        });

        const userId = userResponse.data.id;
        console.log("User ID for verification:", userId);

        // Ahora hacemos la verificación del incidente
        const response = await userApiInstance.post(`/incidents/${validIncidentId}/verify`,
          {
            idUser: userId
          }, {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Verification response:", response.data);
        return response;
      } catch (error) {
        console.error("Error in verifyIncident:", error.response?.data || error.message);

        // Proporcionar mensaje de error más específico
        if (error.response?.status === 400) {
          throw new Error(error.response.data.message || "Bad request - check incident ID");
        } else if (error.response?.status === 404) {
          throw new Error("Incident not found");
        } else if (error.response?.status === 401) {
          throw new Error("Authentication required");
        } else {
          throw new Error(error.response?.data?.message || "Failed to verify incident");
        }
      }
    },

    // Método para obtener el contador de verificaciones - CORREGIDO
    getVerificationCount: async (incidentId) => {
      const token = localStorage.getItem("authToken");

      // Validación mejorada del incidentId
      if (!incidentId || incidentId === undefined || incidentId === null) {
        console.error("Invalid incident ID provided to getVerificationCount:", incidentId);
        throw new Error("Valid Incident ID is required");
      }

      // Convertir a string para asegurar que sea válido
      const validIncidentId = String(incidentId).trim();

      if (!validIncidentId || validIncidentId === "undefined" || validIncidentId === "null") {
        console.error("Invalid incident ID after validation:", validIncidentId);
        throw new Error("Valid Incident ID is required");
      }

      try {
        console.log(`Fetching verification count for incident: ${validIncidentId}`);
        const response = await userApiInstance.get(`/incidents/${validIncidentId}/verification-count`, {
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

    updateIncidentStatus: (incidentId, updateData, photos = []) => {
      const token = localStorage.getItem("authToken");
      const formData = new FormData();
      
      // Agregar los datos de actualización
      formData.append('status', updateData.status);
      if (updateData.description) {
        formData.append('description', updateData.description);
      }
      
      // Agregar las fotos si existen
      if (photos && photos.length > 0) {
        photos.forEach((photo, index) => {
          formData.append('photos', photo);
          console.log(`Photo ${index}:`, photo.name, photo.size, photo.type);
        });
      } else {
        console.log("No photos attached for status update");
      }

      return userApiInstance.put(`/incidents/${incidentId}/status`, formData, {
        headers: {
          Authorization: `${token}`,
        },
      });
    },
};

export default userApi;