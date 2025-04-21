import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ContactHeader.css';

const ContactHeader = () => {
    const navigate = useNavigate();
    const [show, setShow] = useState(true);

    const handleScroll = () => {
        if (window.scrollY > 50) {
            setShow(false);
        } else {
            setShow(true);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className={`contact-header ${show ? 'visible' : 'hidden'}`}>
            <div className="contact-left">
                <i className="fab fa-facebook social-icon"></i>
                <i className="fab fa-twitter social-icon"></i>
                <i className="fab fa-google social-icon"></i>
                <i className="fab fa-instagram social-icon"></i>
            </div>
            <div className="contact-right">
                <span>Contact Us: 638273139</span>
                <span className="separator"> | </span>
                <span className="signupbtn" style={{ fontWeight: "600", cursor: "pointer" }} onClick={() => navigate('/signup')}>Sign Up Now</span>
            </div>
        </div>
    );
};

export default ContactHeader;
