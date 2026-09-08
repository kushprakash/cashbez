<?php

return [
    /*
    |--------------------------------------------------------------------------
    | DigiLocker API Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for DigiLocker OAuth 2.0 integration with PKCE.
    | Register your application at: https://partners.digitallocker.gov.in/
    |
    */

    // Client credentials from DigiLocker Partners Portal
    'client_id' => env('DIGILOCKER_CLIENT_ID', ''),
    'client_secret' => env('DIGILOCKER_CLIENT_SECRET', ''),

    // OAuth callback URL (must match exactly what's registered in Partners Portal)
    'redirect_uri' => env('DIGILOCKER_REDIRECT_URI', 'https://banking.cashbez.com/api/digilocker-webhook'),

    // DigiLocker API Base URLs
    'base_url' => env('DIGILOCKER_BASE_URL', 'https://digilocker.meripehchaan.gov.in'),

    // OAuth Endpoints
    'endpoints' => [
        'authorize' => '/public/oauth2/1/authorize',
        'token' => '/public/oauth2/2/token',          // OpenID Connect (returns id_token)
        'token_v1' => '/public/oauth2/1/token',       // Standard OAuth (returns user details)
        'refresh' => '/public/oauth2/1/token',
        'revoke' => '/public/oauth2/1/revoke',
        'user' => '/public/oauth2/1/user',
        'eaadhaar' => '/public/oauth2/3/xml/eaadhaar',
        'issued_docs' => '/public/oauth2/2/files/issued',
        'file_uri' => '/public/oauth2/1/file',
    ],

    // Default scopes for authorization
    'scopes' => [
        'openid',
        'userdetails',
        'email',
        'address',
        'picture',
        'avs',  // Address Verification Service
    ],

    // Default ACR (Authentication Context Reference) values
    // Options: pan, aadhaar, driving_licence, email, mobile
    'acr' => ['aadhaar', 'mobile', 'pan', 'email'],

    // Default AMR (Authentication Method Reference) for signup
    // Options: all, driving_licence, aadhaar, pan, ndlemail, username, mobile
    'amr' => ['aadhaar', 'pan', 'exists_ac_pin'],

    // Token expiry buffer (seconds before actual expiry to consider token expired)
    'token_expiry_buffer' => 300, // 5 minutes
];
