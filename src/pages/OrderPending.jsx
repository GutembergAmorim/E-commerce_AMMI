import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";
import { useSearchParams } from "react-router-dom";

const OrderPending = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <Container className="my-5 py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="text-center shadow-sm">
            <Card.Body className="p-5">
              <FontAwesomeIcon
                icon={faClock}
                size="4x"
                className="text-warning mb-4"
              />
              <Card.Title as="h2" className="mb-3">
                Pagamento Pendente
              </Card.Title>
              <Card.Text>
                Seu pedido <strong>{orderId}</strong> está aguardando a
                confirmação do pagamento
              </Card.Text>
              <Card.Text>
                Isso pode acontecer com pagamentos via boleto ou quando há uma
                análise de segurança pelo banco.
              </Card.Text>
              <Card.Text className="text-muted mt-4">
                Você receberá uma notificação por e-mail assim que o pagamento
                for aprovado. Obrigado pela sua paciência!
              </Card.Text>
              <Button as={Link} to="/" variant="primary" className="mt-4">
                Voltar para a Página Inicial
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderPending;
