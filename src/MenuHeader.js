import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MenuHeader.css';

const MenuHeader = () => {
    const [scrollDirection, setScrollDirection] = useState(null);
    const [prevScrollY, setPrevScrollY] = useState(0);
    const [topOffset, setTopOffset] = useState(103);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [accessLevel, setAccessLevel] = useState(null); // ✅ New state

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const loginStatus = localStorage.getItem("isLoggedIn") === "true";
        setIsLoggedIn(loginStatus);

        if (loginStatus) {
            const profileId = localStorage.getItem("profileId");

            if (profileId) {
                fetch('http://localhost:5000/api/access_level', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId: profileId })
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            setAccessLevel(data.accessLevel);
                        } else {
                            console.error("Failed to fetch access level:", data.message);
                            setAccessLevel(null); // reset
                        }
                    })
                    .catch(error => {
                        console.error("Error fetching access level:", error);
                        setAccessLevel(null); // reset
                    });
            }
        } else {
            setAccessLevel(null); // reset if not logged in
        }
    }, [location]);  // ⬅️ Re-run when route changes    

    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        setScrollDirection(currentScrollY > prevScrollY ? 'down' : 'up');
        setTopOffset(currentScrollY < 60 ? 103 : 60);
        setPrevScrollY(currentScrollY);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [prevScrollY]);

    const handleNavigate = (path) => {
        navigate(path);
        setShowDropdown(false);
    };

    const handleSignOut = () => {
        localStorage.clear();
        setIsLoggedIn(false);
        setAccessLevel(null);
        navigate('/signin');
    };

    return (
        <div className="menu-header" style={{ top: `${topOffset}px` }}>
            <i className="fa-solid fa-car-side car-icon"></i>

            <p className={`menu-text ${location.pathname === '/home' ? 'active' : ''}`} onClick={() => handleNavigate('/home')}>Home</p>

            {/* ✅ Only show Car Upload if accessLevel is admin */}
            {accessLevel === 'admin' && (
                <>
                    <p className={`menu-text ${location.pathname === '/carupload' ? 'active' : ''}`} onClick={() => handleNavigate('/carupload')}>
                        Car Upload
                    </p>
                    <p className={`menu-text ${location.pathname === '/CarUploadsData' ? 'active' : ''}`} onClick={() => handleNavigate('/CarUploadsData')}>
                        Car Uploads Data
                    </p>
                </>
            )}

            <p className={`menu-text ${location.pathname === '/AboutUs' ? 'active' : ''}`} onClick={() => handleNavigate('/AboutUs')}>About Us</p>
            <p className="menu-text" onClick={() => handleNavigate('/showroom')}>Showroom</p>
            <p className={`menu-text ${location.pathname === '/LiveBidding' ? 'active' : ''}`} onClick={() => handleNavigate('/LiveBidding')}>Live Bidding</p>

            {isLoggedIn ? (
                <div
                    className={`menu-text dropdown-containe ${location.pathname === '/profile' ? 'active' : ''}`}
                    onMouseEnter={() => setShowDropdown(true)}
                    onMouseLeave={() => setShowDropdown(false)}
                >
                    My Account
                    {showDropdown && (
                        <div className="dropdown">
                            <p onClick={() => handleNavigate('/profile')}>Profile</p>
                            <p onClick={handleSignOut}>Sign Out</p>
                        </div>
                    )}
                </div>
            ) : (
                <p className={`menu-text ${location.pathname === '/signin' ? 'active' : ''}`} onClick={() => handleNavigate('/signin')}>
                    Sign-In
                </p>
            )}

            <p className={`menu-text ${location.pathname === '/FAQ' ? 'active' : ''}`} onClick={() => handleNavigate('/faq')}>FAQ</p>
            <p className={`menu-text ${location.pathname === '/contactus' ? 'active' : ''}`} onClick={() => handleNavigate('/contactus')}>Contact Us</p>
        </div>
    );

};

export default MenuHeader;
