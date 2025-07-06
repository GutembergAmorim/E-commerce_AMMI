import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import ProductCard from "../../components/ProductCard/ProductCard";
import produtos from "../../Data/products";

const ProductGrid = () => {
  return (
    <>
      <Container className="py-5">
        <h2 className="text-center mb-5">Nossos Produtos</h2>
        {/* --- ESTRUTURA DE GRID ATUALIZADA --- */}
        <Row xs={1} sm={2} md={3} className="g-4">
          {produtos.map((product) => (
            <Col key={product.id}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default ProductGrid;
