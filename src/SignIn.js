import React, { useState, useEffect } from 'react';
import carBg from './asset/car-bg.png';

const SignIn = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        const isLoggedIn = localStorage.getItem("isLoggedIn");
        const userId = localStorage.getItem("profileId");

        if (isLoggedIn == "true" && userId != "") {
            window.location.href = "/profile";
            return;
        }

    }, []);

    const handleSignIn = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const result = await response.json();

            if (result.success) {
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("profileId", result.profileId); // ✅ Store profileId
                window.location.href = "/home";
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error('Login failed', error);
            alert('Server error');
        }
    };

    return (
        <div
            style={{
                backgroundImage: `url(${carBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <div style={{
                backgroundColor: "rgba(255, 255, 255, 0.85)",
                padding: "40px",
                width: "320px",
                borderRadius: "10px",
                boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                marginLeft: "-50%",
            }}>
                <h2 style={{ textAlign: "center", marginBottom: "25px", fontSize: "24px" }}>Sign In</h2>

                <div style={{ marginBottom: "18px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "5px",
                            border: "1px solid #ccc"
                        }}
                    />
                </div>

                <div style={{ marginBottom: "25px" }}>
                    <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "5px",
                            border: "1px solid #ccc"
                        }}
                    />
                </div>

                <button
                    onClick={handleSignIn}
                    style={{
                        width: "100%",
                        padding: "10px",
                        backgroundColor: "#ffcc00",
                        border: "none",
                        borderRadius: "5px",
                        fontWeight: "bold",
                        fontSize: "15px",
                        cursor: "pointer"
                    }}>
                    Sign In
                </button>
            </div>
        </div>
    );
};

export default SignIn;
