import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import "./Header.css";

const Header = () => {
    const navigate = useNavigate();

    return (
        <div className="header">
            <div className="header-left">
                <a className="navbar-brand" href="#">
                    AbsoluteAutos
                </a>
            </div>
        </div>
    );
};

export default Header;
