<?php

use Illuminate\Support\Facades\Route;

Route::get('/{any}', function () {
    return response()
        ->view('welcome')
        ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
        ->header('Pragma', 'no-cache')
        ->header('Expires', '0');
})->where('any', '.*');