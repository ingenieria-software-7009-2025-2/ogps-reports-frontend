import { Card, Container, Stack, Button, Form, Row, Col, Alert } from "react-bootstrap";
import { useState } from "react";
import userApi from "../../../../network/userApi";

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
  const [photos, setPhotos] = useState([]);

  // Categorías válidas según tu backend
  const categories = [
    "Potholes and Defects",
    "Street Lighting",
    "Traffic Accidents",
    "Obstacles",
    "Other",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage(""); // Limpiar mensajes previos

    const incidentData = {
      category,
      title,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      reportDate: new Date(reportDate),
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
      })
      .catch((error) => {
        setVariant("danger");
        setMessage(
          "Error reporting incident: " +
            (error.response?.data?.message || error.message)
        );
      });
  };

  return (
    <Container fluid className="pt-3">
      <Row>
        {/* Área del mapa (placeholder por ahora) */}
        <Col lg={8}>
          <Card bg="light" className="mb-3">
            <Card.Title>Map</Card.Title>
            <Card.Body>Map placeholder</Card.Body>
          </Card>
        </Col>

        {/* Botones y formulario a la derecha */}
        <Col lg={4}>
          <Stack gap={2}>
            <Button variant="dark" disabled>
              Incidentes reportados
            </Button>
            <Button
              variant="dark"
              onClick={() => setShowForm(!showForm)}
            >
              Registrar nuevo incidente
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
                    <Form.Label>Attach evidence</Form.Label>
                    <Form.Control
                      type="file"
                      multiple
                      onChange={(e) => setPhotos(Array.from(e.target.files))}
                      accept="image/*"
                    />
                  </Form.Group>

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