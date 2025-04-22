import React, { useEffect, useState } from 'react';
import './LiveBidding.css';

const LiveBidding = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

        fetchCars();
    }, []);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="live-bidding-container">
            <h1>Live Bidding</h1>
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
                            <p><strong>Year:</strong> {car.purchase_year}</p>
                            <p><strong>Mileage:</strong> {car.mileage} km</p>
                            <p><strong>Condition:</strong> {car.car_condition}</p>
                            <p><strong>Starting Bid:</strong> ${car.starting_bid}</p>
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