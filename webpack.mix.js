const mix = require('laravel-mix');

mix.js('resources/js/app.jsx', 'public/js')
    .react() // important to add this
    .sass('resources/sass/app.scss', 'public/css');
