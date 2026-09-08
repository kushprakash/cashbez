<?php

require __DIR__ . '/vendor/autoload.php';

use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Writer\PngWriter;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;

try {
    echo "Testing new Builder()...\n";
    
    $result = new Builder(
        writer: new PngWriter(),
        data: 'test data',
        encoding: new Encoding('UTF-8'),
        size: 300,
        margin: 10
    );
    
    $built = $result->build();
    
    echo "Built result class: " . get_class($built) . "\n";
    echo "SUCCESS!\n";
    
    file_put_contents('test-output.png', $built->getString());
    echo "File saved!\n";
    
} catch (\Throwable $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}
