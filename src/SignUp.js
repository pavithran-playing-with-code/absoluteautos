import React, { useState } from 'react';
import './SignUp.css';

const Signup = () => {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        registrationType: 'Corporate',
        companyName: '',
        companyAddress: '',
        officeNumber: '',
        contactPerson: '',
        mobileNumber: '',
        email: '',
        fax: '',
        acraFile: null,
        insuranceFile: null,
        nameCardFile: null,
        authorizationLetter: null,
    });

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Manual validation for required fields
        const requiredFields = [
            { key: 'companyName', label: 'Company Name' },
            { key: 'companyAddress', label: 'Company Address' },
            { key: 'contactPerson', label: 'Contact Person' },
            { key: 'mobileNumber', label: 'Mobile Number' },
            { key: 'email', label: 'Email Address' },
            { key: 'acraFile', label: 'ACRA Business Profile' },
            { key: 'insuranceFile', label: 'Motor Trade Insurance' },
            { key: 'nameCardFile', label: 'Name Card' },
        ];

        for (let field of requiredFields) {
            if (!formData[field.key]) {
                alert(`${field.label} is required.`);
                return;
            }
        }

        try {
            // 1. Send profile data
            const profileResponse = await fetch('http://localhost:5000/api/saveProfile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    company_name: formData.companyName,
                    company_type: formData.registrationType,
                    mailing_address: formData.companyAddress,
                    billing_address: formData.companyAddress,
                    telephone: formData.officeNumber,
                    fax: formData.fax,
                    website: '',
                    contact_person1: formData.contactPerson,
                    contact_number1: formData.mobileNumber,
                    email1: formData.email,
                    contact_person2: '',
                    contact_number2: '',
                    email2: ''
                }),
            });

            const profileResult = await profileResponse.json();

            if (!profileResult.success) {
                alert("Failed to save profile");
                return;
            }

            const profileId = profileResult.profileId;

            // 2. Convert files to base64 (same as before)
            const convertToBase64 = (file) => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result.split(',')[1]);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            };

            const docs = [];
            if (formData.acraFile) docs.push({ name: "ACRA", base64: await convertToBase64(formData.acraFile) });
            if (formData.insuranceFile) docs.push({ name: "Insurance", base64: await convertToBase64(formData.insuranceFile) });
            if (formData.nameCardFile) docs.push({ name: "NameCard", base64: await convertToBase64(formData.nameCardFile) });
            if (formData.authorizationLetter) docs.push({ name: "AuthorizationLetter", base64: await convertToBase64(formData.authorizationLetter) });

            // 3. Upload documents
            const uploadResponse = await fetch('http://localhost:5000/api/uploadDocuments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profileId, documents: docs }),
            });

            const uploadResult = await uploadResponse.json();

            if (!uploadResult.success) {
                alert("Failed to upload documents.");
                return;
            }

            // 4. Send email after successful upload
            const emailResponse = await fetch('http://localhost:5000/api/sendEmail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    profileId,
                    email: formData.email,
                    companyName: formData.companyName,
                    contactPerson: formData.contactPerson,
                    mobileNumber: formData.mobileNumber
                }),
            });

            const emailResult = await emailResponse.json();

            if (emailResult.success) {
                setSubmitted(true); // show confirmation message
            } else {
                alert("Failed to send email and update profile");
            }

        } catch (error) {
            console.error("Error during registration:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false); // Always reset loading state
        }
    };

    return (
        <div className="signup-container container py-5">
            {loading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <div>Sending email, please wait...</div>
                </div>
            )}

            {submitted ? (
                <div className="confirmation-message bg-light p-4 rounded shadow-sm">
                    <h2 className="text-success">Welcome!</h2>
                    <p className="mt-3">
                        Thank you for your interest in <strong>Auto Selection (Wholesale) bidding</strong>.
                        <br /><br />
                        To complete your registration, kindly upload the following:
                    </p>
                    <ul className="list-unstyled ps-3">
                        <li>✅ <strong>Valid ACRA dated within 1 month</strong> <span className="text-danger">*</span></li>
                        <li>✅ <strong>Motor trade insurance</strong> <span className="text-danger">*</span></li>
                        <li>✅ <strong>Name Card</strong> <span className="text-danger">*</span></li>
                        <li>📄 Letter of authorization from Director (optional)</li>
                    </ul>
                    <p className="mt-3">
                        For further enquiries, please call us at <strong>6200 0914</strong>
                        <br />
                        <small className="text-muted">(9:00AM to 6:00PM, Monday - Friday)</small>
                    </p>
                    <p className="thank-you-msg mt-4 alert alert-info">
                        <strong>Thank you. Your registration has been saved. We will email the login information to you once the registration process is completed.</strong>
                    </p>
                </div>
            ) : (
                <>
                    {/* Welcome Box Above Form */}
                    <div className="bg-light p-4 rounded shadow-sm mb-4">
                        <h2 className="text-primary">Welcome!</h2>
                        <p className="mt-2">
                            Thank you for your interest in <strong>Auto Selection (Wholesale) bidding</strong>.
                            <br /><br />
                            To complete your registration, kindly upload the following:
                        </p>
                        <ul className="list-unstyled ps-3">
                            <li>✅ <strong>Valid ACRA dated within 1 month</strong> <span className="text-danger">*</span></li>
                            <li>✅ <strong>Motor trade insurance</strong> <span className="text-danger">*</span></li>
                            <li>✅ <strong>Name Card</strong> <span className="text-danger">*</span></li>
                            <li>📄 Letter of authorization from Director (optional)</li>
                        </ul>
                        <p className="mt-3">
                            For further enquiries, please call us at <strong>6200 0914</strong>
                            <br />
                            <small className="text-muted">(9:00AM to 6:00PM, Monday - Friday)</small>
                        </p>
                    </div>

                    {/* Form Starts Here */}
                    <form onSubmit={handleSubmit} className="signup-form">
                        <div className="form-group">
                            <label>Registration Type</label>
                            <input type="text" value="Corporate" readOnly />
                        </div>

                        <div className="form-group">
                            <label>Company Name <span className="required">*</span></label>
                            <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Company Address <span className="required">*</span></label>
                            <input type="text" name="companyAddress" value={formData.companyAddress} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Office Number:</label>
                            <input type="text" name="officeNumber" value={formData.officeNumber} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label>Contact Person <span className="required">*</span></label>
                            <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Mobile Number <span className="required">*</span></label>
                            <input type="text" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Email Address <span className="required">*</span></label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Fax:</label>
                            <input type="text" name="fax" value={formData.fax} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label>ACRA Business Profile (dated within 1 month) <span className="required">*</span></label>
                            <input type="file" name="acraFile" onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Motor Trade Insurance <span className="required">*</span></label>
                            <input type="file" name="insuranceFile" onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Name Card <span className="required">*</span></label>
                            <input type="file" name="nameCardFile" onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Letter of Authorization from Director</label>
                            <input type="file" name="authorizationLetter" onChange={handleChange} />
                        </div>

                        <p className="required-note">* Mandatory fields</p>

                        <button type="submit" className="btn btn-warning mt-3 submit-btn">Submit</button>
                    </form>
                </>
            )}
        </div>
    );

};

export default Signup;
