import { Card, Container, Row, Stack } from "react-bootstrap";

function Inicio() {
  return (
    <Container fluid className="pt-3">
      <Stack gap={3}>
        <Card bg="light" className="col-lg-6 mx-auto">
          <Card.Title>Home</Card.Title>
          <Card.Body>Bienvenido a OGPS</Card.Body>
        </Card>
      </Stack>
      {/* Aqui faltaria agregar los botones de ver perfil y consultar perfil, 
      no se si lo quieran en esta parte o agregar una nueva navbar que sustituya la que esta en App.jsx) */}
    </Container>
  );
}

export default Inicio;