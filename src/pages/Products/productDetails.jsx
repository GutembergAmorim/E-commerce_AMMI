import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // Para pegar o ID do produto da URL

import { useCart } from "../../Context/CartContext"; // Importar o contexto do carrinho
import produtosData from "../../Data/products"; // Importar os dados locais

const ProductDetails = () => {
  const { id } = useParams(); // Pega o id do produto. Ex: /products/123
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addItemToCart } = useCart(); // Pega a função de adicionar item ao carrinho do contexto

  // Como os dados locais têm apenas uma imagem principal por produto
  const productImages = product?.images || [];
  const productColors = product?.colors || [];
  const productSizes = product?.sizes || [];

  useEffect(() => {
    if (!id) return;

    const loadProductDetails = () => {
      setLoading(true);
      setError(null);
      try {
        const numericProductId = parseInt(id, 10); // Converte o ID para número
        const foundProduct = produtosData.find(
          (p) => p.id === numericProductId
        );

        if (foundProduct) {
          setProduct(foundProduct);
          // Define a imagem principal inicial
          if (foundProduct.images && foundProduct.images.length > 0) {
            // Verifica se há imagens
            setSelectedImage(foundProduct.images[0]); // Usa a primeira imagem do array
          } else {
            //se não houver imagem
            setSelectedImage(
              "https://via.placeholder.com/600x600/cccccc/ffffff?text=Imagem+Indisponível"
            );
          }
        } else {
          throw new Error("Produto não encontrado");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProductDetails();
  }, [id]);

  // Função para alterar a imagem principal ao clicar nas miniaturas
  const handleThumbnailClick = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  // Função para alterar a cor selecionada
  const handleColorChange = (item) => {
    setColor(item);
  };

  // Função para alterar o tamanho selecionado
  const handleSizeChange = (item) => {
    setSize(item);
  };

  // Função para incrementar a quantidade
  const incrementQuantity = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  // Função para decrementar a quantidade
  const decrementQuantity = () => {
    setQuantity((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 1));
  };

  // Função para adicionar ao carrinho
  const addToCart = () => {
    if (!product || !color || !size || quantity < 0) {
      alert(
        "Por favor, selecione todas as opções antes de adicionar ao carrinho."
      );
      alert(`Produto adicionado ao carrinho: ${product.name}`);
      return;
    }

    let productItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity,
      color: color,
      size: size,
      image: product.images[0] || selectedImage,
      originalPrice: product.oldPrice || null,
    };

    addItemToCart(productItem);
  };

  // Função para renderizar estrelas de avaliação
  //   const renderStars = (rate) => {
  //     if (typeof rate !== "number") return null;
  //     const stars = [];
  //     const fullStars = Math.floor(rate);
  //     const halfStar = rate % 1 >= 0.4; // Ajuste o threshold para meio estrela se necessário

  //     for (let i = 0; i < fullStars; i++) {
  //       stars.push(
  //         <i key={`full-${i}`} className="fas fa-star text-yellow-400"></i>
  //       );
  //     }
  //     if (halfStar && stars.length < 5) {
  //       stars.push(
  //         <i key="half" className="fas fa-star-half-alt text-yellow-400"></i>
  //       );
  //     }
  //     while (stars.length < 5) {
  //       stars.push(
  //         <i
  //           key={`empty-${stars.length}`}
  //           className="far fa-star text-yellow-400"
  //         ></i>
  //       ); // 'far' para estrela vazia
  //     }
  //     return stars;
  //   };

  if (loading) {
    return (
      <>
        <div className="container mx-auto px-4 py-8 text-center">
          Carregando detalhes do produto...
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="container mx-auto px-4 py-8 text-center text-red-500">
          Erro: {error}
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <div className="container mx-auto px-4 py-8 text-center">
          Produto não encontrado.
        </div>
      </>
    );
  }

  return (
    <>
      <div className="container py-5">
        <div className="row g-4">
          {/* <!-- Product Images Section --> */}
          <div className="col-md-6">
            {/* <!-- Main Image --> */}
            <div
              className="bg-white rounded shadow-sm overflow-hidden mb-4"
              style={{ height: "600px" }}
            >
              {" "}
              {/* Altura fixa para o contêiner da imagem */}
              {/* Classes Bootstrap */}
              <img
                id="mainImage"
                src={
                  selectedImage ||
                  "https://via.placeholder.com/600x600/cccccc/ffffff?text=Imagem+Principal"
                }
                alt={product.name || "Imagem Principal do Produto"}
                className="p-5 img-fluid object-cover h-100 w-100" // img-fluid para responsividade, object-cover mantido
              />
            </div>

            {/* <!-- Thumbnails --> */}
            <div className="row row-cols-4 g-2">
              {productImages.length > 0
                ? productImages.map((imgUrl, index) => (
                    <div className="col" key={index}>
                      <div
                        key={index}
                        className={`thumbnail cursor-pointer rounded border  ${
                          selectedImage === imgUrl
                            ? "border-primary border-2" // Borda quando a miniatura está selecionada
                            : "border-transparent" // Borda padrão quando não está selecionada
                        } overflow-hidden`}
                        onClick={() => handleThumbnailClick(imgUrl)}
                        style={{ height: "6rem" }} // Altura similar ao h-24, pode ser ajustada ou usar ratio do BS
                      >
                        <img
                          src={imgUrl}
                          alt={`Miniatura ${index + 1} de ${product.name}`}
                          className="w-100 h-100 object-cover"
                        />
                      </div>
                    </div>
                  ))
                : // Mostrar placeholders se não houver imagens de thumbnail
                  Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="thumbnail bg-light rounded d-flex align-items-center justify-content-center" // Classes Bootstrap
                      style={{ height: "6rem" }}
                    >
                      <span className="small text-muted">
                        {" "}
                        {/* Classes Bootstrap */}
                        Thumb {index + 1}
                      </span>
                    </div>
                  ))}
            </div>
          </div>
          {/* <!-- Product Details Section --> */}
          <div className="col-md-6">
            <div className="bg-white rounded shadow-sm p-4">
              {/* <!-- Product Title --> */}
              <h1 className="h2 fw-bold text-dark mb-2">
                {product.name || "Nome do Produto"}
              </h1>
              {/* <!-- Product Rating --> */}
              {/* <div className="flex items-center mb-4">
                <div className="flex">{renderStars(product.rating?.rate)}</div>
                <span className="text-gray-600 ml-2">
                  ({product.rating?.count || 0} avaliações)
                </span>
              </div> */}
              {/* <!-- Price --> */}
              <div className="mb-6">
                <span className="display-6 fw-bold text-dark">
                  R$ {product.price.toFixed(2).replace(".", ",") || "R$ 0,00"}
                </span>
                {product.oldPrice && (
                  <span className="fs-5 text-muted text-decoration-line-through ms-2">
                    R$ {product.oldPrice.toFixed(2).replace(".", ",")}
                  </span>
                )}
              </div>
              {/* <!-- Description --> */}
              <div className="mb-6">
                <h2 className="h5 fw-semibold text-dark mb-2">
                  {" "}
                  {/* Classes Bootstrap */}
                  Descrição
                </h2>
                <p className="text-muted">
                  {" "}
                  {/* Classes Bootstrap */}
                  {product.description ||
                    "Descrição do produto não disponível."}
                </p>
              </div>
              {/* <!-- Colors --> */}
              <div className="mb-6">
                <h2 className="h5 fw-semibold text-dark mb-3">Cores</h2>
                <div className="d-flex gap-2">
                  {productColors.map((opt) => (
                    <button
                      key={opt.value}
                      className={`rounded-circle border ${
                        color === opt.value
                          ? "border-dark border-2 shadow-sm" // Estilo para cor selecionada
                          : "border-secundary" // Estilo para cor não selecionada
                      }`}
                      data-color={opt.value}
                      style={{
                        width: "32px",
                        height: "32px",
                        backgroundColor: opt.colorCode,
                      }}
                      onClick={() => handleColorChange(opt.value)}
                      title={opt.name}
                    ></button>
                  ))}
                </div>
              </div>
              {/* <!-- Sizes --> */}
              <div className="mb-6">
                <h2 className="h5 fw-semibold text-dark mb-3">Tamanhos</h2>
                <div className="d-flex flex-wrap gap-2">
                  {productSizes.map((sizeOption) => (
                    <button
                      key={sizeOption}
                      className={`btn btn-outline-secondary ${
                        size === sizeOption
                          ? "bg-dark text-white" // Estilo para tamanho selecionado
                          : ""
                      }`}
                      onClick={() => handleSizeChange(sizeOption)}
                      title={sizeOption}
                    >
                      {sizeOption}
                    </button>
                  ))}
                </div>
              </div>
              {/* <!-- Shipping Calculator --> */}
              <div className="mb-6">
                <h2 className="h5 fw-semibold text-dark mb-3">
                  Calcular Frete
                </h2>
                <div className="input-group">
                  {" "}
                  {/* Input group Bootstrap */}
                  <input
                    type="text"
                    placeholder="Digite seu CEP"
                    className="form-control" // form-control Bootstrap
                  />
                  <button className="btn btn-primary">
                    {" "}
                    {/* btn Bootstrap */}
                    Calcular
                  </button>
                </div>
                <div className="mt-2 small text-muted">
                  {" "}
                  {/* Classes Bootstrap */}
                  <p>
                    <i className="fas fa-truck mr-2"></i> Frete grátis para
                    compras acima de R$ 150,00
                  </p>
                  <p>
                    <i className="fas fa-undo mr-2"></i> Devolução grátis em até
                    30 dias
                  </p>
                </div>
              </div>
              {/* <!-- Add to Cart --> */}
              <div className="d-flex flex-column flex-sm-row gap-2">
                <div className="input-group" style={{ maxWidth: "110px" }}>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={decrementQuantity}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={quantity}
                    id="quantity" // Pode manter o ID se for útil
                    className="form-control text-center" // form-control Bootstrap
                    readOnly
                  />
                  <button
                    className="btn btn-outline-secondary"
                    onClick={incrementQuantity}
                  >
                    +
                  </button>
                </div>
                <button
                  className="btn btn-primary btn-lg flex-grow-1" // btn Bootstrap
                  onClick={addToCart}
                >
                  <i className="fas fa-shopping-cart mr-2"></i> Adicionar ao
                  Carrinho
                </button>
              </div>
            </div>
            {/* <!-- Product Info Tabs --> */}
            <div className="bg-white rounded shadow-sm mt-4">
              {" "}
              {/* Classes Bootstrap */}
              <ul
                className="nav nav-tabs nav-fill mb-3"
                id="productInfoTabs"
                role="tablist"
              >
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link active"
                    id="description-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#description-content"
                    type="button"
                    role="tab"
                    aria-controls="description-content"
                    aria-selected="true"
                  >
                    Descrição
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link"
                    id="specs-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#specs-content"
                    type="button"
                    role="tab"
                    aria-controls="specs-content"
                    aria-selected="false"
                  >
                    Especificações
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link"
                    id="reviews-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#reviews-content"
                    type="button"
                    role="tab"
                    aria-controls="reviews-content"
                    aria-selected="false"
                  >
                    Avaliações
                  </button>
                </li>
              </ul>
            </div>
            <div className="tab-content p-3" id="productInfoTabsContent">
              <div
                className="tab-pane fade show active"
                id="description-content"
                role="tabpanel"
                aria-labelledby="description-tab"
              >
                <p className="text-muted">
                  {product.description || "Informações detalhadas do produto."}
                </p>
              </div>
              <div
                className="tab-pane fade"
                id="specs-content"
                role="tabpanel"
                aria-labelledby="specs-tab"
              >
                <p className="text-muted">Especificações do produto aqui...</p>
              </div>
              <div
                className="tab-pane fade"
                id="reviews-content"
                role="tabpanel"
                aria-labelledby="reviews-tab"
              >
                <p className="text-muted">Avaliações dos clientes aqui...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;
