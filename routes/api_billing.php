<?php

use App\Http\Controllers\Billing\BillController;
use App\Http\Controllers\Billing\ProductController;
use App\Http\Controllers\Billing\CustomerController;
use App\Http\Controllers\Billing\ContactController;
use App\Http\Controllers\Billing\StockMovementController;
use App\Http\Controllers\Billing\UdharController;
use App\Http\Controllers\Billing\BackupController;
use App\Http\Controllers\Billing\ShopSettingController;
use Illuminate\Support\Facades\Route;

// Billing API v1 — included inside api.token.auth middleware in api.php
Route::get('v1/settings', [ShopSettingController::class, 'index']);
Route::post('v1/settings', [ShopSettingController::class, 'store']);
Route::get('v1/bills', [BillController::class, 'index']);
Route::post('v1/bills', [BillController::class, 'store']);
Route::get('v1/products', [ProductController::class, 'index']);
Route::post('v1/products', [ProductController::class, 'store']);
Route::put('v1/products/{id}', [ProductController::class, 'update']);
Route::put('v1/products/{id}/adjust-stock', [ProductController::class, 'adjustStock']);

Route::get('v1/stock-movements', [StockMovementController::class, 'index']);
Route::post('v1/stock-movements', [StockMovementController::class, 'store']);
Route::get('v1/customers', [CustomerController::class, 'index']);
Route::post('v1/customers', [CustomerController::class, 'store']);
Route::get('v1/contacts',  [ContactController::class,  'index']);

// Udhar (credit) routes
Route::get('v1/udhar', [UdharController::class, 'index']);
Route::post('v1/udhar', [UdharController::class, 'store']);
Route::post('v1/udhar/{localId}/payment', [UdharController::class, 'recordPayment']);

// Backup routes
Route::post('v1/backup/store',  [BackupController::class, 'store']);
Route::get('v1/backup/list',    [BackupController::class, 'index']);
Route::get('v1/backup/{id}',    [BackupController::class, 'show']);
