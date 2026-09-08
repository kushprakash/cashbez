<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class HomeController extends Controller {

    public function signup(Request $request){
     

        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:15',
            'role' => 'required|integer',
            'refers' => 'nullable|string|max:255',
        ]);

        $validatedData['ipaddress'] = $request->ip();
        $validatedData['browser'] = $_SERVER['HTTP_USER_AGENT'];

        try {

            //$response = Http::post(env('API_URL') . 'signup', $form);

            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to signup'], 500);
        }
        
    }

}