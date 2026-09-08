<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_name',
        'logo',
        'footer_logo',
        'favicon',
        'playstore_qr_img',
        'playstore_url',
        'sign',
        'about',
        'copy_right',
        'address',
        'email',
        'website',
        'whatsapp_no',
        'mobile_no',
        'landline_no',
        'map_url',
        'meta_title',
        'meta_keyword',
        'meta_description',
        'theme_color_primary',
        'theme_color_secondary',
        'currency_code',
        'paytm_upi_id',
        'paytm_mid',
        'paytm_sign',
        'call_back_url',
        'smtp_host',
        'smtp_port',
        'smtp_user',
        'smtp_password',
        'sender_id',
        'apikey',
        'utility_chanel',
        'min_balance',
        'va_create_charge',
        'va_receive_charge',
        'api_vpa_receive_charge',
        'status',
    ];

    protected $appends = [
        'logo_url',
        'footer_logo_url', 
        'favicon_url',
        'playstore_qr_img_url'
    ];

    protected $casts = [
        'status' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationship with User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Accessor for logo URL
    public function getLogoUrlAttribute()
    {
        // If logo already contains a full URL, return as is, otherwise build URL
        return $this->logo ? (filter_var($this->logo, FILTER_VALIDATE_URL) ? $this->logo : url('storage/' . $this->logo)) : null;
    }

    // Accessor for footer logo URL
    public function getFooterLogoUrlAttribute()
    {
        // If footer_logo already contains a full URL, return as is, otherwise build URL
        return $this->footer_logo ? (filter_var($this->footer_logo, FILTER_VALIDATE_URL) ? $this->footer_logo : url('storage/' . $this->footer_logo)) : null;
    }

    // Accessor for favicon URL
    public function getFaviconUrlAttribute()
    {
        // If favicon already contains a full URL, return as is, otherwise build URL
        return $this->favicon ? (filter_var($this->favicon, FILTER_VALIDATE_URL) ? $this->favicon : url('storage/' . $this->favicon)) : null;
    }

    // Accessor for playstore QR img URL
    public function getPlaystoreQrImgUrlAttribute()
    {
        return $this->playstore_qr_img ? (filter_var($this->playstore_qr_img, FILTER_VALIDATE_URL) ? $this->playstore_qr_img : url('storage/' . $this->playstore_qr_img)) : null;
    }

    // Get the first (and typically only) setting record
    public static function getSettings()
    {
        return self::first();
    }

    // Update or create settings
    public static function updateOrCreateSettings(array $data)
    {
        $userId = $data['user_id'] ?? null;
        
        if (!$userId) {
            throw new \Exception('User ID is required for settings');
        }
        
        $setting = self::where('user_id', $userId)->first();
        
        if ($setting) {
            $setting->update($data);
            return $setting;
        }
        
        return self::create($data);
    }
}
