import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AuthContext } from '../core/hooks/context';

const Header = ({ onSidebarToggle }) => {
    const { userData: user } = useContext(AuthContext) || {};
    const logoSrc = user?.logo;

    return (
        <div className="main-nav">
            <div className="logo-box">
                <Link to="/dashboard" className="logo-dark d-flex align-items-center ">
                    {logoSrc ? (
                        <img
                            src={logoSrc}
                            alt={user?.shop_name || "logo"}
                            style={{ marginTop: '10px', width: '150px', maxHeight: '45px', objectFit: 'contain' }}
                        />
                    ) : (
                        <div
                            className="logo-skeleton"
                            style={{
                                marginTop: '10px',
                                width: '140px',
                                height: '36px',
                                borderRadius: '6px',
                                background: 'rgba(255, 255, 255, 0.12)',
                                backdropFilter: 'blur(4px)',
                                animation: 'pulse 1.5s infinite ease-in-out'
                            }}
                        />
                    )}
                </Link>
            </div>

            <Sidebar onSidebarToggle={onSidebarToggle} />
        </div>
    );
};

export default Header;
