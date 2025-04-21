import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Layout";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import Home from "./Home";
import Profile from "./Profile";
import FAQ from "./FAQ";
import ContactUs from "./ContactUs";
import CarUpload from "./CarUpload";
import CarUploadsData from "./CarUploadsData";
import './App.css';

function App() {
  return (
    <Routes>

      <Route
        path="/SignUp"
        element={
          <Layout>
            <SignUp />
          </Layout>
        }
      />

      <Route
        path="/signin"
        element={
          <Layout>
            <SignIn />
          </Layout>
        }
      />

      <Route
        path="/home"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />

      <Route
        path="/Profile"
        element={
          <Layout>
            <Profile />
          </Layout>
        }
      />

      <Route
        path="/FAQ"
        element={
          <Layout>
            <FAQ />
          </Layout>
        }
      />

      <Route
        path="/ContactUs"
        element={
          <Layout>
            <ContactUs />
          </Layout>
        }
      />

      <Route
        path="/CarUpload"
        element={
          <Layout>
            <CarUpload />
          </Layout>
        }
      />

      <Route
        path="/CarUploadsData"
        element={
          <Layout>
            <CarUploadsData />
          </Layout>
        }
      />

      {/* Redirect root to SignIn page */}
      <Route path="/" element={<Navigate to="/signin" />} />
    </Routes>
  );
}

export default App;
