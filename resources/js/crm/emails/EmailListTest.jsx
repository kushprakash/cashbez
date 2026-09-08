import React from 'react';

const EmailListTest = ({ folder = 'sent' }) => {
    return (
        <div>
            <h1>Test Email List - {folder}</h1>
        </div>
    );
};

export default EmailListTest;
