import React from "react";
import Header from "./Header";
import ContactHeader from "./ContactHeader";
import MenuHeader from "./MenuHeader";
import Footer from "./Footer";
import "./App.css";

const Layout = ({ children }) => {
    return (
        <div className="app-container">
            <Header />
            <ContactHeader />
            <MenuHeader />
            <div className="main-layout">
                <div className="content">{children}</div>
            </div>
            <Footer />
        </div>

    );
};

export default Layout;
