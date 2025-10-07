# Dashboard API Test Script for Windows PowerShell
# Run this on your EC2 server or locally to test all dashboard endpoints

Write-Host "🧪 Testing Dashboard API Endpoints..." -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$BASE_URL = "http://localhost:5000/api"

function Test-Endpoint {
    param(
        [string]$Endpoint,
        [string]$Name
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    Write-Host "Endpoint: $BASE_URL$Endpoint"
    
    try {
        $response = Invoke-WebRequest -Uri "$BASE_URL$Endpoint" -UseBasicParsing
        $statusCode = $response.StatusCode
        $body = $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
        
        if ($statusCode -eq 200) {
            Write-Host "✓ SUCCESS (HTTP $statusCode)" -ForegroundColor Green
            Write-Host "Response: $body"
        } else {
            Write-Host "✗ WARNING (HTTP $statusCode)" -ForegroundColor Yellow
            Write-Host "Response: $body"
        }
    } catch {
        Write-Host "✗ FAILED" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $reader.BaseStream.Position = 0
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response: $responseBody"
        }
    }
    
    Write-Host "--------------------------------------"
    Write-Host ""
}

# Test all dashboard endpoints
Test-Endpoint -Endpoint "/dashboard/monthly-revenue" -Name "Monthly Revenue"
Test-Endpoint -Endpoint "/dashboard/total-orders" -Name "Total Orders"
Test-Endpoint -Endpoint "/dashboard/low-stock" -Name "Low Stock Items"
Test-Endpoint -Endpoint "/dashboard/total-items" -Name "Total Items"
Test-Endpoint -Endpoint "/dashboard/monthly-graph" -Name "Monthly Graph Data"

# Test other working endpoints for comparison
Write-Host ""
Write-Host "🔍 Testing other working endpoints for comparison..." -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Test-Endpoint -Endpoint "/machines" -Name "Machines (Working)"
Test-Endpoint -Endpoint "/customers" -Name "Customers (Working)"

Write-Host ""
Write-Host "✅ Testing complete!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 If dashboard endpoints return 404:" -ForegroundColor Yellow
Write-Host "   1. Check if backend code is deployed"
Write-Host "   2. Check if server.js includes dashboard routes"
Write-Host "   3. Restart the Node.js server"
Write-Host "   4. Check server logs"
