<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Services\BunnyStorageService;

class SettingController extends Controller
{
    protected BunnyStorageService $bunnyStorage;

    public function __construct(BunnyStorageService $bunnyStorage)
    {
        $this->bunnyStorage = $bunnyStorage;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $user = $request->get('user');
            $targetUserId = $user->id;

            if ($user->role == 1 && $request->filled('user_id')) {
                $targetUserId = $request->input('user_id');
            }

            $setting = Setting::where('user_id', $targetUserId)->first();

            if ($setting) {
                return response()->json([
                    'status' => 1,
                    'message' => 'Settings retrieved successfully',
                    'setting' => $setting
                ]);
            }

            return response()->json([
                'status' => 0,
                'message' => 'No settings found'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to retrieve settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // First validate non-file fields
        $baseRules = [
            'company_name' => 'required|string|max:255',
            'about' => 'nullable|string',
            'copy_right' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'email' => 'required|email|max:255',
            'website' => 'nullable|max:255',
            'call_back_url' => 'nullable|string|max:255',
            'smtp_host' => 'nullable|string|max:255',
            'smtp_port' => 'nullable|string|max:255',
            'smtp_user' => 'nullable|string|max:255',
            'smtp_password' => 'nullable|string|max:255',
            'sender_id' => 'nullable|string|max:255',
            'apikey' => 'nullable|string|max:255',
            'whatsapp_no' => 'nullable|string|max:20',
            'mobile_no' => 'required|string|max:20',
            'landline_no' => 'nullable|string|max:20',
            'map_url' => 'nullable|url',
            'meta_title' => 'nullable|string|max:255',
            'meta_keyword' => 'nullable|string',
            'meta_description' => 'nullable|string',
            'theme_color_primary' => 'nullable|string|max:7',
            'theme_color_secondary' => 'nullable|string|max:7',
            'currency_code' => 'required|string|max:3',
            'status' => 'required|in:0,1,true,false',
            'playstore_url' => 'nullable|string',
            'user_id' => 'nullable|integer',
            'va_create_charge' => 'nullable|numeric|min:0',
            'va_receive_charge' => 'nullable|numeric|min:0',
            'api_vpa_receive_charge' => 'nullable|numeric|min:0',
        ];

        // Add file validation rules only if files are present
        if ($request->hasFile('logo')) {
            $baseRules['logo'] = 'file|mimes:jpeg,jpg,png,gif,svg,webp|mimetypes:image/jpeg,image/jpg,image/png,image/gif,image/svg+xml,image/webp|max:2048';
        }
        if ($request->hasFile('footer_logo')) {
            $baseRules['footer_logo'] = 'file|mimes:jpeg,jpg,png,gif,svg,webp|mimetypes:image/jpeg,image/jpg,image/png,image/gif,image/svg+xml,image/webp|max:2048';
        }
        if ($request->hasFile('favicon')) {
            $baseRules['favicon'] = 'file|mimes:jpeg,jpg,png,gif,svg,ico,webp|mimetypes:image/jpeg,image/jpg,image/png,image/gif,image/svg+xml,image/x-icon,image/vnd.microsoft.icon,image/webp|max:1024';
        }
        if ($request->hasFile('playstore_qr_img')) {
            $baseRules['playstore_qr_img'] = 'file|mimes:jpeg,jpg,png,gif,svg,webp|mimetypes:image/jpeg,image/jpg,image/png,image/gif,image/svg+xml,image/webp|max:2048';
        }
       
        $validator = Validator::make($request->all(), $baseRules);

        if ($validator->fails()) {
            return response()->json([
                'status' => 0,
                'message' => 'Validation failed',
                'error' => $validator->errors(),
            ], 422);
        }

        try {
            $data = $validator->validated();

                if (isset($data['status'])) {
                    $data['status'] = in_array($data['status'], ['1', 'true', true, 1]) ? 1 : 0;
                }

            // Handle file uploads - Accept either file uploads OR URL strings (from frontend direct CDN upload)
                // Logo
                if ($request->has('logo') && is_string($request->input('logo')) && filter_var($request->input('logo'), FILTER_VALIDATE_URL)) {
                    $data['logo'] = $request->input('logo');
                } elseif ($request->hasFile('logo')) {
                    $result = $this->bunnyStorage->upload($request->file('logo'), 'settings/logos');
                    if (!$result['success']) {
                        throw new \Exception('Logo upload failed: ' . $result['error']);
                    }
                    $data['logo'] = $result['url'];
                }

                // Footer Logo
                if ($request->has('footer_logo') && is_string($request->input('footer_logo')) && filter_var($request->input('footer_logo'), FILTER_VALIDATE_URL)) {
                    $data['footer_logo'] = $request->input('footer_logo');
                } elseif ($request->hasFile('footer_logo')) {
                    $result = $this->bunnyStorage->upload($request->file('footer_logo'), 'settings/footer_logos');
                    if (!$result['success']) {
                        throw new \Exception('Footer logo upload failed: ' . $result['error']);
                    }
                    $data['footer_logo'] = $result['url'];
                }

                // Favicon
                if ($request->has('favicon') && is_string($request->input('favicon')) && filter_var($request->input('favicon'), FILTER_VALIDATE_URL)) {
                    $data['favicon'] = $request->input('favicon');
                } elseif ($request->hasFile('favicon')) {
                    $result = $this->bunnyStorage->upload($request->file('favicon'), 'settings/favicons');
                    if (!$result['success']) {
                        throw new \Exception('Favicon upload failed: ' . $result['error']);
                    }
                    $data['favicon'] = $result['url'];
                }

                // Playstore QR Image
                if ($request->has('playstore_qr_img') && is_string($request->input('playstore_qr_img')) && filter_var($request->input('playstore_qr_img'), FILTER_VALIDATE_URL)) {
                    $data['playstore_qr_img'] = $request->input('playstore_qr_img');
                } elseif ($request->hasFile('playstore_qr_img')) {
                    $result = $this->bunnyStorage->upload($request->file('playstore_qr_img'), 'settings/playstore_qrs');
                    if (!$result['success']) {
                        throw new \Exception('Playstore QR img upload failed: ' . $result['error']);
                    }
                    $data['playstore_qr_img'] = $result['url'];
                }

            $user = $request->get('user');
            $targetUserId = ($user->role == 1 && $request->filled('user_id')) ? $request->input('user_id') : $user->id;

            $data['user_id'] = $targetUserId;
            $data['call_back_url'] = $request->call_back_url;
            $data['playstore_url'] = $request->playstore_url;
            if ($request->has('va_create_charge')) $data['va_create_charge'] = $request->input('va_create_charge');
            if ($request->has('va_receive_charge')) $data['va_receive_charge'] = $request->input('va_receive_charge');
            if ($request->has('api_vpa_receive_charge')) $data['api_vpa_receive_charge'] = $request->input('api_vpa_receive_charge');

            $setting = Setting::updateOrCreateSettings($data);

            return response()->json([
                'status' => 1,
                'message' => 'Settings created/Update successfully',
                'setting' => $data,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to create settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Setting $setting)
    {
        try {
            return response()->json([
                'status' => 1,
                'message' => 'Setting retrieved successfully',
                'setting' => $setting
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to retrieve setting',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Setting $setting)
    {
       
        // First validate non-file fields
        $baseRules = [
            'company_name' => 'required|string|max:255',
            'about' => 'nullable|string',
            'copy_right' => 'nullable|string|max:255',
            'address' => 'nullable|string',
            'email' => 'required|email|max:255',
            'website' => 'nullable|url|max:255',
            'whatsapp_no' => 'nullable|string|max:20',
            'mobile_no' => 'required|string|max:20',
            'landline_no' => 'nullable|string|max:20',
            'map_url' => 'nullable|url',
            'meta_title' => 'nullable|string|max:255',
            'meta_keyword' => 'nullable|string',
            'meta_description' => 'nullable|string',
            'theme_color_primary' => 'nullable|string|max:7',
            'theme_color_secondary' => 'nullable|string|max:7',
            'currency_code' => 'required|string|max:3',
            'status' => 'required|in:0,1,true,false',
            'playstore_url' => 'nullable|string',
            'va_create_charge' => 'nullable|numeric|min:0',
            'va_receive_charge' => 'nullable|numeric|min:0',
            'api_vpa_receive_charge' => 'nullable|numeric|min:0',
        ];

        // Add file validation rules only if files are present
        if ($request->hasFile('logo')) {
            $baseRules['logo'] = 'file|mimes:jpeg,jpg,png,gif,svg,webp|mimetypes:image/jpeg,image/jpg,image/png,image/gif,image/svg+xml,image/webp|max:2048';
        }
        if ($request->hasFile('footer_logo')) {
            $baseRules['footer_logo'] = 'file|mimes:jpeg,jpg,png,gif,svg,webp|mimetypes:image/jpeg,image/jpg,image/png,image/gif,image/svg+xml,image/webp|max:2048';
        }
        if ($request->hasFile('favicon')) {
            $baseRules['favicon'] = 'file|mimes:jpeg,jpg,png,gif,svg,ico,webp|mimetypes:image/jpeg,image/jpg,image/png,image/gif,image/svg+xml,image/x-icon,image/vnd.microsoft.icon,image/webp|max:1024';
        }
        if ($request->hasFile('playstore_qr_img')) {
            $baseRules['playstore_qr_img'] = 'file|mimes:jpeg,jpg,png,gif,svg,webp|mimetypes:image/jpeg,image/jpg,image/png,image/gif,image/svg+xml,image/webp|max:2048';
        }
        
        $validator = Validator::make($request->all(), $baseRules);

        if ($validator->fails()) {
            // Debug: Log validation errors for file uploads
            \Log::error('File validation failed:', [
                'errors' => $validator->errors()->toArray(),
                'files' => $request->allFiles(),
                'file_info' => $request->hasFile('logo') ? [
                    'original_name' => $request->file('logo')->getClientOriginalName(),
                    'mime_type' => $request->file('logo')->getMimeType(),
                    'extension' => $request->file('logo')->getClientOriginalExtension(),
                    'size' => $request->file('logo')->getSize()
                ] : 'No logo file'
            ]);
            
            return response()->json([
                'status' => 0,
                'message' => 'Validation failed',
                'error' => $validator->errors()
            ], 422);
        }

        try {
            $data = $validator->validated();

            // Convert status to integer if it's a string
            if (isset($data['status'])) {
                $data['status'] = in_array($data['status'], ['1', 'true', true, 1]) ? 1 : 0;
            }

            // Debug: Log what files are received
            \Log::info('Files received in update:', [
                'has_logo' => $request->hasFile('logo'),
                'has_footer_logo' => $request->hasFile('footer_logo'), 
                'has_favicon' => $request->hasFile('favicon'),
                'all_files' => $request->allFiles(),
                'request_method' => $request->method(),
                'content_type' => $request->header('Content-Type'),
                'form_data_keys' => array_keys($request->all())
            ]);

            // Handle file uploads and delete old files
            if ($request->hasFile('logo')) {
                // Delete old logo from BunnyCDN if exists
                if ($setting->logo) {
                    $oldPath = $this->bunnyStorage->extractPath($setting->logo);
                    if ($oldPath) {
                        $this->bunnyStorage->delete($oldPath);
                    }
                }
                $result = $this->bunnyStorage->upload($request->file('logo'), 'settings/logos');
                if (!$result['success']) {
                    throw new \Exception('Logo upload failed: ' . $result['error']);
                }
                $data['logo'] = $result['url'];
                \Log::info('Logo uploaded successfully:', ['path' => $data['logo']]);
            }

            if ($request->hasFile('footer_logo')) {
                // Delete old footer logo from BunnyCDN if exists
                if ($setting->footer_logo) {
                    $oldPath = $this->bunnyStorage->extractPath($setting->footer_logo);
                    if ($oldPath) {
                        $this->bunnyStorage->delete($oldPath);
                    }
                }
                $result = $this->bunnyStorage->upload($request->file('footer_logo'), 'settings/footer_logos');
                if (!$result['success']) {
                    throw new \Exception('Footer logo upload failed: ' . $result['error']);
                }
                $data['footer_logo'] = $result['url'];
                \Log::info('Footer logo uploaded successfully:', ['path' => $data['footer_logo']]);
            }

            if ($request->hasFile('favicon')) {
                // Delete old favicon from BunnyCDN if exists
                if ($setting->favicon) {
                    $oldPath = $this->bunnyStorage->extractPath($setting->favicon);
                    if ($oldPath) {
                        $this->bunnyStorage->delete($oldPath);
                    }
                }
                $result = $this->bunnyStorage->upload($request->file('favicon'), 'settings/favicons');
                if (!$result['success']) {
                    throw new \Exception('Favicon upload failed: ' . $result['error']);
                }
                $data['favicon'] = $result['url'];
                \Log::info('Favicon uploaded successfully:', ['path' => $data['favicon']]);
            }

            if ($request->has('playstore_qr_img') && is_string($request->input('playstore_qr_img')) && filter_var($request->input('playstore_qr_img'), FILTER_VALIDATE_URL)) {
                $data['playstore_qr_img'] = $request->input('playstore_qr_img');
            } elseif ($request->hasFile('playstore_qr_img')) {
                if ($setting->playstore_qr_img) {
                    $oldPath = $this->bunnyStorage->extractPath($setting->playstore_qr_img);
                    if ($oldPath) {
                        $this->bunnyStorage->delete($oldPath);
                    }
                }
                $result = $this->bunnyStorage->upload($request->file('playstore_qr_img'), 'settings/playstore_qrs');
                if (!$result['success']) {
                    throw new \Exception('Playstore QR upload failed: ' . $result['error']);
                }
                $data['playstore_qr_img'] = $result['url'];
            }

            if ($request->has('playstore_url')) {
                $data['playstore_url'] = $request->playstore_url;
            }

            $setting->update($data);

            return response()->json([
                'status' => 1,
                'message' => 'Settings updated successfully',
                'setting' => $setting
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to update settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Setting $setting)
    {
        try {
            // Delete associated files - extract paths from URLs
            if ($setting->logo) {
                $logoPath = str_replace(url('storage/'), '', $setting->logo);
                $logoPath = ltrim($logoPath, '/'); // Remove leading slash if present
                if (Storage::disk('public')->exists($logoPath)) {
                    Storage::disk('public')->delete($logoPath);
                }
            }

            if ($setting->footer_logo) {
                $footerLogoPath = str_replace(url('storage/'), '', $setting->footer_logo);
                $footerLogoPath = ltrim($footerLogoPath, '/'); // Remove leading slash if present
                if (Storage::disk('public')->exists($footerLogoPath)) {
                    Storage::disk('public')->delete($footerLogoPath);
                }
            }

            if ($setting->favicon) {
                $faviconPath = str_replace(url('storage/'), '', $setting->favicon);
                $faviconPath = ltrim($faviconPath, '/'); // Remove leading slash if present
                if (Storage::disk('public')->exists($faviconPath)) {
                    Storage::disk('public')->delete($faviconPath);
                }
            }

            $setting->delete();

            return response()->json([
                'status' => 1,
                'message' => 'Setting deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to delete setting',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get public settings for frontend
     */
    public function getPublicSettings(Request $request)
    {
        try {

            $user=$request->get('user');

            $admin_user = User::where('mid', $user->admin_mid)->first();

            $setting = Setting::where('status', 1)->where('user_id', $admin_user->id)->first();

            if ($setting) {
                return response()->json([
                    'status' => 1,
                    'message' => 'Public settings retrieved successfully',
                    'setting' => [
                        'company_name' => $setting->company_name,
                        'logo_url' => $setting->logo,
                        'footer_logo_url' => $setting->footer_logo,
                        'favicon_url' => $setting->favicon,
                        'playstore_qr_img' => $setting->playstore_qr_img,
                        'playstore_url' => $setting->playstore_url,
                        'about' => $setting->about,
                        'copy_right' => $setting->copy_right,
                        'address' => $setting->address,
                        'email' => $setting->email,
                        'website' => $setting->website,
                        'whatsapp_no' => $setting->whatsapp_no,
                        'mobile_no' => $setting->mobile_no,
                        'landline_no' => $setting->landline_no,
                        'map_url' => $setting->map_url,
                        'meta_title' => $setting->meta_title,
                        'meta_keyword' => $setting->meta_keyword,
                        'meta_description' => $setting->meta_description,
                        'theme_color_primary' => $setting->theme_color_primary,
                        'theme_color_secondary' => $setting->theme_color_secondary,
                        'currency_code' => $setting->currency_code,
                        'call_back_url' => $setting->call_back_url,
                    ]
                ]);
            }
            
            return response()->json([
                'status' => 0,
                'message' => 'No active settings found'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 0,
                'message' => 'Failed to retrieve public settings',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
