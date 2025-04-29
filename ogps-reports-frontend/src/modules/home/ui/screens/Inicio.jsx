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
  const marcadores = [{
      id: 1,
      title: "Bache en la calle",
      latitude: 19.4336,
      longitude: -99,1342,
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
      })
      .catch((error) => {
        setVariant("danger");
        setMessage(
          "Error reporting incident: " +
            (error.response?.data?.message || error.message)
        );
      });
  };

  // Inicializar el mapa 
  useEffect(() => {
    if (!window.google) {
      console.error("Google Maps no ha cargado aún.");
      return;
    }

    function agregarMarcadores(mapa, incidentes) {
        incidentes.forEach(incidente =>{
            const marcador = new google.maps.Marker({
                posicion: {lat: incidente.latitude, lng: incidente.longitude},}
                mapa: mapa,
                });
            }
            );
        }
  
    const map = new window.google.maps.Map(document.getElementById("map"), {
      center: { lat: 19.4326, lng: -99.1332 },
      zoom: 12,

    });
  
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
    });
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
            </Card.Body>
          </Card>
        </Col>

        {/* Botones y formulario a la derecha */}
        <Col lg={4}>
          <Stack gap={2}>
            <Button variant="dark" disabled>
              Reported Incidents
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