import React, { useState, useEffect } from "react";
import { Card, Container, Row, Col, Button, Image, Alert } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { HOME_PATH } from "../../../../navigation/sitePaths";
import userApi from "../../../../network/UserApi";
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

  // Cargar el contador de verificaciones al montar el componente
  useEffect(() => {
    const loadVerificationCount = async () => {
      try {
        const count = await userApi.getVerificationCount(incident.idIncident);
        setVerificationCount(count);
      } catch (error) {
        console.error("Error loading verification count:", error);
        // Si hay error, mantenemos el contador en 0
        setVerificationCount(0);
      }
    };

    if (incident?.idIncident) {
      loadVerificationCount();
    }
  }, [incident?.idIncident]);

  const handleBack = () => {
    navigate(HOME_PATH);
  };

   const handleUpdateStatus = () => {
    navigate(UPDATE_INCIDENT_PATH, { 
      state: { incident } 
    });
  };

  const handleValidateStatus = () => {
    alert("Validate Status functionality not implemented yet.");
  };

  const handleVerify = async () => {
    try {
      const response = await userApi.verifyIncident(incident.idIncident);

      // Manejar diferentes respuestas del backend
      const responseMessage = response.data;

      if (responseMessage === "Ya has verificado este incidente") {
        setMessage("You have already verified this incident previously");
        setVariant("warning");
      } else if (responseMessage === "Verificación registrada exitosamente") {
        setMessage("Successfully verified the incident");
        setVariant("success");
        // Actualizar el contador
        setVerificationCount(prev => prev + 1);
      } else {
        setMessage("Successfully verified the incident");
        setVariant("success");
        setVerificationCount(prev => prev + 1);
      }

      setShowAlert(true);

      // Ocultar el mensaje después de 5 segundos
      setTimeout(() => {
        setShowAlert(false);
      }, 5000);
    } catch (error) {
      console.error("Error verifying incident:", error);
      setMessage("Error verifying incident");
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
            <Button variant="dark" className="incident-details-button" onClick={handleValidateStatus}>
              Validate Status
            </Button>
            {incident.status !== "Resolved" && (
              <>
                <Button variant="dark" className="incident-details-button" onClick={handleVerify}>
                  Verify Incident
                </Button>

                {/* Contador de verificaciones */}
                <div className="text-center mt-2 mb-2">
                  <small className="text-muted">
                    Verified {verificationCount} time{verificationCount !== 1 ? 's' : ''}
                  </small>
                </div>

                {/* Mensaje de verificación SOLO debajo del botón */}
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