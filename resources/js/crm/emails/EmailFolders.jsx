import React from 'react';
import EmailList from './EmailListSimple';

export const Sent = () => {
    return <EmailList folder="sent" />;
};

export default {
    Sent
};
