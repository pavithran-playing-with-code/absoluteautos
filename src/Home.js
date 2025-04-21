import React, { useState, useEffect } from 'react';
import carBg from './asset/car-bg.png';
import carImgBlackSilver from './asset/car-image-blacksilver.jpg';
import carImgBlack from './asset/car-img-black.jpg';
import carImgSilver from './asset/car-img-silver.jpg';
import './Home.css';

const Home = () => {
    const slides = [
        {
            image: carBg,
            title: "Welcome to Absoluteautos",
            subtitle: "The best website to find your dream car",
        },
        {
            image: carImgBlackSilver,
            title: "Find Your Dream Car",
            subtitle: "Explore top models and competitive bidding today",
        },
        {
            image: carImgBlack,
            title: "Bold. Elegant. Powerful.",
            subtitle: "Discover premium black editions built for luxury & performance",
        },
        {
            image: carImgSilver,
            title: "Style Meets Performance",
            subtitle: "Drive into the future with our exclusive silver series",
        }
    ];

    const [currentSlide, setCurrentSlide] = useState(0);

    // Rotate slides every 3 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
        }, 3000);

        return () => clearInterval(interval); // Cleanup
    }, [slides.length]);

    return (
        <div className="home">
            {/* Carousel Section */}
            <div className="carousel">
                {slides.map((slide, i) => (
                    <div key={i} className={`carousel-slide ${i === currentSlide ? 'active' : ''}`}>
                        <img src={slide.image} alt={`slide-${i}`} className="carousel-img" />
                        <div className="carousel-content">
                            <h2>{slide.title}</h2>
                            <p>{slide.subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Why Choose Us Section */}
            <div className="why-choose-us">
                <h2>Why Choose Us?</h2>
                <div className="reasons">
                    <div className="reason">
                        <h4>Results of Drivers</h4>
                        <p>Integer nec posuere metus, at feugiat. Sed sodales venenat malesuada.</p>
                    </div>
                    <div className="reason">
                        <h4>Upgrades Performance</h4>
                        <p>Integer nec posuere metus, at feugiat. Sed sodales venenat malesuada.</p>
                    </div>
                    <div className="reason">
                        <h4>Product Sellers</h4>
                        <p>Integer nec posuere metus, at feugiat. Sed sodales venenat malesuada.</p>
                    </div>
                    <div className="reason">
                        <h4>Fast Service</h4>
                        <p>Integer nec posuere metus, at feugiat. Sed sodales venenat malesuada.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
