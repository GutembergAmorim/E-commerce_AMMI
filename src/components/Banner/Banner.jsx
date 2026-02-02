import { useEffect, useState } from "react";
import "./Banner.css";
import Foto_1 from "../../assets/Banner/Foto 1.png";
import Foto_2 from "../../assets/Banner/Foto 2.png";


const images = [
   {id: 1, img: Foto_1},
   {id: 2, img: Foto_2},
];

export default function Benner() {
   const [index, setIndex] = useState(0);

   useEffect(() => {
      const timer = setInterval(() => {
         setIndex((prev) => (prev + 1) % images.length);
      }, 3000);

      return () => clearInterval(timer)
   }, []);

   return (
      <div className="banner">
      <div
        className="banner-track"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((img, i) => (
          <img key={i} src={img.img} alt={`Banner ${i + 1}`} />
        ))}
      </div>

      <div className="dots">
        {images.map((_, i) => (
          <button
            key={i}
            className={index === i ? "dot active" : "dot"}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
   )
}