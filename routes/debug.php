<?php
// Add to routes/web.php or routes/api.php as appropriate
Route::get('/debug/check-aggregation', [App\Http\Controllers\DebugController::class, 'checkAggregation'])
    ->middleware('auth')  // Ensure the user is authenticated
    ->name('debug.check-aggregation');