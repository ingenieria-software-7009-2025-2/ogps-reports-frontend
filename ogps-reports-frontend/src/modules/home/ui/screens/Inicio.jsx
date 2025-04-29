import { Card, Container, Stack, Button, Form, Row, Col, Alert, Image } from "react-bootstrap";
import { useState } from "react";
import userApi from "../../../../network/userApi";
import { useEffect } from "react";

function Inicio() {
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("danger");
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]); // Array de archivos de imágenes
  const [photoPreviews, setPhotoPreviews] = useState([]); // Array de URLs para vista previa
  const [nearbyIncidents, setNearbyIncidents] = useState([]); // Estado para almacenar incidentes cercanos
  const [userLocation, setUserLocation] = useState(null); // Almacenar la ubicación del usuario
  const [searchRadius, setSearchRadius] = useState(5.0); // Radio de búsqueda en kilómetros
  const marcadores = [{
      id: 1,
      title: "Bache en la calle",
      latitude: 19.4336,
      longitude: -99.1342,
      category: "Potholes",
      description: "Bache profundo en la esquina de la calle",
      status: "Pendiente",
      reportDate: "2025-04-20"
      }
      ]
  const categories = [
    "Potholes and Defects",
    "Street Lighting",
    "Traffic Accidents",
    "Obstacles",
    "Other",
  ];

  // Obtener la fecha actual en formato YYYY-MM-DD
  const today = new Date();
  const maxDate = today.toISOString().split("T")[0]; // Formato YYYY-MM-DD

  // Manejar la selección de imágenes
  const handlePhotoChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setPhotos(selectedFiles);

    // Generar URLs para la vista previa
    const previews = selectedFiles.map((file) => URL.createObjectURL(file));
    setPhotoPreviews(previews);
  };

  // Eliminar una imagen de la lista
  const handleRemovePhoto = (index) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    const updatedPreviews = photoPreviews.filter((_, i) => i !== index);

    // Liberar las URLs de vista previa para evitar fugas de memoria
    photoPreviews.forEach((preview, i) => {
      if (i === index) {
        URL.revokeObjectURL(preview);
      }
    });

    setPhotos(updatedPhotos);
    setPhotoPreviews(updatedPreviews);
  };

  // Función para cargar incidentes cercanos
  const loadNearbyIncidents = (lat, lng, radius) => {
    userApi.getNearbyIncidents(lat, lng, radius)
      .then(response => {
        setNearbyIncidents(response.data);
        setVariant("success");
        setMessage(`Loaded ${response.data.length} nearby incidents`);
        
        // Actualizar marcadores en el mapa
        if (window.google && window.map) {
          // Limpiamos los marcadores existentes (excepto el de ubicación del usuario)
          agregarMarcadores(window.map, response.data);
        }
      })
      .catch(error => {
        setVariant("danger");
        setMessage("Error loading nearby incidents: " + 
          (error.response?.data?.message || error.message));
      });
  };

  // Función para obtener la ubicación actual del usuario
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          setLatitude(lat.toFixed(6));
          setLongitude(lng.toFixed(6));
          
          // Cargar incidentes cercanos a la ubicación actual
          loadNearbyIncidents(lat, lng, searchRadius);
          
          // Centrar el mapa en la ubicación actual
          if (window.map) {
            window.map.setCenter({ lat, lng });
            
            // Agregar marcador para la ubicación del usuario
            new window.google.maps.Marker({
              position: { lat, lng },
              map: window.map,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 7,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "#FFFFFF",
                strokeWeight: 2,
              },
              title: "Your Location"
            });
          }
        },
        (error) => {
          setVariant("warning");
          setMessage("Error obtaining location: " + error.message);
        }
      );
    } else {
      setVariant("warning");
      setMessage("Geolocation is not supported by this browser");
    }
  };

  // Manejar cambio de radio de búsqueda
  const handleRadiusChange = (e) => {
    const newRadius = parseFloat(e.target.value);
    setSearchRadius(newRadius);
    
    // Si tenemos la ubicación del usuario, actualizar la búsqueda
    if (userLocation) {
      loadNearbyIncidents(userLocation.lat, userLocation.lng, newRadius);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(""); // Limpiar mensajes previos

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    // Validación de latitud y longitud
    if (isNaN(lat) || lat < -90 || lat > 90) {
      setVariant("danger");
      setMessage("Latitude must be a number between -90 and 90");
      return;
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
      setVariant("danger");
      setMessage("Longitude must be a number between -180 and 180");
      return;
    }

    // Validación de que se haya seleccionado al menos una foto
    if (photos.length === 0) {
      setVariant("danger");
      setMessage("At least one photo is required");
      return;
    }

    // Validación de la fecha: no puede ser posterior a la fecha actual
    const selectedDate = new Date(reportDate);
    if (selectedDate > today) {
      setVariant("danger");
      setMessage("Report date cannot be in the future");
      return;
    }

    const incidentData = {
      category,
      title,
      latitude: lat,
      longitude: lon,
      reportDate: selectedDate,
      description,
    };

    userApi
      .reportIncident(incidentData, photos)
      .then((response) => {
        setVariant("success");
        setMessage("Incident reported successfully");
        setShowForm(false); // Ocultar el formulario
        // Limpiar los campos
        setCategory("");
        setTitle("");
        setLatitude("");
        setLongitude("");
        setReportDate("");
        setDescription("");
        setPhotos([]);
        setPhotoPreviews([]);
        // Liberar todas las URLs de vista previa
        photoPreviews.forEach((preview) => URL.revokeObjectURL(preview));
        
        // Recargar incidentes cercanos si tenemos la ubicación del usuario
        if (userLocation) {
          loadNearbyIncidents(userLocation.lat, userLocation.lng, searchRadius);
        }
      })
      .catch((error) => {
        setVariant("danger");
        setMessage(
          "Error reporting incident: " +
            (error.response?.data?.message || error.message)
        );
      });
  };

  // Función para agregar marcadores al mapa
  function agregarMarcadores(mapa, incidentes) {
    // Limpiar marcadores existentes (excepto el de ubicación)
    if (window.markers) {
      window.markers.forEach(marker => marker.setMap(null));
    }
    
    // Array para almacenar los nuevos marcadores
    window.markers = [];
    
    incidentes.forEach((incidente) => {
      const marcador = new google.maps.Marker({
        position: { lat: incidente.latitude, lng: incidente.longitude },
        map: mapa,
      });
      
      window.markers.push(marcador);

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div>
            <strong>Title:</strong> ${incidente.title || 'No title'}<br/>
            <strong>Category:</strong> ${incidente.category}<br/>
            <strong>Status:</strong> ${incidente.status || 'Pending'}<br/>
            <strong>Date:</strong> ${new Date(incidente.reportDate).toLocaleDateString()}<br/>
            ${incidente.description ? `<strong>Description:</strong> ${incidente.description}` : ''}
          </div>
        `
      });

      marcador.addListener("click", () => {
        infoWindow.open(mapa, marcador);
      });
    });
  }

  // Inicializar el mapa 
  useEffect(() => {
    if (!window.google) {
      console.error("Google Maps no ha cargado aún.");
      return;
    }

    const map = new window.google.maps.Map(document.getElementById("map"), {
      center: { lat: 19.4326, lng: -99.1332 },
      zoom: 12,
    });
    
    // Guardar el mapa en una variable global para acceder a él en otras funciones
    window.map = map;
    window.markers = [];

    // Inicialmente agregar los marcadores existentes
    agregarMarcadores(map, marcadores);
  
    let marker = null;
  
    // Evento cuando el usuario hace clic en el mapa
    map.addListener("click", (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
  
      // Si ya hay un marcador, lo movemos
      if (marker) {
        marker.setPosition({ lat, lng });
      } else {
        // Si no hay marcador, creamos uno nuevo
        marker = new window.google.maps.Marker({
          position: { lat, lng },
          map: map,
          draggable: false,
        });
      }
  
      // Actualizar los campos de lat/lng del formulario
      setLatitude(lat.toFixed(6));   // 6 decimales como estándar
      setLongitude(lng.toFixed(6));
      
      // Cargar incidentes cercanos a la posición clickeada
      loadNearbyIncidents(lat, lng, searchRadius);
    });
    
    // Intentar obtener la ubicación actual del usuario
    getCurrentLocation();
  }, []);

  return (
    <Container fluid className="pt-3">
      <Row>
        {/* Área del mapa (placeholder por ahora) */}
        <Col lg={8}>
          <Card bg="light" className="mb-3">
            <Card.Title>Map</Card.Title>
            <Card.Body>
              <div id="map" style={{ height: "500px", width: "100%" }}></div>
              <div className="mt-2">
                <Button variant="info" onClick={getCurrentLocation} className="me-2">
                  Get My Location
                </Button>
                <Form.Label className="me-2">Search Radius (km):</Form.Label>
                <Form.Control
                  type="number"
                  min="0.5"
                  max="20"
                  step="0.5"
                  value={searchRadius}
                  onChange={handleRadiusChange}
                  style={{ width: "100px", display: "inline-block" }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Botones y formulario a la derecha */}
        <Col lg={4}>
          <Stack gap={2}>
            <Button 
              variant="dark" 
              onClick={() => {
                if (nearbyIncidents.length > 0) {
                  setVariant("info");
                  setMessage(`Showing ${nearbyIncidents.length} nearby incidents on the map`);
                } else if (userLocation) {
                  loadNearbyIncidents(userLocation.lat, userLocation.lng, searchRadius);
                } else {
                  setVariant("warning");
                  setMessage("Please get your location first or click on the map");
                }
              }}
            >
              Reported Incidents ({nearbyIncidents.length})
            </Button>
            <Button variant="dark" onClick={() => setShowForm(!showForm)}>
              Register New Incident
            </Button>

            {showForm && (
              <Card bg="light" className="p-3">
                <Card.Title>New Incident</Card.Title>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Type of incident</Form.Label>
                    <Form.Select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Latitude</Form.Label>
                    <Form.Control
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Longitude</Form.Label>
                    <Form.Control
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Report date</Form.Label>
                    <Form.Control
                      type="date"
                      value={reportDate}
                      onChange={(e) => setReportDate(e.target.value)}
                      max={maxDate}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Attach evidence (at least one photo required)</Form.Label>
                    <Form.Control
                      type="file"
                      multiple
                      onChange={handlePhotoChange}
                      accept="image/*"
                      required
                    />
                  </Form.Group>

                  {/* Vista previa de las imágenes seleccionadas */}
                  {photoPreviews.length > 0 && (
                    <div className="mb-3">
                      <h6>Selected Images:</h6>
                      <Row>
                        {photoPreviews.map((preview, index) => (
                          <Col xs={6} md={4} key={index} className="mb-2">
                            <div className="position-relative">
                              <Image
                                src={preview}
                                thumbnail
                                style={{ maxWidth: "100px", maxHeight: "100px" }}
                              />
                              <Button
                                variant="danger"
                                size="sm"
                                className="position-absolute top-0 end-0"
                                onClick={() => handleRemovePhoto(index)}
                              >
                                X
                              </Button>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}

                  <Button variant="primary" type="submit">
                    Create
                  </Button>
                </Form>
              </Card>
            )}

            {message && (
              <Alert variant={variant} className="mt-3">
                {message}
              </Alert>
            )}
          </Stack>
        </Col>
      </Row>
    </Container>
  );

}

export default Inicio;