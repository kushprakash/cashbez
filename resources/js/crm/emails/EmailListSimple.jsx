import React from 'react';

const EmailList = ({ folder = 'sent' }) => {
    return (
        <div>
            <h2>Email List - {folder}</h2>
            <p>Emails will be displayed here.</p>
        </div>
    );
};

export default EmailList;
