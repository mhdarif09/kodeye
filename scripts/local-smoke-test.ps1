$ErrorActionPreference = 'Stop'
$ApiUrl = if ($env:API_URL) { $env:API_URL.TrimEnd('/') } else { 'http://localhost:3001' }
$FrontendUrl = if ($env:FRONTEND_URL) { $env:FRONTEND_URL.TrimEnd('/') } else { 'http://localhost:3000' }

function Assert-Status($Name, $Url, $Expected) {
  try {
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing
    if ($response.StatusCode -ne $Expected) { throw "$Name returned $($response.StatusCode)" }
    Write-Host "[pass] $Name"
    return $response
  } catch {
    throw "[fail] $Name - $($_.Exception.Message)"
  }
}

$health = Assert-Status 'API health' "$ApiUrl/api/health" 200
Assert-Status 'Public plans' "$ApiUrl/api/plans?currency=IDR" 200 | Out-Null
Assert-Status 'Frontend' $FrontendUrl 200 | Out-Null

if (-not $health.Headers['X-Content-Type-Options']) {
  throw '[fail] API security headers are missing'
}
Write-Host '[pass] API security headers'

try {
  Invoke-WebRequest -Uri "$ApiUrl/api/auth/login" -Method Post -ContentType 'application/json' -Body '{"email":"invalid@example.test","password":"invalid-password"}' -UseBasicParsing | Out-Null
  throw '[fail] Invalid login unexpectedly succeeded'
} catch {
  if ($_.Exception.Response.StatusCode.value__ -notin @(400, 401)) { throw }
  Write-Host '[pass] Invalid login rejected'
}
