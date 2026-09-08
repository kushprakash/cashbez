import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'iconify-icon';
import AppRoutes from './route.jsx'; // or wherever your file is
import '../css/app.css'; // Import the CSS file

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <AppRoutes />
    </BrowserRouter>
);
