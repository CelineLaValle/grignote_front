import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import '../styles/layout/_footer.scss'

function Footer() {
    return (
    <div> 
        <div className="footer" >
            <h2 className='footer__title'>© Copyright</h2>

        <div className="footer__nav">
            <Link to="/about" className='footer__navLink'>À propos</Link>
            <Link to="/contact" className='footer__navLink'>Contact</Link>
        </div>
        </div>
    </div>
    )
}

export default Footer