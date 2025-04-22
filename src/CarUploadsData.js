import React, { useEffect, useState } from 'react';
import './CarUploadsData.css';

const CarUploadsData = () => {
    const [carData, setCarData] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedCar, setSelectedCar] = useState(null);
    const [editSection, setEditSection] = useState(''); // To track which section to edit

    const formatToLocalDatetime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - offset * 60000);
        return localDate.toISOString().slice(0, 16);  // "YYYY-MM-DDTHH:mm"
    };

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
                            fetchCarUploads();
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

    const fetchCarUploads = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/caruploads', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await res.json();
            setCarData(data);
        } catch (error) {
            console.error("Error fetching car uploads:", error);
        }
    };

    const handleEdit = (section, carId) => {
        const car = carData.find(c => c.car_id === carId);
        setSelectedCar({ ...car });  // Clone to avoid direct mutation
        setEditSection(section);  // Set which section to edit
        setShowModal(true);  // Show the modal
    };

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'checkbox' && name === 'additional_features') {
            let updatedFeatures = selectedCar.additional_features || [];

            if (typeof updatedFeatures === 'string') {
                updatedFeatures = updatedFeatures.split(',').map(f => f.trim());
            }

            if (checked) {
                updatedFeatures = [...updatedFeatures, value];
            } else {
                updatedFeatures = updatedFeatures.filter(f => f !== value);
            }

            setSelectedCar(prev => ({
                ...prev,
                additional_features: updatedFeatures
            }));
        } else if (type === 'file') {
            if (name === 'documents') {
                // Handle document files separately to preserve file paths
                const filePaths = Array.from(files).map(file => URL.createObjectURL(file));
                setSelectedCar(prev => ({
                    ...prev,
                    [name]: filePaths,
                }));
            } else if (name === 'exterior_photos' || name === 'interior_photos') {
                setSelectedCar(prev => ({
                    ...prev,
                    [name]: files, // Set all selected files, not just the first one
                }));
            } else {
                // Handle single image uploads
                setSelectedCar(prev => ({
                    ...prev,
                    [name]: files[0],
                }));
            }
        } else {
            setSelectedCar(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleModalSave = async () => {
        if (!selectedCar || !editSection) return;
        let updatedData = {};
        let isValid = true; // Flag to track if the form is valid
        debugger
        switch (editSection) {
            case 'vehicleInfo':
                updatedData = {
                    make: selectedCar.make,
                    model: selectedCar.model,
                    purchase_year: selectedCar.purchase_year,
                    vin: selectedCar.vin,
                    mileage: selectedCar.mileage,
                    car_condition: selectedCar.car_condition,
                    transmission: selectedCar.transmission,
                    drive_type: selectedCar.drive_type,
                    fuel_type: selectedCar.fuel_type,
                    color: selectedCar.color
                };

                if (
                    !updatedData.make ||
                    !updatedData.model ||
                    !updatedData.purchase_year ||
                    !updatedData.vin ||
                    !updatedData.mileage ||
                    !updatedData.car_condition ||
                    !updatedData.transmission ||
                    !updatedData.drive_type ||
                    !updatedData.fuel_type ||
                    !updatedData.color
                ) {
                    isValid = false;
                    alert('Please fill in all required fields for Vehicle Info.');
                }
                break;

            case 'vehicleDetails':
                updatedData = {
                    title_status: selectedCar.title_status,
                    accident_history: selectedCar.accident_history,
                    service_records: selectedCar.service_records,
                    vehicle_available_for_inspection: selectedCar.vehicle_available_for_inspection,
                    additional_features: Array.isArray(selectedCar.additional_features)
                        ? selectedCar.additional_features
                        : (selectedCar.additional_features?.split(',').map(f => f.trim()) || [])
                };

                if (
                    !updatedData.title_status ||
                    !updatedData.accident_history ||
                    !updatedData.service_records ||
                    !updatedData.vehicle_available_for_inspection ||
                    !updatedData.additional_features.length
                ) {
                    isValid = false;
                    alert('Please fill in all required fields for Vehicle Details.');
                }
                break;

            case 'photos_media':
                updatedData = {
                    exterior_photos: selectedCar.exterior_photos || [],
                    interior_photos: selectedCar.interior_photos || [],
                    engine_bay_photo: selectedCar.engine_bay_photo || '',
                    video_walkaround: selectedCar.video_walkaround || '',
                    documents: selectedCar.documents || []
                };

                if (
                    !updatedData.exterior_photos.length ||
                    !updatedData.interior_photos.length ||
                    !updatedData.engine_bay_photo ||
                    !updatedData.documents.length
                ) {
                    isValid = false;
                    alert('Please upload all required media, including exterior and interior photos, engine bay photo, and documents.');
                }
                break;

            case 'bidding_info':
                updatedData = {
                    starting_bid: selectedCar.starting_bid,
                    bidding_end_time: new Date(selectedCar.bidding_end_time).toISOString().slice(0, 19).replace('T', ' '),
                    buy_now_price: selectedCar.buy_now_price,
                    bidding_increment: selectedCar.bidding_increment
                };

                if (
                    !updatedData.starting_bid ||
                    !updatedData.bidding_end_time ||
                    !updatedData.buy_now_price ||
                    !updatedData.bidding_increment
                ) {
                    isValid = false;
                    alert('Please fill in all required fields for Bidding Info.');
                }
                break;

            case 'seller_info':
                updatedData = {
                    seller_name: selectedCar.seller_name,
                    contact_email: selectedCar.contact_email,
                    contact_phone: selectedCar.contact_phone,
                    location: selectedCar.location,
                    seller_available_for_inspection: selectedCar.seller_available_for_inspection
                };

                if (
                    !updatedData.seller_name ||
                    !updatedData.contact_email ||
                    !updatedData.contact_phone ||
                    !updatedData.location ||
                    !updatedData.seller_available_for_inspection
                ) {
                    isValid = false;
                    alert('Please fill in all required fields for Seller Info.');
                }
                break;


            default:
                return;
        }

        if (!isValid) return;

        try {
            const response = await fetch('http://localhost:5000/api/update-car-section', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    section: editSection,
                    data: updatedData,
                    car_id: selectedCar.car_id
                })
            });

            if (!response.ok) throw new Error('Failed to update');

            alert('Update successful!');
            fetchCarUploads();
            setShowModal(false);
        } catch (error) {
            console.error('Error updating data:', error);
            alert('Error updating data');
        }
    };

    const handleDelete = (carId) => {
        try {
            alert(carId);
        } catch (err) {
            console.error("Error updating car:", err);
        }
    };

    return (
        <div className="car-uploads-container">
            {/* Vehicle Info - Full Width */}
            <div className="car-uploads-grid">
                {/* Vehicle Info Table */}
                <div className="car-table full-width">
                    <h3>Vehicle Info</h3>
                    <table className="car-uploads-table">
                        <thead>
                            <tr>
                                <th>Make</th>
                                <th>Model</th>
                                <th>Purchase Year</th>
                                <th>VIN</th>
                                <th>Mileage</th>
                                <th>Condition</th>
                                <th>Transmission</th>
                                <th>Drive Type</th>
                                <th>Fuel Type</th>
                                <th>Color</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carData.map(car => (
                                <tr key={car.car_id}>
                                    <td>{car.make}</td>
                                    <td>{car.model}</td>
                                    <td>{car.purchase_year}</td>
                                    <td>{car.vin}</td>
                                    <td>{car.mileage}</td>
                                    <td>{car.car_condition}</td>
                                    <td>{car.transmission}</td>
                                    <td>{car.drive_type}</td>
                                    <td>{car.fuel_type}</td>
                                    <td>{car.color}</td>
                                    <td style={{ whiteSpace: "nowrap", display: "flex", gap: "5px", justifyContent: "center" }}>
                                        <button onClick={() => handleEdit('vehicleInfo', car.car_id)} className="edit-btn">Edit</button>
                                        <button onClick={() => handleDelete(car.car_id)} className="delete-btn">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Vehicle Details and Photos - Two Columns Below */}
            <div className="two-column-section">
                <div className="car-table">
                    <h3>Vehicle Details</h3>
                    <table className="car-uploads-table">
                        <thead>
                            <tr>
                                <th>Title Status</th>
                                <th>Accident History</th>
                                <th>Additional Features</th>
                                <th>Service Records</th>
                                <th>Available for Inspection</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carData.map(car => (
                                <tr>
                                    <td>{car.title_status}</td>
                                    <td>{car.accident_history}</td>
                                    <td>{car.additional_features}</td>
                                    <td>{car.service_records}</td>
                                    <td>{car.vehicle_available_for_inspection}</td>
                                    <td style={{ whiteSpace: "nowrap", display: "flex", gap: "5px", justifyContent: "center" }}>
                                        <button onClick={() => handleEdit('vehicleDetails', car.car_id)} className="edit-btn">Edit</button>
                                        <button onClick={() => handleDelete(car.car_id)} className="delete-btn">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="car-table">
                    <h3>Photos & Media</h3>
                    <table className="car-uploads-table">
                        <thead>
                            <tr>
                                <th>Exterior</th>
                                <th>Interior</th>
                                <th>Engine Bay</th>
                                <th>Walkaround</th>
                                <th>Documents</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carData.map(car => (
                                <tr>
                                    <td>
                                        {car.exterior_photos && JSON.parse(car.exterior_photos).map((url, i) => (
                                            <div key={i}><a href={`http://localhost:5000${url}`} target="_blank">View {i + 1}</a></div>
                                        ))}
                                    </td>
                                    <td>
                                        {car.interior_photos && JSON.parse(car.interior_photos).map((url, i) => (
                                            <div key={i}><a href={`http://localhost:5000${url}`} target="_blank">View {i + 1}</a></div>
                                        ))}
                                    </td>
                                    <td>{car.engine_bay_photo && <a href={`http://localhost:5000${car.engine_bay_photo}`} target="_blank">View</a>}</td>
                                    <td>{car.video_walkaround && <a href={`http://localhost:5000${car.video_walkaround}`} target="_blank">View</a>}</td>
                                    <td>
                                        {car.documents && JSON.parse(car.documents).map((url, i) => (
                                            <div key={i}><a href={`http://localhost:5000${url}`} target="_blank">Doc {i + 1}</a></div>
                                        ))}
                                    </td>
                                    <td style={{ whiteSpace: "nowrap", display: "flex", gap: "5px", justifyContent: "center" }}>
                                        <button onClick={() => handleEdit('photos_media', car.car_id)} className="edit-btn">Edit</button>
                                        <button onClick={() => handleDelete(car.car_id)} className="delete-btn">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bidding Info & Seller Info - Below Again */}
            <div className="two-column-section">
                {/* Bidding Info */}
                <div className="car-table">
                    <h3>Bidding Info</h3>
                    <table className="car-uploads-table">
                        <thead>
                            <tr>
                                <th>Starting Bid</th>
                                <th>Buy Now Price</th>
                                <th>Bidding End</th>
                                <th>Increment</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carData.map(car => (
                                <tr>
                                    <td>${car.starting_bid}</td>
                                    <td>${car.buy_now_price}</td>
                                    <td>{car.bidding_end_time}</td>
                                    <td>{car.bidding_increment}</td>
                                    <td style={{ whiteSpace: "nowrap", display: "flex", gap: "5px", justifyContent: "center" }}>
                                        <button onClick={() => handleEdit('bidding_info', car.car_id)} className="edit-btn">Edit</button>
                                        <button onClick={() => handleDelete(car.car_id)} className="delete-btn">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Seller Info */}
                <div className="car-table">
                    <h3>Seller Info</h3>
                    <table className="car-uploads-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Location</th>
                                <th>Inspection</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {carData.map(car => (
                                <tr>
                                    <td>{car.seller_name}</td>
                                    <td>{car.contact_email}</td>
                                    <td>{car.contact_phone}</td>
                                    <td>{car.location}</td>
                                    <td>{car.seller_available_for_inspection}</td>
                                    <td style={{ whiteSpace: "nowrap", display: "flex", gap: "5px", justifyContent: "center" }}>
                                        <button onClick={() => handleEdit('seller_info', car.car_id)} className="edit-btn">Edit</button>
                                        <button onClick={() => handleDelete(car.car_id)} className="delete-btn">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {showModal && selectedCar && (
                <div className="modal show fade d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-body">
                                {editSection === 'vehicleInfo' && (
                                    <>
                                        <h2>Edit Vehicle Info</h2>
                                        <form className="modal-form">
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <label className="form-label">Make</label>
                                                    <input className="form-control" name="make" value={selectedCar?.make || ''} onChange={handleChange} required />
                                                </div>
                                                <div className="col-md-6">
                                                    <label className="form-label">Model</label>
                                                    <input className="form-control" name="model" value={selectedCar?.model || ''} onChange={handleChange} required />
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">Purchase Year</label>
                                                    <select className="form-select" name="purchase_year" value={selectedCar?.purchase_year || ''} onChange={handleChange} required>
                                                        {[...Array(new Date().getFullYear() - 1989).keys()].map(i => {
                                                            const purchase_year = 1990 + i;
                                                            return <option key={purchase_year} value={purchase_year}>{purchase_year}</option>;
                                                        })}
                                                    </select>
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">VIN</label>
                                                    <input className="form-control" name="vin" value={selectedCar?.vin || ''} onChange={handleChange} required />
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">Mileage</label>
                                                    <input type="number" className="form-control" name="mileage" value={selectedCar?.mileage || ''} onChange={handleChange} required />
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">Car Condition</label>
                                                    <select className="form-select" name="car_condition" value={selectedCar?.car_condition || ''} onChange={handleChange} required>
                                                        <option value="" disabled>Select Car Condition</option>
                                                        <option value="Excellent">Excellent</option>
                                                        <option value="Good">Good</option>
                                                        <option value="Fair">Fair</option>
                                                        <option value="Poor">Poor</option>
                                                    </select>
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">Transmission</label>
                                                    <select className="form-select" name="transmission" value={selectedCar?.transmission || ''} onChange={handleChange} required>
                                                        <option value="" disabled>Select Transmission Type</option>
                                                        <option value="Automatic">Automatic</option>
                                                        <option value="Manual">Manual</option>
                                                        <option value="CVT">CVT</option>
                                                    </select>
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">Drive Type</label>
                                                    <select className="form-select" name="drive_type" value={selectedCar?.drive_type || ''} onChange={handleChange} required>
                                                        <option value="" disabled>Select Drive Type</option>
                                                        <option value="FWD">FWD</option>
                                                        <option value="RWD">RWD</option>
                                                        <option value="AWD">AWD</option>
                                                        <option value="4WD">4WD</option>
                                                    </select>
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">Fuel Type</label>
                                                    <select className="form-select" name="fuel_type" value={selectedCar?.fuel_type || ''} onChange={handleChange} required>
                                                        <option value="" disabled>Select Fuel Type</option>
                                                        <option value="Gasoline">Gasoline</option>
                                                        <option value="Diesel">Diesel</option>
                                                        <option value="Electric">Electric</option>
                                                        <option value="Hybrid">Hybrid</option>
                                                    </select>
                                                </div>

                                                <div className="col-md-6">
                                                    <label className="form-label">Color</label>
                                                    <select className="form-select" name="color" value={selectedCar?.color || ''} onChange={handleChange} required>
                                                        <option value="" disabled>Select Color</option>
                                                        <option>Black</option>
                                                        <option>White</option>
                                                        <option>Silver</option>
                                                        <option>Gray</option>
                                                        <option>Red</option>
                                                        <option>Blue</option>
                                                        <option>Green</option>
                                                        <option>Brown</option>
                                                        <option>Beige</option>
                                                        <option>Gold</option>
                                                        <option>Orange</option>
                                                        <option>Yellow</option>
                                                        <option>Maroon</option>
                                                        <option>Purple</option>
                                                        <option>Other</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </form>
                                    </>
                                )}

                                {editSection === 'vehicleDetails' && (
                                    <>
                                        <h2 className="mb-4 text-primary">Edit Vehicle Details</h2>
                                        <form className="modal-form">
                                            <div className="row g-4">

                                                {/* Title Status */}
                                                <div className="col-md-6">
                                                    <label className="form-label">Title Status</label>
                                                    <select
                                                        className="form-select"
                                                        name="title_status"
                                                        value={selectedCar?.title_status || ''}
                                                        onChange={handleChange}
                                                        required
                                                    >
                                                        <option value="" disabled>Select Title Status</option>
                                                        <option value="Clean">Clean</option>
                                                        <option value="Salvage">Salvage</option>
                                                        <option value="Rebuilt">Rebuilt</option>
                                                    </select>
                                                </div>

                                                {/* Accident History */}
                                                <div className="col-md-6">
                                                    <label className="form-label d-block">Accident History</label>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="accident_history"
                                                            value="Yes"
                                                            id="accidentYes"
                                                            checked={selectedCar?.accident_history === 'Yes'}
                                                            onChange={handleChange}
                                                        />
                                                        <label className="form-check-label" htmlFor="accidentYes">Yes</label>
                                                    </div>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="accident_history"
                                                            value="No"
                                                            id="accidentNo"
                                                            checked={selectedCar?.accident_history === 'No'}
                                                            onChange={handleChange}
                                                        />
                                                        <label className="form-check-label" htmlFor="accidentNo">No</label>
                                                    </div>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="accident_history"
                                                            value="Unknown"
                                                            id="accidentUnknown"
                                                            checked={selectedCar?.accident_history === 'Unknown'}
                                                            onChange={handleChange}
                                                        />
                                                        <label className="form-check-label" htmlFor="accidentUnknown">Unknown</label>
                                                    </div>
                                                </div>

                                                {/* Service Records */}
                                                <div className="col-md-6">
                                                    <label className="form-label">Service Records Available</label>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="service_records"
                                                            value="Yes"
                                                            id="serviceYes"
                                                            checked={selectedCar?.service_records === 'Yes'}
                                                            onChange={handleChange}
                                                        />
                                                        <label className="form-check-label" htmlFor="serviceYes">Yes</label>
                                                    </div>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="service_records"
                                                            value="No"
                                                            id="serviceNo"
                                                            checked={selectedCar?.service_records === 'No'}
                                                            onChange={handleChange}
                                                        />
                                                        <label className="form-check-label" htmlFor="serviceNo">No</label>
                                                    </div>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="service_records"
                                                            value="Partial"
                                                            id="servicePartial"
                                                            checked={selectedCar?.service_records === 'Partial'}
                                                            onChange={handleChange}
                                                        />
                                                        <label className="form-check-label" htmlFor="servicePartial">Partial</label>
                                                    </div>
                                                </div>

                                                {/* Additional Features */}
                                                <div className="col-md-6">
                                                    <label className="form-label">Additional Features</label>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            name="additional_features"
                                                            value="Sunroof"
                                                            id="featureSunroof"
                                                            checked={selectedCar?.additional_features?.includes('Sunroof')}
                                                            onChange={handleChange}
                                                        />
                                                        <label className="form-check-label" htmlFor="featureSunroof">Sunroof</label>
                                                    </div>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            name="additional_features"
                                                            value="Leather Seats"
                                                            id="featureLeather"
                                                            checked={selectedCar?.additional_features?.includes('Leather Seats')}
                                                            onChange={handleChange}
                                                        />
                                                        <label className="form-check-label" htmlFor="featureLeather">Leather Seats</label>
                                                    </div>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            name="additional_features"
                                                            value="Navigation"
                                                            id="featureNavigation"
                                                            checked={selectedCar?.additional_features?.includes('Navigation')}
                                                            onChange={handleChange}
                                                        />
                                                        <label className="form-check-label" htmlFor="featureNavigation">Navigation</label>
                                                    </div>
                                                </div>

                                                {/* Inspection Availability */}
                                                <div className="col-md-6">
                                                    <label className="form-label">Available for Inspection</label>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="vehicle_available_for_inspection"
                                                            value="Yes"
                                                            id="inspectionYes"
                                                            checked={selectedCar?.vehicle_available_for_inspection === 'Yes'}
                                                            onChange={handleChange}
                                                        />
                                                        <label className="form-check-label" htmlFor="inspectionYes">Yes</label>
                                                    </div>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="vehicle_available_for_inspection"
                                                            value="No"
                                                            id="inspectionNo"
                                                            checked={selectedCar?.vehicle_available_for_inspection === 'No'}
                                                            onChange={handleChange}
                                                        />
                                                        <label className="form-check-label" htmlFor="inspectionNo">No</label>
                                                    </div>
                                                </div>

                                            </div>
                                        </form>
                                    </>
                                )}

                                {editSection === 'photos_media' && (
                                    <>
                                        <h2 className="mb-4 text-primary">Edit Photos & Media</h2>
                                        <form className="modal-form">
                                            <div className="row g-4">

                                                {/* Exterior Photos */}
                                                <div className="col-md-12">
                                                    <label className="form-label">Exterior Photos</label>
                                                    <input
                                                        type="file"
                                                        name="exterior_photos"
                                                        accept="image/*"
                                                        multiple
                                                        className="form-control"
                                                        onChange={handleChange}
                                                    />
                                                    {selectedCar?.exterior_photos && (
                                                        <div className="mt-2 d-flex gap-2 flex-wrap">
                                                            {(typeof selectedCar.exterior_photos === 'string'
                                                                ? JSON.parse(selectedCar.exterior_photos)
                                                                : Array.from(selectedCar.exterior_photos)
                                                            ).map((item, idx) => {
                                                                const src = typeof item === 'string'
                                                                    ? `http://localhost:5000${item}`
                                                                    : URL.createObjectURL(item);

                                                                return (
                                                                    <img
                                                                        key={idx}
                                                                        src={src}
                                                                        alt="Exterior"
                                                                        width={100}
                                                                        height={70}
                                                                        style={{ objectFit: 'cover', borderRadius: '8px' }}
                                                                    />
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Interior Photos */}
                                                <div className="col-md-12">
                                                    <label className="form-label">Interior Photos</label>
                                                    <input
                                                        type="file"
                                                        name="interior_photos"
                                                        accept="image/*"
                                                        multiple
                                                        className="form-control"
                                                        onChange={handleChange}
                                                    />
                                                    {selectedCar?.interior_photos && (
                                                        <div className="mt-2 d-flex gap-2 flex-wrap">
                                                            {(typeof selectedCar.interior_photos === 'string'
                                                                ? JSON.parse(selectedCar.interior_photos)
                                                                : Array.from(selectedCar.interior_photos)
                                                            ).map((item, idx) => {
                                                                const src = typeof item === 'string'
                                                                    ? `http://localhost:5000${item}`
                                                                    : URL.createObjectURL(item);

                                                                return (
                                                                    <img
                                                                        key={idx}
                                                                        src={src}
                                                                        alt="Interior"
                                                                        width={100}
                                                                        height={70}
                                                                        style={{ objectFit: 'cover', borderRadius: '8px' }}
                                                                    />
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Engine Bay Photo */}
                                                <div className="col-md-12">
                                                    <label className="form-label">Engine Bay Photo</label>
                                                    <input
                                                        type="file"
                                                        name="engine_bay_photo"
                                                        accept="image/*"
                                                        className="form-control"
                                                        onChange={handleChange}
                                                    />
                                                    {selectedCar?.engine_bay_photo && (
                                                        <div className="mt-2">
                                                            <img
                                                                src={typeof selectedCar.engine_bay_photo === 'string' ?
                                                                    `http://localhost:5000${selectedCar.engine_bay_photo}` :
                                                                    URL.createObjectURL(selectedCar.engine_bay_photo)
                                                                }
                                                                alt="Engine Bay"
                                                                width={100}
                                                                height={70}
                                                                style={{ objectFit: 'cover', borderRadius: '8px' }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Video Walkaround */}
                                                <div className="col-md-12">
                                                    <label className="form-label">Video Walkaround (optional)</label>
                                                    <input
                                                        type="file"
                                                        name="video_walkaround"
                                                        accept="video/*"
                                                        className="form-control"
                                                        onChange={handleChange}
                                                    />
                                                    {selectedCar?.video_walkaround && (
                                                        <div className="mt-2">
                                                            <video
                                                                src={`http://localhost:5000${selectedCar.video_walkaround}`}
                                                                width={200}
                                                                height={150}
                                                                controls
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Vehicle Documents */}
                                                <div className="col-md-12">
                                                    <label className="form-label">Vehicle Documents</label>
                                                    <input
                                                        type="file"
                                                        name="documents"
                                                        accept=".pdf,.doc,.jpg,.jpeg,.png"
                                                        multiple
                                                        className="form-control"
                                                        onChange={handleChange}
                                                    />
                                                    {selectedCar?.documents && (
                                                        <div className="mt-2">
                                                            {Array.isArray(selectedCar.documents) &&
                                                                selectedCar.documents.map((docPath, idx) => (
                                                                    <div key={idx}>
                                                                        {typeof docPath === 'string' ? (
                                                                            <a
                                                                                href={docPath.startsWith('http') ? docPath : `http://localhost:5000${docPath}`}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                            >
                                                                                {docPath.split('/').pop()}
                                                                            </a>
                                                                        ) : (
                                                                            <span>Invalid document path</span>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                        </div>
                                                    )}
                                                </div>

                                            </div>
                                        </form>
                                    </>
                                )}

                                {editSection === 'bidding_info' && (
                                    <>
                                        <h2 className="mb-4 text-primary">Edit Bidding Info</h2>
                                        <form className="modal-form">
                                            <div className="row g-4">

                                                <div className="col-md-12">
                                                    <label className="form-label">Starting Bid</label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        name="starting_bid"
                                                        value={selectedCar?.starting_bid || ''}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>

                                                <div className="col-md-12">
                                                    <label className="form-label">Bidding End Date/Time</label>
                                                    <input
                                                        type="datetime-local"
                                                        className="form-control"
                                                        name="bidding_end_time"
                                                        value={formatToLocalDatetime(selectedCar?.bidding_end_time)}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>

                                                <div className="col-md-12">
                                                    <label className="form-label">Buy It Now Price</label>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        name="buy_now_price"
                                                        value={selectedCar?.buy_now_price || ''}
                                                        onChange={handleChange}
                                                    />
                                                </div>

                                                <div className="col-md-12">
                                                    <label className="form-label">Bidding Increment</label>
                                                    <select
                                                        className="form-select"
                                                        name="bidding_increment"
                                                        value={selectedCar?.bidding_increment || ''}
                                                        onChange={handleChange}
                                                        required
                                                    >
                                                        <option value="" disabled>Select Bidding Increment</option>
                                                        <option value="100">$100</option>
                                                        <option value="250">$250</option>
                                                        <option value="500">$500</option>
                                                        <option value="1000">$1000</option>
                                                        <option value="custom">Custom</option>
                                                    </select>
                                                </div>

                                            </div>
                                        </form>
                                    </>
                                )}

                                {editSection === 'seller_info' && (
                                    <>
                                        <h2 className="mb-4 text-primary">Edit Seller Info</h2>
                                        <form className="modal-form">
                                            <div className="row g-4">

                                                <div className="col-md-12">
                                                    <label className="form-label">Seller Name</label>
                                                    <input
                                                        className="form-control"
                                                        name="seller_name"
                                                        value={selectedCar?.seller_name || ''}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>

                                                <div className="col-md-12">
                                                    <label className="form-label">Contact Email</label>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        name="contact_email"
                                                        value={selectedCar?.contact_email || ''}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>

                                                <div className="col-md-12">
                                                    <label className="form-label">Contact Phone</label>
                                                    <input
                                                        type="tel"
                                                        className="form-control"
                                                        name="contact_phone"
                                                        value={selectedCar?.contact_phone || ''}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>

                                                <div className="col-md-12">
                                                    <label className="form-label">Location</label>
                                                    <input
                                                        className="form-control"
                                                        name="location"
                                                        value={selectedCar?.location || ''}
                                                        onChange={handleChange}
                                                        required
                                                    />
                                                </div>

                                                <div className="col-md-12">
                                                    <label className="form-label d-block">Available for Inspection</label>
                                                    <div className="form-check form-check-inline">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="seller_available_for_inspection"
                                                            value="Yes"
                                                            id="sellerInspectionYes"
                                                            checked={selectedCar?.seller_available_for_inspection === 'Yes'}
                                                            onChange={handleChange}
                                                        />
                                                        <label className="form-check-label" htmlFor="sellerInspectionYes">Yes</label>
                                                    </div>
                                                    <div className="form-check form-check-inline">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="seller_available_for_inspection"
                                                            value="No"
                                                            id="sellerInspectionNo"
                                                            checked={selectedCar?.seller_available_for_inspection === 'No'}
                                                            onChange={handleChange}
                                                        />
                                                        <label className="form-check-label" htmlFor="sellerInspectionNo">No</label>
                                                    </div>
                                                </div>

                                            </div>
                                        </form>
                                    </>
                                )}

                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Close
                                </button>
                                <button className='btn btn-primary' onClick={handleModalSave}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );

};

export default CarUploadsData;
