<?php

namespace App\Http\Traits;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

trait FileUploadTrait
{
    /**
     * Advanced file upload with support for multiple file types, validation, and processing
     */
    public function uploadFileAdvanced(
        $file,
        string $message_type,
        array  $type_map,
        array  $options = [],
        string $baseUrl = null
    ): array {
        if (!$file || !$file->isValid()) {
            throw new \Exception('No valid file uploaded', 400);
        }

        if (!isset($type_map[$message_type])) {
            throw new \Exception('Invalid message type', 400);
        }

        // Build upload paths
        $dirName = trim($type_map[$message_type]['dir'], '/\\');
        $uploadDir = 'chat/' . $dirName;
        
        // Get file info
        $originalName = $file->getClientOriginalName();
        $ext = strtolower($file->getClientOriginalExtension());

        // Extension check
        $allowed_exts = $type_map[$message_type]['ext'];
        if (!in_array($ext, $allowed_exts, true)) {
            throw new \Exception("File type .{$ext} not allowed for {$message_type}", 400);
        }

        // Optional mime validation
        if (!empty($options['validateMime']) && $message_type === 'image') {
            $allowed_mimes = ['image/gif', 'image/jpeg', 'image/png', 'image/webp'];
            if (!in_array($file->getMimeType(), $allowed_mimes, true)) {
                throw new \Exception('Invalid image MIME type', 400);
            }
        }

        // Final filename
        $filename = $options['rename'] ?? uniqid('upload_') . ".{$ext}";
        
        // Store file
        $path = $file->storeAs($uploadDir, $filename, 'public');
        
        if (!$path) {
            throw new \Exception('Failed to store file', 500);
        }

        // Get full path for processing
        $fullPath = storage_path('app/public/' . $path);

        // Resize image if requested
        if (!empty($options['resize']) && $message_type === 'image' && extension_loaded('gd')) {
            $this->_resizeImage($fullPath, $options['resize']);
        }

        // Build response blob
        $rel_url = 'storage/' . $path;
        $blob = [
            'url'      => asset($rel_url),
            'name'     => $filename,
            'originalName' => $originalName,
            'size'     => $file->getSize(),
            'mime'     => $file->getMimeType(),
            'width'    => null,
            'height'   => null,
            'duration' => null,
            'thumb'    => null
        ];

        // Probe for metadata
        if (in_array($message_type, ['image', 'video', 'audio', 'voice', 'document'], true)) {
            $probe = $this->_probeFile($fullPath, $message_type, $baseUrl);
            $blob = array_merge($blob, $probe);
        }

        return $blob;
    }

