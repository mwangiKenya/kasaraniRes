import React from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";

function Footer() {
    return(
        <>
             <footer className="footer">
      <div className="footer-container">

        {/* Company Summary */}
        <div className="footer-section">
          <h3>KasaraniRes Ltd</h3>
          <p>
            Kasarani Res Ltd is a trusted provider of borehole water supply and rental 
            housing solutions in Kasarani, Nairobi. We are committed to delivering 
            reliable services with professionalism and integrity.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#">About Us</a></li>
            <li><a href="#">Our Services</a></li>
            <li><a href="#">Rental Houses</a></li>
            <li><a href="#">Water Supply</a></li>
            <li><a href="#">Contact Us</a></li>
          </ul>
        </div>

        {/* Our Services */}
        <div className="footer-section">
          <h4>Our Services</h4>
          <ul>
            <li>Borehole Water Delivery</li>
            
            <li>Metered Water Connections</li>
            <li>Residential House Rentals</li>
            
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h4>Contact Information</h4>
          <ul className="contact-info">
            <li><FaPhone /> +254 7XX 345 678</li>
            <li><FaEnvelope /> info@karaniresltd.co.ke</li>
            <li><FaMapMarkerAlt /> Kasarani, Nairobi, Kenya</li>
          </ul>

          <div className="social-icons">
            <a href="#"><FaFacebook /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaInstagram /></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Kasarani Res Ltd. All Rights Reserved.</p>
      </div>
    </footer>
        </>
    );
}

export default Footer;