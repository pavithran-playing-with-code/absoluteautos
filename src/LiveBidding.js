import React, { useEffect, useState } from 'react';
import './LiveBidding.css';

const LiveBidding = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const loginStatus = localStorage.getItem("isLoggedIn");
        const profileId = localStorage.getItem("profileId");

        if (loginStatus === "true" && profileId) {
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
                        const accessLevel = data.accessLevel;
                        if (accessLevel !== 'admin') {
                            window.location.pathname = '/';
                        }
                        else {
                            fetchCars();
                        }
                    } else {
                        console.error("Failed to fetch access level:", data.message);
                    }
                })
                .catch(error => {
                    console.error("Error fetching access level:", error);
                });
        } else {
            window.location.pathname = '/';
        }
    }, []);

    // Fetch car data from the API
    const fetchCars = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/caruploads');
            const data = await response.json();
            setCars(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching car data:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="live-bidding-container">
            <h1><i className="fa-solid fa-gavel" style={{ marginRight: '10px', color: '#007bff' }}></i>Live Bidding</h1>

            <div className="car-grid">
                {cars.map((car) => (
                    <div key={car.car_id} className="car-card">
                        <img
                            src={
                                car.exterior_photos
                                    ? `http://localhost:5000${JSON.parse(car.exterior_photos)[0]}`
                                    : '/placeholder.jpg'
                            }
                            alt={`${car.make} ${car.model}`}
                            className="car-image"
                        />
                        <div className="car-details">
                            <h2>{car.make} {car.model}</h2>
                            <p><i className="fa-solid fa-calendar"></i> <strong>Year:</strong> {car.purchase_year}</p>
                            <p><i className="fa-solid fa-gauge-high"></i> <strong>Mileage:</strong> {car.mileage} km</p>
                            <p><i className="fa-solid fa-screwdriver-wrench"></i> <strong>Condition:</strong> {car.car_condition}</p>
                            <p><i className="fa-solid fa-dollar-sign"></i> <strong>Starting Bid:</strong> ${car.starting_bid}</p>

                            <p><strong>Buy Now Price:</strong> ${car.buy_now_price}</p>
                            <p><strong>Bidding Ends:</strong> {new Date(car.bidding_end_time).toLocaleString()}</p>
                        </div>
                        <button className="bid-now-button">Bid Now</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LiveBidding;