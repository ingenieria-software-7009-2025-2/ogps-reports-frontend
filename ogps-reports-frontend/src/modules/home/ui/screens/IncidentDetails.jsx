
import React, { useState, useEffect } from "react";
import { Card, Container, Row, Col, Button, Image, Alert } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { HOME_PATH } from "../../../../navigation/sitePaths";
import userApi from "../../../../network/userApi";
import { UPDATE_INCIDENT_PATH } from "../../../../navigation/sitePaths";

function IncidentDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const incident = location.state?.incident;
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("danger");
  const [showAlert, setShowAlert] = useState(false);
  const [verificationCount, setVerificationCount] = useState(0);

  if (!incident) {
    return <Container><p>Incident not found.</p></Container>;
  }

  // Debug: Verificar qué propiedades tiene el incident
  console.log("Incident object:", incident);
  console.log("Incident ID:", incident.idIncident || incident.id);

  // Cargar el contador de verificaciones al montar el componente
  useEffect(() => {
    const loadVerificationCount = async () => {
      try {
        // Usar el ID correcto del incidente
        const incidentId = incident.idIncident || incident.id;
        if (!incidentId) {
          console.error("No incident ID found in incident object");
          return;
        }

        const count = await userApi.getVerificationCount(incidentId);
        setVerificationCount(count);

        // Si ya tiene 3 o más verificaciones, mostrar mensaje automáticamente
        if (count >= 3) {
          setMessage("The incident has been verified by the community");
          setVariant("info");
          setShowAlert(true);

          // Ocultar el mensaje después de 5 segundos
          setTimeout(() => {
            setShowAlert(false);
          }, 5000);
        }
      } catch (error) {
        console.error("Error loading verification count:", error);
        setVerificationCount(0);
      }
    };

    const incidentId = incident.idIncident || incident.id;
    if (incidentId) {
      loadVerificationCount();
    }
  }, [incident]);

  const handleBack = () => {
    navigate(HOME_PATH);
  };

  const handleUpdateStatus = () => {
    navigate(UPDATE_INCIDENT_PATH, {
      state: { incident }
    });
  };

  const handleVerify = async () => {
    try {
      // Obtener el ID del incidente de forma más robusta
      const incidentId = incident.idIncident || incident.id;

      if (!incidentId) {
        console.error("No se encontró ID del incidente:", incident);
        setMessage("Error: No se pudo identificar el incidente");
        setVariant("danger");
        setShowAlert(true);
        return;
      }

      console.log("Attempting to verify incident with ID:", incidentId);

      const response = await userApi.verifyIncident(incidentId);

      // Manejar diferentes respuestas del backend
      const responseMessage = response.data;

      if (responseMessage === "Ya has verificado este incidente") {
        setMessage("You have already verified this incident previously");
        setVariant("warning");
      } else if (responseMessage === "Verificación registrada exitosamente") {
        setMessage("Successfully verified the incident");
        setVariant("success");
        // Actualizar el contador
        const newCount = verificationCount + 1;
        setVerificationCount(newCount);

        // Verificar si llegó a 3 verificaciones
        if (newCount >= 3) {
          setTimeout(() => {
            setMessage("The incident has been verified by the community");
            setVariant("info");
          }, 2000); // Mostrar el mensaje especial después de 2 segundos
        }
      } else {
        setMessage("Successfully verified the incident");
        setVariant("success");
        const newCount = verificationCount + 1;
        setVerificationCount(newCount);

        // Verificar si llegó a 3 verificaciones
        if (newCount >= 3) {
          setTimeout(() => {
            setMessage("The incident has been verified by the community");
            setVariant("info");
          }, 2000); // Mostrar el mensaje especial después de 2 segundos
        }
      }

      setShowAlert(true);

      // Ocultar el mensaje después de 5 segundos
      setTimeout(() => {
        setShowAlert(false);
      }, 5000);
    } catch (error) {
      console.error("Error verifying incident:", error);

      // Mostrar mensaje más específico del error
      let errorMessage = "Error verifying incident";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setMessage(errorMessage);
      setVariant("danger");
      setShowAlert(true);

      // Ocultar el mensaje después de 5 segundos
      setTimeout(() => {
        setShowAlert(false);
      }, 5000);
    }
  };

  return (
    <Container fluid className="pt-3">
      <Row>
        <Col lg={9}>
          <Card bg="light" className="mb-3 incident-details-card">
            <h1 className="incident-details-title">Incident Details</h1>
            <Card.Body>
              {/* Title */}
              <div className="incident-detail-section">
                <strong>Title:</strong>
                <p>{incident.title}</p>
              </div>

              {/* Date and Status */}
              <div className="d-flex justify-content-between gap-3 mb-3">
                <div className="incident-detail-section w-50">
                  <strong>Date:</strong>
                  <p>{new Date(incident.reportDate).toLocaleDateString()}</p>
                </div>
                <div className="incident-detail-section w-50">
                  <strong>Status:</strong>
                  <p>{incident.status}</p>
                </div>
              </div>

              {/* Location and Type */}
              <div className="d-flex justify-content-between gap-3 mb-3">
                <div className="incident-detail-section w-50">
                  <strong>Location:</strong>
                  <p>({incident.latitude}, {incident.longitude})</p>
                </div>
                <div className="incident-detail-section w-50">
                  <strong>Type:</strong>
                  <p>{incident.category}</p>
                </div>
              </div>

              {/* Description */}
              <div className="incident-detail-section">
                <strong>Description:</strong>
                <p>{incident.description || "No description provided."}</p>
              </div>

              {/* Images */}
              <div className="incident-detail-section">
                <strong>Images:</strong>
                {incident.evidences && incident.evidences.length > 0 ? (
                  <div className="d-flex flex-wrap justify-content-center gap-2 mt-2">
                    {incident.evidences.map((evidence) => (
                      <Image
                        key={evidence.id}
                        src={evidence.photoUrl}
                        alt="Evidence"
                        className="incident-detail-image"
                        thumbnail
                      />
                    ))}
                  </div>
                ) : (
                  <p>No images available.</p>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={3} className="d-flex align-items-center">
          <div className="incident-details-buttons w-100">
            <Button variant="dark" className="incident-details-button" onClick={handleBack}>
              Back to map
            </Button>
            <Button variant="dark" className="incident-details-button" onClick={handleUpdateStatus}>
              Update Status
            </Button>
            {incident.status !== "Resolved" && (
              <>
                {/* Solo mostrar el botón de verificar si no ha llegado a 3 verificaciones */}
                {verificationCount < 3 && (
                  <Button variant="dark" className="incident-details-button" onClick={handleVerify}>
                    Verify Incident
                  </Button>
                )}

                {/* Contador de verificaciones */}
                <div className="text-center mt-2 mb-2">
                  <small className="text-muted">
                    Verified {verificationCount} time{verificationCount !== 1 ? 's' : ''}
                    {verificationCount >= 3 && (
                      <span className="text-success d-block fw-bold">
                        ✓ Verified by Community
                      </span>
                    )}
                  </small>
                </div>

                {/* Mensaje de verificación */}
                {showAlert && (
                  <Alert variant={variant} className="mt-2 mb-2" style={{ fontSize: '0.85rem', padding: '0.5rem' }}>
                    {message}
                  </Alert>
                )}
              </>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default IncidentDetails;