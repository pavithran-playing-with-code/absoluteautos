import React from 'react';
import './ContactUs.css';

const ContactUs = () => {

    return (
        <div className="contact-container">
            {/* Header */}
            <section className="contact-header">
                <h1>Contact Us</h1>
                <p>We’d love to hear from you. Here’s how you can reach us.</p>
            </section>

            {/* Content */}
            <section className="contact-content">
                {/* Map */}
                <div className="map-wrapper">
                    <iframe
                        title="Google Map"
                        src="https://www.google.com/maps?q=12.949295618477706,80.18484463346452&z=17&output=embed"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>

                {/* Contact Info */}
                <div className="info-box">
                    <h3><span role="img" aria-label="Office">🏢</span> Office</h3>
                    <p>SH 109, Veeramani Nagar<br />Keelkattalai, Chennai, Tamil Nadu 600117</p>

                    <h3><span role="img" aria-label="Hours">🕒</span> Operating Hours</h3>
                    <p>
                        Mon–Fri: 9:00am – 6:00pm<br />
                        Sat: Appointment only<br />
                        Sun & PH: Closed
                    </p>

                    <h3><span role="img" aria-label="Email">✉️</span> Email</h3>
                    <p><a href="mailto:info@absoluteautos.in">info@absoluteautos.in</a></p>

                    <h3><span role="img" aria-label="Phone">📞</span> Phone</h3>
                    <p>+91 98765 43210</p>
                </div>
            </section>
        </div>
    );
};

export default ContactUs;
