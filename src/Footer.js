import React from "react";
import "./Footer.css";
import carBg from './asset/car-bg.png';
import carImgRed from './asset/car-img-red.jpg';
import carImgBlack from './asset/car-img-black.jpg';
import carImgBlackSilver from './asset/car-image-blacksilver.jpg';
import carImgSilver from './asset/car-img-silver.jpg';

const Footer = () => {
  const galleryImages = [carBg, carImgRed, carImgSilver, carImgBlackSilver, carImgBlack, "", ""];

  // Get current date
  const currentDate = new Date();
  const formattedDate = `${currentDate.toLocaleDateString('en-US', { weekday: 'long' })}, ${currentDate.toLocaleDateString('en-US', { month: 'long' })} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Left Section - About */}
        <div className="footer-section about">
          <div className="logo">🏁 Auction</div>
          <p>
            Maecenas ne mollis orci. Phasell iacu sapie non aliquet ex euismo ac.
          </p>
          <p>📍 Pinus Softwares echankadu signal, 37921</p>
          <p>📞 9994820468</p>
          <p>✉️ contact@auction.com</p>
        </div>

        {/* Featured Links */}
        <div className="footer-section links">
          <h4>Featured Links</h4>
          <ul>
            <li>About Us</li>
            <li>Term & Services</li>
            <li>Meet The Team</li>
            <li>Privacy Policy</li>
            <li>Company News</li>
          </ul>
        </div>

        {/* Latest News */}
        <div className="footer-section news">
          <h4>Latest News</h4>
          <div className="news-item">
            <p><strong>Hella Kogi Whatever</strong></p>
            <small>{formattedDate} | 2 comments</small>
          </div>
          <div className="news-item">
            <p><strong>Retro Art Party</strong></p>
            <small>{formattedDate}| 2 comments</small>
          </div>
        </div>

        {/* Gallery */}
        <div className="footer-section gallery">
          <h4>Gallery</h4>
          <div className="gallery-images">
            {/* Dynamically render images from the galleryImages array */}
            {galleryImages.map((image, i) => (
              <div key={i} className="gallery-img">
                {/* Only show the image if it's not an empty string */}
                {image ? (
                  <img src={image} alt={`Car Background ${i + 1}`} style={{ width: '50px', height: '50px', borderRadius: '5px' }} />
                ) : (
                  <div className="empty-img-placeholder" style={{ width: '50px', height: '50px', backgroundColor: '#444', borderRadius: '5px' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Auction. Developed by Robert | {formattedDate}</p>
      </div>
    </footer>
  );
};

export default Footer;