    /**
     * Resize image using GD library
     */
    private function _resizeImage(string $path, array $options)
    {
        $keepAspect = $options['keepAspectRatio'] ?? true;
        $maxWidth = $options['width'] ?? 1200;
        $maxHeight = $options['height'] ?? 1200;

        list($width, $height, $type) = getimagesize($path);
        
        // Skip if already smaller
        if ($width <= $maxWidth && $height <= $maxHeight) {
            return;
        }

        // Calculate new dimensions
        if ($keepAspect) {
            $ratio = min($maxWidth / $width, $maxHeight / $height);
            $newWidth = (int)($width * $ratio);
            $newHeight = (int)($height * $ratio);
        } else {
            $newWidth = $maxWidth;
            $newHeight = $maxHeight;
        }

        // Create image resource
        switch ($type) {
            case IMAGETYPE_JPEG:
                $source = imagecreatefromjpeg($path);
                break;
            case IMAGETYPE_PNG:
                $source = imagecreatefrompng($path);
                break;
            case IMAGETYPE_GIF:
                $source = imagecreatefromgif($path);
                break;
            default:
                return;
        }

        $dest = imagecreatetruecolor($newWidth, $newHeight);
        
        // Preserve transparency for PNG and GIF
        if ($type == IMAGETYPE_PNG || $type == IMAGETYPE_GIF) {
            imagealphablending($dest, false);
            imagesavealpha($dest, true);
            $transparent = imagecolorallocatealpha($dest, 0, 0, 0, 127);
            imagefilledrectangle($dest, 0, 0, $newWidth, $newHeight, $transparent);
        }

        imagecopyresampled($dest, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

        // Save resized image
        switch ($type) {
            case IMAGETYPE_JPEG:
                imagejpeg($dest, $path, 85);
                break;
            case IMAGETYPE_PNG:
                imagepng($dest, $path, 8);
                break;
            case IMAGETYPE_GIF:
                imagegif($dest, $path);
                break;
        }

        imagedestroy($source);
        imagedestroy($dest);
    }

    /**
     * Probe file for metadata
     */
    public function _probeFile(string $absPath, string $message_type, string $baseUrl = null): array
    {
        $blob = [
            'width'    => null,
            'height'   => null,
            'duration' => null,
            'thumb'    => null
        ];

        if ($message_type === 'image') {
            $info = @getimagesize($absPath);
            if ($info) {
                $blob['width'] = $info[0];
                $blob['height'] = $info[1];
            }
        } elseif ($message_type === 'video') {
            // Create video thumbnail
            $thumbDir = storage_path('app/public/chat/thumbnails/');
            if (!is_dir($thumbDir)) {
                mkdir($thumbDir, 0775, true);
            }
            
            $thumbName = basename($absPath, '.' . pathinfo($absPath, PATHINFO_EXTENSION)) . '.jpg';
            $thumbPath = $thumbDir . $thumbName;
            
            // Try to create thumbnail using FFmpeg if available
            if ($this->_createDefaultVideoThumb($thumbPath, basename($absPath))) {
                $blob['thumb'] = asset('storage/chat/thumbnails/' . $thumbName);
            }
        } elseif (in_array($message_type, ['audio', 'voice'])) {
            // Create audio waveform thumbnail
            $thumbDir = storage_path('app/public/chat/thumbnails/');
            if (!is_dir($thumbDir)) {
                mkdir($thumbDir, 0775, true);
            }
            
            $thumbName = basename($absPath, '.' . pathinfo($absPath, PATHINFO_EXTENSION)) . '_wave.png';
            $thumbPath = $thumbDir . $thumbName;
            
            if ($this->_createAudioWaveformThumb($thumbPath)) {
                $blob['thumb'] = asset('storage/chat/thumbnails/' . $thumbName);
            }
        }

        return $blob;
    }

    /**
     * Create a default video thumbnail
     */
    public function _createDefaultVideoThumb(string $outputPath, string $title, float $aspectRatio = 16/9, array $options = [])
    {
        $defaults = [
            'bgColor' => [30, 30, 40],
            'textColor' => [255, 255, 255],
            'iconColor' => [100, 150, 255],
            'baseWidth' => 640,
            'minHeight' => 360,
            'maxHeight' => 720,
            'quality' => 85
        ];
        
        $options = array_merge($defaults, $options);
        
        $width = $options['baseWidth'];
        $height = (int)round($width / $aspectRatio);
        
        if ($height < $options['minHeight']) {
            $height = $options['minHeight'];
            $width = (int)round($height * $aspectRatio);
        } elseif ($height > $options['maxHeight']) {
            $height = $options['maxHeight'];
            $width = (int)round($height * $aspectRatio);
        }
        
        try {
            $img = imagecreatetruecolor($width, $height);
            
            $bgColor = imagecolorallocate($img, ...$options['bgColor']);
            $textColor = imagecolorallocate($img, ...$options['textColor']);
            $iconColor = imagecolorallocate($img, ...$options['iconColor']);
            
            imagefilledrectangle($img, 0, 0, $width, $height, $bgColor);
            
            // Add gradient overlay
            $this->_addGradientOverlay($img, $width, $height);
            
            // Draw play icon
            $centerX = $width / 2;
            $centerY = $height / 2;
            $triangleSize = min($width, $height) / 6;
            
            $triangle = [
                $centerX - $triangleSize/2, $centerY - $triangleSize,
                $centerX - $triangleSize/2, $centerY + $triangleSize,
                $centerX + $triangleSize, $centerY
            ];
            
            imagefilledpolygon($img, $triangle, 3, $iconColor);
            
            // Add title if possible
            if (strlen($title) > 30) {
                $title = substr($title, 0, 27) . '...';
            }
            
            $fontSize = 3;
            $textX = ($width - imagefontwidth($fontSize) * strlen($title)) / 2;
            $textY = $height - 30;
            
            imagestring($img, $fontSize, $textX, $textY, $title, $textColor);
            
            imagejpeg($img, $outputPath, $options['quality']);
            imagedestroy($img);
            
            return true;
        } catch (\Exception $e) {
            \Log::error('Failed to create video thumbnail: ' . $e->getMessage());
            return $this->_createFallbackThumbnail($outputPath, $title);
        }
    }

    /**
     * Create fallback thumbnail
     */
    private function _createFallbackThumbnail(string $outputPath, string $title, int $width = 320, int $height = 180)
    {
        try {
            $img = imagecreatetruecolor($width, $height);
            $bg = imagecolorallocate($img, 40, 40, 50);
            $text = imagecolorallocate($img, 200, 200, 200);
            
            imagefilledrectangle($img, 0, 0, $width, $height, $bg);
            
            $shortTitle = strlen($title) > 20 ? substr($title, 0, 17) . '...' : $title;
            $textX = ($width - imagefontwidth(2) * strlen($shortTitle)) / 2;
            
            imagestring($img, 2, $textX, $height / 2, $shortTitle, $text);
            
            imagejpeg($img, $outputPath, 75);
            imagedestroy($img);
            
            return true;
        } catch (\Exception $e) {
            \Log::error('Fallback thumbnail failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Add gradient overlay
     */
    private function _addGradientOverlay($img, int $width, int $height)
    {
        $steps = $height / 2;
        $startOpacity = 0;
        $endOpacity = 80;
        
        for ($i = 0; $i < $steps; $i++) {
            $opacity = $startOpacity + (($endOpacity - $startOpacity) / $steps) * $i;
            $color = imagecolorallocatealpha($img, 0, 0, 0, 127 - (int)$opacity);
            imagefilledrectangle($img, 0, $height - (int)$steps + $i, $width, $height - (int)$steps + $i + 1, $color);
        }
    }

    /**
     * Create audio waveform thumbnail
     */
    public function _createAudioWaveformThumb(string $outputPath, array $options = [])
    {
        $defaults = [
            'width' => 300,
            'height' => 80,
            'bgColors' => [[76, 175, 80], [33, 150, 243]],
            'waveColor' => [255, 255, 255],
            'bars' => 50,
            'quality' => 9
        ];
        
        $options = array_merge($defaults, $options);
        
        try {
            $img = imagecreatetruecolor($options['width'], $options['height']);
            
            imagealphablending($img, true);
            imagesavealpha($img, true);
            $transparent = imagecolorallocatealpha($img, 0, 0, 0, 127);
            imagefill($img, 0, 0, $transparent);
            
            // Draw gradient background
            for ($y = 0; $y < $options['height']; $y++) {
                $ratio = $y / $options['height'];
                $r = (int)($options['bgColors'][0][0] * (1 - $ratio) + $options['bgColors'][1][0] * $ratio);
                $g = (int)($options['bgColors'][0][1] * (1 - $ratio) + $options['bgColors'][1][1] * $ratio);
                $b = (int)($options['bgColors'][0][2] * (1 - $ratio) + $options['bgColors'][1][2] * $ratio);
                $color = imagecolorallocate($img, $r, $g, $b);
                imageline($img, 0, $y, $options['width'], $y, $color);
            }
            
            // Draw waveform bars
            $waveColor = imagecolorallocate($img, ...$options['waveColor']);
            $barWidth = $options['width'] / $options['bars'];
            $centerY = $options['height'] / 2;
            
            for ($i = 0; $i < $options['bars']; $i++) {
                $x = $i * $barWidth;
                $barHeight = rand(10, $options['height'] * 0.8);
                $y1 = $centerY - $barHeight / 2;
                $y2 = $centerY + $barHeight / 2;
                
                imagefilledrectangle(
                    $img,
                    (int)$x + 1,
                    (int)$y1,
                    (int)($x + $barWidth - 2),
                    (int)$y2,
                    $waveColor
                );
            }
            
            imagepng($img, $outputPath, $options['quality']);
            imagedestroy($img);
            
            return true;
        } catch (\Exception $e) {
            \Log::error('Failed to create waveform: ' . $e->getMessage());
            return $this->_createFallbackWaveform($outputPath);
        }
    }

    /**
     * Create fallback waveform
     */
    private function _createFallbackWaveform(string $outputPath)
    {
        $width = 300;
        $height = 80;
        $img = imagecreatetruecolor($width, $height);
        
        imagealphablending($img, true);
        imagesavealpha($img, true);
        $transparent = imagecolorallocatealpha($img, 0, 0, 0, 127);
        imagefill($img, 0, 0, $transparent);
        
        $wave = imagecolorallocate($img, 76, 175, 80);
        $centerY = $height / 2;
        
        for ($x = 0; $x < $width; $x += 3) {
            $h = rand(5, 30);
            imageline($img, $x, $centerY - $h, $x, $centerY + $h, $wave);
        }
        
        imagepng($img, $outputPath, 9);
        imagedestroy($img);
        
        return true;
    }

    /**
     * Manage file upload chunks
     */
    protected function _manageChunk(
        string $chunkData,
        string $uploadId,
        int $chunkIndex,
        int $totalChunks,
        string $fileName,
        string $tempDir = null
    ): array {
        $tempDir = $tempDir ?? storage_path('app/temp_uploads');
        
        if (!is_dir($tempDir)) {
            mkdir($tempDir, 0775, true);
        }
        
        $uploadDir = $tempDir . '/' . $uploadId;
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0775, true);
        }
        
        // Save chunk
        $chunkFile = $uploadDir . '/chunk_' . str_pad($chunkIndex, 5, '0', STR_PAD_LEFT);
        file_put_contents($chunkFile, $chunkData);
        
        // Save metadata
        $metaFile = $uploadDir . '/meta.json';
        $meta = [];
        if (file_exists($metaFile)) {
            $meta = json_decode(file_get_contents($metaFile), true);
        }
        
        $meta['uploadId'] = $uploadId;
        $meta['fileName'] = $fileName;
        $meta['totalChunks'] = $totalChunks;
        $meta['receivedChunks'] = $meta['receivedChunks'] ?? [];
        $meta['receivedChunks'][] = $chunkIndex;
        $meta['receivedChunks'] = array_unique($meta['receivedChunks']);
        $meta['lastUpdate'] = time();
        
        file_put_contents($metaFile, json_encode($meta));
        
        $isComplete = count($meta['receivedChunks']) === $totalChunks;
        
        return [
            'uploadId' => $uploadId,
            'chunkIndex' => $chunkIndex,
            'totalChunks' => $totalChunks,
            'receivedChunks' => count($meta['receivedChunks']),
            'isComplete' => $isComplete,
            'progress' => round((count($meta['receivedChunks']) / $totalChunks) * 100, 2)
        ];
    }

    /**
     * Combine all chunks into final file
     */
    protected function _combineChunks(
        string $uploadId,
        string $finalPath,
        string $tempDir = null
    ): array {
        $tempDir = $tempDir ?? storage_path('app/temp_uploads');
        $uploadDir = $tempDir . '/' . $uploadId;
        
        if (!is_dir($uploadDir)) {
            throw new \Exception('Upload not found', 404);
        }
        
        // Read metadata
        $metaFile = $uploadDir . '/meta.json';
        if (!file_exists($metaFile)) {
            throw new \Exception('Upload metadata not found', 404);
        }
        
        $meta = json_decode(file_get_contents($metaFile), true);
        
        // Combine chunks in order
        $finalFile = fopen($finalPath, 'wb');
        
        for ($i = 0; $i < $meta['totalChunks']; $i++) {
            $chunkFile = $uploadDir . '/chunk_' . str_pad($i, 5, '0', STR_PAD_LEFT);
            if (!file_exists($chunkFile)) {
                fclose($finalFile);
                throw new \Exception("Chunk {$i} is missing", 400);
            }
            
            $chunkData = file_get_contents($chunkFile);
            fwrite($finalFile, $chunkData);
        }
        
        fclose($finalFile);
        
        return [
            'success' => true,
            'size' => filesize($finalPath),
            'mime' => mime_content_type($finalPath)
        ];
    }

    /**
     * Clean up temporary chunks
     */
    protected function _cleanupChunks(string $uploadId, string $tempDir = null): bool
    {
        $tempDir = $tempDir ?? storage_path('app/temp_uploads');
        $uploadDir = $tempDir . '/' . $uploadId;
        
        if (!is_dir($uploadDir)) {
            return false;
        }
        
        // Delete all files
        $files = scandir($uploadDir);
        foreach ($files as $file) {
            if ($file != '.' && $file != '..') {
                unlink($uploadDir . '/' . $file);
            }
        }
        
        // Remove directory
        rmdir($uploadDir);
        
        return true;
    }

    /**
     * Determine message type from file extension
     */
    protected function _determineMessageType(string $extension): string
    {
        $extension = strtolower($extension);
        
        $typeMap = [
            'image' => ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heif', 'heic'],
            'video' => ['mp4', 'avi', 'mov', 'mkv', 'webm', '3gp', 'flv', 'wmv', 'm4v'],
            'audio' => ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'wma', 'opus'],
            'document' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv', 'ppt', 'pptx', 'rtf']
        ];
        
        foreach ($typeMap as $type => $extensions) {
            if (in_array($extension, $extensions)) {
                return $type;
            }
        }
        
        return 'file';
    }

    /**
     * Check chunk upload status
     */
    protected function _checkChunkStatus(string $uploadId, string $tempDir = null): array
    {
        $tempDir = $tempDir ?? storage_path('app/temp_uploads');
        $uploadDir = $tempDir . '/' . $uploadId;
        
        if (!is_dir($uploadDir)) {
            return [
                'exists' => false,
                'isComplete' => false,
                'receivedChunks' => 0,
                'totalChunks' => 0
            ];
        }
        
        $metaFile = $uploadDir . '/meta.json';
        if (!file_exists($metaFile)) {
            return [
                'exists' => false,
                'isComplete' => false,
                'receivedChunks' => 0,
                'totalChunks' => 0
            ];
        }
        
        $meta = json_decode(file_get_contents($metaFile), true);
        
        return [
            'exists' => true,
            'isComplete' => count($meta['receivedChunks']) === $meta['totalChunks'],
            'receivedChunks' => count($meta['receivedChunks']),
            'totalChunks' => $meta['totalChunks'],
            'progress' => round((count($meta['receivedChunks']) / $meta['totalChunks']) * 100, 2)
        ];
    }
}
