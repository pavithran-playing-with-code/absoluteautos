import React, { useState, useEffect } from 'react';
import './CarUpload.css';

const CarUpload = () => {
    const [carDetails, setCarDetails] = useState({});
    const [agreed, setAgreed] = useState(false);

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

    const handleChange = (e) => {
        const { name, value, files, type, checked } = e.target;

        if (type === 'file') {
            if (e.target.multiple) {
                setCarDetails((prev) => ({ ...prev, [name]: Array.from(files) }));
            } else {
                setCarDetails((prev) => ({ ...prev, [name]: files[0] }));
            }
        } else if (type === 'checkbox') {
            if (name === 'additional_features') {
                setCarDetails((prev) => {
                    const additional_features = prev.additional_features || [];
                    if (checked) {
                        return { ...prev, additional_features: [...additional_features, value] };
                    } else {
                        return { ...prev, additional_features: additional_features.filter(f => f !== value) };
                    }
                });
            } else {
                setCarDetails((prev) => ({ ...prev, [name]: checked }));
            }
        } else {
            setCarDetails((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Basic validation
        const requiredFields = [
            "make", "model", "purchase_year", "vin", "mileage", "car_condition",
            "transmission", "drive_type", "fuel_type", "color", "title_status",
            "accident_history", "service_records", "seller_available_for_inspection",
            "starting_bid", "bidding_end_time", "buy_now_price", "bidding_increment",
            "seller_name", "contact_email"
        ];

        for (const field of requiredFields) {
            if (!carDetails[field]) {
                alert(`Please fill in the "${field}" field.`);
                return;
            }
        }

        // Check if at least one exterior and one interior photo is uploaded
        if (!carDetails.exterior_photos || carDetails.exterior_photos.length === 0) {
            alert("Please upload at least one exterior photo.");
            return;
        }

        if (!carDetails.interior_photos || carDetails.interior_photos.length === 0) {
            alert("Please upload at least one interior photo.");
            return;
        }

        if (!carDetails.engine_bay_photo) {
            alert("Please upload an engine bay photo.");
            return;
        }

        if (!carDetails.documents || carDetails.documents.length === 0) {
            alert("Please upload at least one vehicle document.");
            return;
        }

        // Validate email format (basic)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(carDetails.contact_email)) {
            alert("Please enter a valid email address.");
            return;
        }

        if (!agreed) {
            alert("Please agree to the Terms and Conditions before submitting.");
            return;
        }

        // Proceed with the same FormData logic
        const formData = new FormData();

        // Append fields
        for (const key in carDetails) {
            if (
                key !== "exterior_photos" &&
                key !== "interior_photos" &&
                key !== "engine_bay_photo" &&
                key !== "video_walkaround" &&
                key !== "documents" &&
                key !== "additional_features"
            ) {
                formData.append(key, carDetails[key]);
            }
        }

        if (Array.isArray(carDetails.additional_features)) {
            carDetails.additional_features.forEach((feature, i) => {
                formData.append(`additional_features[${i}]`, feature);
            });
        }

        const fileFields = ['exterior_photos', 'interior_photos', 'documents'];
        fileFields.forEach(field => {
            if (Array.isArray(carDetails[field])) {
                carDetails[field].forEach(file => {
                    formData.append(field, file);
                });
            }
        });

        if (carDetails.engine_bay_photo) formData.append('engine_bay_photo', carDetails.engine_bay_photo);
        if (carDetails.video_walkaround) formData.append('video_walkaround', carDetails.video_walkaround);

        const profileId = localStorage.getItem("profileId");
        if (profileId) formData.append("profile_id", profileId);
        
        try {
            const response = await fetch('http://localhost:5000/api/carupload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                alert('Car uploaded successfully!');
            } else {
                alert(`Upload failed: ${result.message}`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('An error occurred while uploading the car.');
        }
    };

    return (
        <div className="upload-container">
            <form className="upload-form" onSubmit={handleSubmit}>
                <h2>Upload Car for Bidding</h2>

                <div className="form-container">
                    <div className="left-column">
                        <div className="card-section">
                            <h3>Vehicle Information</h3>
                            <label>Make</label>
                            <input name="make" onChange={handleChange} required />
                            <label>Model</label>
                            <input name="model" onChange={handleChange} required />
                            <label>Purchase Year</label>
                            <select name="purchase_year" onChange={handleChange} required>
                                {[...Array(new Date().getFullYear() - 1989).keys()].map(i => {
                                    const purchase_year = 1990 + i;
                                    return <option key={purchase_year} value={purchase_year}>{purchase_year}</option>
                                })}
                            </select>
                            <label>VIN</label>
                            <input name="vin" onChange={handleChange} required />
                            <label>Mileage</label>
                            <input type="number" name="mileage" onChange={handleChange} required />
                            <label>Vehicle Condition</label>
                            <select name="car_condition" onChange={handleChange} required>
                                <option value="" disabled selected>Select Car Condition</option>
                                <option>Excellent</option>
                                <option>Good</option>
                                <option>Fair</option>
                                <option>Poor</option>
                            </select>
                            <label>Transmission Type</label>
                            <select name="transmission" onChange={handleChange} required>
                                <option value="" disabled selected>Select Transmission Type</option>
                                <option>Automatic</option>
                                <option>Manual</option>
                                <option>CVT</option>
                            </select>
                            <label>Drive Type</label>
                            <select name="drive_type" onChange={handleChange} required>
                                <option value="" disabled selected>Select Drive Type</option>
                                <option>FWD</option>
                                <option>RWD</option>
                                <option>AWD</option>
                                <option>4WD</option>
                            </select>
                            <label>Fuel Type</label>
                            <select name="fuel_type" onChange={handleChange} required>
                                <option value="" disabled selected>Select Fuel Type</option>
                                <option>Gasoline</option>
                                <option>Diesel</option>
                                <option>Electric</option>
                                <option>Hybrid</option>
                            </select>
                            <label>Color</label>
                            <select name="color" onChange={handleChange} required>
                                <option value="" disabled selected>Select Color</option>
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

                        <div className="card-section">
                            <h3>Vehicle Details</h3>
                            <label>Title Status</label>
                            <select name="title_status" onChange={handleChange} required>
                                <option value="" disabled selected>Select Title Status</option>
                                <option>Clean</option>
                                <option>Salvage</option>
                                <option>Rebuilt</option>
                            </select>
                            <label>Accident History</label>
                            <div className="radio-group">
                                <label><input type="radio" name="accident_history" value="Yes" onChange={handleChange} /> Yes</label>
                                <label><input type="radio" name="accident_history" value="No" onChange={handleChange} /> No</label>
                                <label><input type="radio" name="accident_history" value="Unknown" onChange={handleChange} /> Unknown</label>
                            </div>

                            <label>Service Records Available</label>
                            <div className="radio-group">
                                <label><input type="radio" name="service_records" value="Yes" onChange={handleChange} /> Yes</label>
                                <label><input type="radio" name="service_records" value="No" onChange={handleChange} /> No</label>
                                <label><input type="radio" name="service_records" value="Partial" onChange={handleChange} /> Partial</label>
                            </div>

                            <label>Additional additional_features</label>
                            <div className="checkbox-group">
                                <label><input type="checkbox" name="additional_features" value="Sunroof" onChange={handleChange} /> Sunroof</label>
                                <label><input type="checkbox" name="additional_features" value="Leather Seats" onChange={handleChange} /> Leather Seats</label>
                                <label><input type="checkbox" name="additional_features" value="Navigation" onChange={handleChange} /> Navigation</label>
                            </div>

                            <label>Available for Inspection</label>
                            <div className="radio-group">
                                <label>
                                    <input
                                        type="radio"
                                        name="vehicle_available_for_inspection"
                                        value="Yes"
                                        checked={carDetails.vehicle_available_for_inspection === "Yes"}
                                        onChange={handleChange}
                                    /> Yes
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="vehicle_available_for_inspection"
                                        value="No"
                                        checked={carDetails.vehicle_available_for_inspection === "No"}
                                        onChange={handleChange}
                                    /> No
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="right-column">
                        <div className="card-section">
                            <h3>Photos & Media</h3>
                            <label>Exterior Photos</label>
                            <input type="file" name="exterior_photos" accept="image/*" multiple onChange={handleChange} required />
                            <label>Interior Photos</label>
                            <input type="file" name="interior_photos" accept="image/*" multiple onChange={handleChange} required />
                            <label>Engine Bay Photo</label>
                            <input type="file" name="engine_bay_photo" accept="image/*" onChange={handleChange} required />
                            <label>video_walkaround Walkaround (optional)</label>
                            <input type="file" name="video_walkaround" accept="video_walkaround/*" onChange={handleChange} />
                            <label>Vehicle Documents</label>
                            <input type="file" name="documents" accept=".pdf,.doc,.jpg,.jpeg,.png" multiple onChange={handleChange} />
                        </div>

                        <div className="card-section">
                            <h3>Bidding Information</h3>
                            <label>Starting Bid</label>
                            <input type="number" name="starting_bid" onChange={handleChange} required />
                            <label>Bidding End Date/Time</label>
                            <input type="datetime-local" name="bidding_end_time" onChange={handleChange} required />
                            <label>Buy It Now Price</label>
                            <input type="number" name="buy_now_price" onChange={handleChange} />
                            <label>Bidding Increment</label>
                            <select name="bidding_increment" onChange={handleChange} required>
                                <option value="" disabled selected>Select Bidding Increament</option>
                                <option value="100">$100</option>
                                <option value="250">$250</option>
                                <option value="500">$500</option>
                                <option value="1000">$1000</option>
                                <option value="custom">Custom</option>
                            </select>
                        </div>

                        <div className="card-section">
                            <h3>Seller Information</h3>
                            <label>Seller Name</label>
                            <input name="seller_name" onChange={handleChange} required />
                            <label>Contact Email</label>
                            <input type="email" name="contact_email" onChange={handleChange} required />
                            <label>Contact Phone</label>
                            <input type="tel" name="contact_phone" onChange={handleChange} required />
                            <label>Location</label>
                            <input name="location" onChange={handleChange} required />
                            <label>Available for Inspection</label>
                            <div className="radio-group">
                                <label><input type="radio" name="seller_available_for_inspection" value="Yes" onChange={handleChange} /> Yes</label>
                                <label><input type="radio" name="seller_available_for_inspection" value="No" onChange={handleChange} /> No</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-section">
                    <h3>Agreement</h3>
                    <label className="terms">
                        <input
                            type="checkbox"
                            name="terms"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                        />
                        <span>I agree to the Terms and Conditions</span>
                    </label>
                </div>

                <button type="submit">  <i class="fas fa-car me-2"></i>Submit Car</button>
            </form>
        </div>
    );
};

export default CarUpload;
