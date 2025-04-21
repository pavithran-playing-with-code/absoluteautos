import React, { useRef, useEffect, useState } from 'react';
import './Profile.css';

function Profile() {
    const formRef = useRef(null);
    const [profileData, setProfileData] = useState({});

    useEffect(() => {
        const isLoggedIn = localStorage.getItem("isLoggedIn");
        const userId = localStorage.getItem("profileId");

        if (isLoggedIn !== "true") {
            window.location.href = "/";
            return;
        }

        // Fetch and populate profile data
        fetch(`http://localhost:5000/api/getProfile/${userId}`)
            .then(res => res.json())
            .then(response => {
                if (response.success) {
                    setProfileData(response.data);
                }
            })
            .catch(err => {
                console.error("Failed to load profile data", err);
            });
    }, []);

    const handleChangePassword = async () => {
        const form = formRef.current;
        const data = {};
        const inputs = form.querySelectorAll('input, select, textarea');

        inputs.forEach((input) => {
            if (input.type === 'file') return;
            const label = input.previousSibling?.textContent?.trim() || input.name;
            data[label] = input.value;
        });

        const currentPassword = data['Existing Password'];
        const newPassword = data['New Password'];
        const confirmPassword = data['Confirm Password'];
        const profileId = localStorage.getItem("profileId");

        if (!currentPassword || !newPassword || !confirmPassword) {
            return alert('Please fill all password fields.');
        }

        if (newPassword !== confirmPassword) {
            return alert('New password and confirm password do not match.');
        }

        // Verify current password with backend using ID
        const verifyRes = await fetch('http://localhost:5000/api/verifyPassword', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: profileId, currentPassword }),
        });

        const verifyResult = await verifyRes.json();
        if (!verifyResult.success) {
            return alert('Existing password is incorrect.');
        }

        // If correct, update password using ID
        const updatePassRes = await fetch('http://localhost:5000/api/updatePassword', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: profileId, newPassword }),
        });

        const updateResult = await updatePassRes.json();
        if (updateResult.success) {
            alert('Password updated successfully!');
            window.location.reload();
        } else {
            alert('Error updating password.');
        }
    };

    const handleSave = async () => {
        const form = formRef.current;
        const data = {};
        const inputs = form.querySelectorAll('input, select, textarea');

        inputs.forEach((input) => {
            if (input.type === 'file') return;
            const label = input.previousSibling?.textContent?.trim() || input.name;
            data[label] = input.value;
        });

        const profileId = localStorage.getItem("profileId");

        // Update profile data (contact info, company info)
        const formattedData = {
            user_id: profileId,
            company_name: data['Company Name *'],
            company_type: data['Company Type'],
            mailing_address: data['Mailing Address'],
            billing_address: data['Billing Address'],
            telephone: data['Telephone'],
            fax: data['Fax'],
            website: data['Website'],
            contact_person1: data['1st Contact Person *'],
            contact_number1: data['Contact Number *'],
            email1: data['Email Address *'],
            contact_person2: data['2nd Contact Person'],
            contact_number2: data['Contact Number'],
            email2: data['Email Address'],
        };

        const res = await fetch('http://localhost:5000/api/updateProfile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formattedData),
        });

        const response = await res.json();
        if (response.success) {
            alert('Profile data updated successfully!');
            window.location.reload();
        }
    };

    const handleUpload = async () => {
        const profileId = localStorage.getItem('profileId');
        if (!profileId) return alert('Please save the profile first.');

        const form = formRef.current;
        const fileInputs = form.querySelectorAll('input[type="file"]');
        const documents = [];

        for (let input of fileInputs) {
            const file = input.files[0];
            if (file) {
                const base64 = await toBase64(file);
                documents.push({ name: file.name, base64 });
            }
        }

        const res = await fetch('http://localhost:5000/api/uploadDocuments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profileId, documents }),
        });

        const result = await res.json();
        if (result.success) {
            alert('Documents uploaded successfully!');
            window.location.reload();
        }        
    };

    const toBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });

    const handleReset = () => {
        const form = formRef.current;
        const inputs = form.querySelectorAll('input, select, textarea');

        inputs.forEach((input) => {
            if (input.type === 'file') return; // skip file inputs

            const hasDefault = input.defaultValue !== undefined && input.defaultValue !== '';
            if (!hasDefault) {
                input.value = '';
            }
        });
    };

    return (
        <div className="container profile-container">
            <div className="profile-card">
                <h2>👤 MY ACCOUNT</h2>

                <form ref={formRef}>
                    <div className="row">
                        <div className="col-md-6">
                            <p>Keep us updated with your latest profile.</p>
                            <p className="text-danger fw-bold">* Mandatory fields</p>

                            <div className="section-title">🔒 Password Update</div>
                            {['Existing Password', 'New Password', 'Confirm Password'].map((label, i) => (
                                <div className="mb-3" key={i}>
                                    <label>{label}</label>
                                    <input type="password" className="form-control" />
                                </div>
                            ))}

                            <button
                                type="button"
                                className="btn btn-warning btn-upload w-100"
                                onClick={handleChangePassword}
                            >
                                <i className="fas fa-key me-2"></i>Change Password
                            </button>

                            <div className="section-title">🏢 Company Info</div>
                            <div className="mb-3">
                                <label>Company Name *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    defaultValue={profileData?.company_name || ''}
                                />
                            </div>

                            <div className="mb-3">
                                <label>Company Type</label>
                                <select className="form-select" value={profileData?.company_type || ''}>
                                    <option value="">Select Type</option>
                                    <option value="Private Limited">Private Limited</option>
                                    <option value="Sole Proprietor">Sole Proprietor</option>
                                    <option value="Partnership">Partnership</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label>Mailing Address</label>
                                <textarea
                                    className="form-control"
                                    rows="2"
                                    defaultValue={profileData?.mailing_address || ''}
                                ></textarea>
                            </div>

                            <div className="mb-3">
                                <label>Billing Address</label>
                                <textarea
                                    className="form-control"
                                    rows="2"
                                    defaultValue={profileData?.billing_address || ''}
                                ></textarea>
                            </div>

                            <div className="section-title">📞 Contact Info</div>
                            {['Telephone', 'Fax', 'Website'].map((label, i) => (
                                <div className="mb-3" key={i}>
                                    <label>{label}</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        defaultValue={profileData?.[label.toLowerCase()] || ''}
                                    />
                                </div>
                            ))}

                            <div className="mb-3">
                                <label>1st Contact Person *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    defaultValue={profileData?.contact_person1 || ''}
                                />
                            </div>

                            <div className="mb-3">
                                <label>Contact Number *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    defaultValue={profileData?.contact_number1 || ''}
                                />
                            </div>

                            <div className="mb-3">
                                <label>Email Address *</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    defaultValue={profileData?.email1 || ''}
                                />
                            </div>

                            <div className="mb-3">
                                <label>2nd Contact Person</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    defaultValue={profileData?.contact_person2 || ''}
                                />
                            </div>

                            <div className="mb-3">
                                <label>Contact Number</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    defaultValue={profileData?.contact_number2 || ''}
                                />
                            </div>

                            <div className="mb-3">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    defaultValue={profileData?.email2 || ''}
                                />
                            </div>

                            <div className="d-flex justify-content-between gap-3" style={{ marginTop: "30px" }}>
                                <button
                                    type="button"
                                    className="btn btn-warning btn-upload w-50"
                                    onClick={handleReset}
                                >
                                    <i className="fas fa-undo-alt me-2"></i>Reset
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-warning btn-upload w-50"
                                    onClick={handleSave}
                                >
                                    <i className="fas fa-save me-2"></i>Save
                                </button>
                            </div>
                        </div>

                        <div className="col-md-6">
                            <p className="text-danger fw-bold">✅ YOU ARE VERIFIED.</p>
                            <p>You are NOT required to upload the following documents unless there are changes.</p>
                            <p className="text-danger fw-bold">* Mandatory Document</p>

                            <div className="section-title">📂 Document Upload</div>
                            {[
                                'ACRA Business Profile (dated within 1 month) *',
                                'Motor Trade Insurance *',
                                'Name Card *',
                                'Letter of Authorization from Director',
                            ].map((docLabel, i) => (
                                <div className="mb-3" key={i}>
                                    <label>{docLabel}</label>
                                    <input type="file" className="form-control" />
                                </div>
                            ))}

                            <button
                                type="button"
                                className="btn btn-warning mt-3 btn-upload"
                                onClick={handleUpload}
                            >
                                <i className="fas fa-cloud-upload-alt me-2"></i>UPLOAD DOCUMENTS
                            </button>

                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Profile;
