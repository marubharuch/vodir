// src/components/Carousel/Carousel.jsx
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { FaWhatsapp, FaArrowRight } from 'react-icons/fa';
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const Carousel = ({ images }) => {
  return (
    <div className="w-full max-w-2xl mx-auto mt-6">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
      >
        {images.map((slide, index) => (
          <SwiperSlide key={index}>
          <div className="relative w-full h-60 rounded-lg overflow-hidden">
            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
        
            {/* Bottom overlay for text and buttons */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-4">
              <h2 className="text-xl font-bold">{slide.title}</h2>
              <p className="text-sm mb-3">{slide.description}</p>
              <div className="flex space-x-3">
                <a href={slide.whatsappLink} target="_blank" rel="noopener noreferrer"
                  className="flex items-center bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-sm">
                  <FaWhatsapp className="mr-2" /> WhatsApp
                </a>
                <a href={slide.readMoreLink}
                  className="flex items-center bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-lg text-sm">
                  Read More <FaArrowRight className="ml-2" />
                </a>
              </div>
            </div>
          </div>
        </SwiperSlide>
        
        ))}
      </Swiper>
    </div>
  );
};

export default Carousel;
