<?php

function transformXmlResponse($xmlArray) {
    // Extract data from the XML array structure
    $resp = $xmlArray['Resp']['@attributes'] ?? [];
    $deviceInfo = $xmlArray['DeviceInfo']['@attributes'] ?? [];
    $skey = $xmlArray['Skey']['@attributes'] ?? [];
    $data = $xmlArray['Data']['@attributes'] ?? [];
    
    // Transform to the desired format
    $transformedResponse = [
        'errCode' => $resp['errCode'] ?? null,
        'errInfo' => $resp['errInfo'] ?? 'Success.',
        'fCount' => isset($resp['fCount']) ? (int)$resp['fCount'] : 1,
        'fType' => isset($resp['fType']) ? (int)$resp['fType'] : 2,
        'iCount' => 0, // Default value
        'iType' => null, // Default value
        'pCount' => 0, // Default value
        'pType' => 0, // Default value
        'nmPoints' => isset($resp['nmPoints']) ? (int)$resp['nmPoints'] : 49,
        'qScore' => isset($resp['qScore']) ? (int)$resp['qScore'] : 89,
        'dpID' => $deviceInfo['dpId'] ?? null,
        'rdsID' => $deviceInfo['rdsId'] ?? null,
        'rdsVer' => $deviceInfo['rdsVer'] ?? null,
        'dc' => $deviceInfo['dc'] ?? null,
        'mi' => $deviceInfo['mi'] ?? null,
        'mc' => $deviceInfo['mc'] ?? null,
        'ci' => $skey['ci'] ?? null,
        'sessionKey' => $xmlArray['Skey']['@content'] ?? null,
        'hmac' => $xmlArray['Hmac'] ?? null,
        'PidDatatype' => $data['type'] ?? 'X',
        'Piddata' => $xmlArray['Data']['@content'] ?? null
    ];
    
    return $transformedResponse;
}

// Laravel Controller Method
function processXmlResponse(Request $request) {
    // Convert XML to array
    $array = XmlToArray::convert($request->xml);
    
    // Transform the response
    $transformedResponse = transformXmlResponse($array);
    
    return response()->json($transformedResponse);
}

// Alternative method with more detailed extraction
function transformXmlResponseDetailed($xmlArray) {
    $transformedResponse = [];
    
    // Extract Resp attributes
    if (isset($xmlArray['Resp']['@attributes'])) {
        $respAttrs = $xmlArray['Resp']['@attributes'];
        $transformedResponse['errCode'] = $respAttrs['errCode'] ?? null;
        $transformedResponse['errInfo'] = $respAttrs['errInfo'] ?? 'Success.';
        $transformedResponse['fCount'] = isset($respAttrs['fCount']) ? (int)$respAttrs['fCount'] : 1;
        $transformedResponse['fType'] = isset($respAttrs['fType']) ? (int)$respAttrs['fType'] : 2;
        $transformedResponse['nmPoints'] = isset($respAttrs['nmPoints']) ? (int)$respAttrs['nmPoints'] : 49;
        $transformedResponse['qScore'] = isset($respAttrs['qScore']) ? (int)$respAttrs['qScore'] : 89;
    }
    
    // Set default values for missing fields
    $transformedResponse['iCount'] = 0;
    $transformedResponse['iType'] = null;
    $transformedResponse['pCount'] = 0;
    $transformedResponse['pType'] = 0;
    
    // Extract DeviceInfo attributes
    if (isset($xmlArray['DeviceInfo']['@attributes'])) {
        $deviceAttrs = $xmlArray['DeviceInfo']['@attributes'];
        $transformedResponse['dpID'] = $deviceAttrs['dpId'] ?? null;
        $transformedResponse['rdsID'] = $deviceAttrs['rdsId'] ?? null;
        $transformedResponse['rdsVer'] = $deviceAttrs['rdsVer'] ?? null;
        $transformedResponse['dc'] = $deviceAttrs['dc'] ?? null;
        $transformedResponse['mi'] = $deviceAttrs['mi'] ?? null;
        $transformedResponse['mc'] = $deviceAttrs['mc'] ?? null;
    }
    
    // Extract Skey attributes and content
    if (isset($xmlArray['Skey'])) {
        $transformedResponse['ci'] = $xmlArray['Skey']['@attributes']['ci'] ?? null;
        $transformedResponse['sessionKey'] = $xmlArray['Skey']['@content'] ?? null;
    }
    
    // Extract Hmac
    $transformedResponse['hmac'] = $xmlArray['Hmac'] ?? null;
    
    // Extract Data attributes and content
    if (isset($xmlArray['Data'])) {
        $transformedResponse['PidDatatype'] = $xmlArray['Data']['@attributes']['type'] ?? 'X';
        $transformedResponse['Piddata'] = $xmlArray['Data']['@content'] ?? null;
    }
    
    return $transformedResponse;
}

// Usage example
/*
// In your controller:
$array = XmlToArray::convert($request->xml);
$response = transformXmlResponse($array);
return response()->json($response);
*/

?>