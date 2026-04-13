import React from "react";
import { Package, Truck } from "lucide-react";
import "./InfoBanner.css";

const InfoBanner = () => {
  return (
    <section className="info-banner-section">
      <div className="container">
        <div className="row g-0">
          {/* Item 1: 10% OFF */}
          <div className="col-lg-4 info-banner-divider">
            <div className="info-banner-item">
              <div className="info-banner-icon">
                <Package size={32} strokeWidth={1.5} />
              </div>
              <div className="info-banner-text">
                <p>10% OFF na primeira compra</p>
                {/* <p>o cupom PRIMEIRACOMPRA</p> */}
              </div>
            </div>
          </div>

          {/* Item 2: Parcelamento */}
          <div className="col-lg-4 info-banner-divider">
            <div className="info-banner-item">
              <div className="info-banner-icon">
                <span className="info-banner-4x">3x</span>
              </div>
              <div className="info-banner-text">
                <p>Parcele em até 3x sem juros</p>
              </div>
            </div>
          </div>

          {/* Item 3: Troca Grátis */}
          <div className="col-lg-4">
            <div className="info-banner-item">
              <div className="info-banner-icon">
                <Truck size={32} strokeWidth={1.5} />
              </div>
              <div className="info-banner-text">
                <p>FRETE GRÁTIS</p>
                <p className="small text-muted">A partir de R$ 299,00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoBanner;
