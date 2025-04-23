import React from 'react';
import './AboutUs.css';

const AboutUs = () => {
    return (
        <div className="about-container">
            <h1 className="about-heading">Welcome to Auto Selection (Wholesale)</h1>
            <p className="about-paragraph">
                Auto Selection (Wholesale) offers a wide range of quality vehicles available for tender on a weekly basis.
                Backed by a dedicated and experienced purchasing team with extensive market and product knowledge, we are confident in sourcing
                the finest cars ideally suited to our dealers’ needs.
            </p>

            <p className="about-paragraph">
                We understand the importance of quick and hassle-free bidding for our dealers. To ensure a seamless process,
                we’ve introduced a dedicated website portal that allows our valued dealers to source the best vehicles conveniently.
            </p>

            <p className="about-paragraph">
                The website portal enables dealers to participate in weekly online bidding and view all available cars beforehand
                through photos uploaded to the site.
            </p>

            <p className="about-paragraph">
                At Auto Selection (Wholesale), we are committed to providing a rewarding and efficient bidding experience for all our dealers.
                <strong> Get started and place your bid with us today!</strong>
            </p>
        </div>
    );
};

export default AboutUs;
