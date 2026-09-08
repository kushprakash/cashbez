<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
    <title>Banking Service</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="author" content="Banking Service" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />

    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />

    <script>
      // Auto-recover if browser attempts to load an old cached JS bundle that returned 404
      window.addEventListener('error', function (e) {
        if (e && e.target && (e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK')) {
          var key = '_asset_404_reload';
          var now = Date.now();
          var lastReload = parseInt(sessionStorage.getItem(key) || '0', 10);
          if (now - lastReload > 3000) {
            sessionStorage.setItem(key, now.toString());
            window.location.reload(true);
          }
        }
      }, true);
    </script>

    @viteReactRefresh
    @vite('resources/js/app.jsx')

    <!-- Favicon -->
    <link rel="shortcut icon" href="https://bharatuploads.b-cdn.net/settings/favicons/18851e189aa06d4c1790e6ea08e7bc06.PNG" type="image/x-icon">
    <link rel="icon" href="https://bharatuploads.b-cdn.net/settings/favicons/18851e189aa06d4c1790e6ea08e7bc06.PNG" type="image/png">
    <link rel="apple-touch-icon" href="https://bharatuploads.b-cdn.net/settings/favicons/18851e189aa06d4c1790e6ea08e7bc06.PNG" />

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

    <!-- Local Assets using asset() helper -->
    <link href="{{ asset('assets/css/vendor.min.css') }}" rel="stylesheet" type="text/css" />
    <link href="{{ asset('assets/css/icons.min.css') }}" rel="stylesheet" type="text/css" />
    <link href="{{ asset('assets/css/app.min.css') }}" rel="stylesheet" type="text/css" />
    <!-- Iconify Web Component -->
    <script src="https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/iconify-icon@2.1.0/dist/iconify-icon.min.js"></script>

    <script src="{{ asset('assets/js/config.min.js') }}"></script>
</head>
<body>
    <div id="root"></div>
</body>
</html>
