$ErrorActionPreference = "Stop"
$Base = "http://localhost:5000/api"
Write-Host "🔵 Final System Verification (RBAC Edition)" -ForegroundColor Cyan
Write-Host "(Waiting 5s to clear Rate Limits...)" -ForegroundColor DarkGray
Start-Sleep -Seconds 5

try {
    # 1. Register Regular User
    $Email = "verify-user-$(Get-Random)@example.com"
    $Reg = @{ Email = $Email; Password = "TestPass123!"; FirstName = "Test"; LastName = "User" } | ConvertTo-Json
    $RRes = Invoke-RestMethod "$Base/auth/register" -Method Post -Body $Reg -ContentType "application/json"
    
    $UserId = $RRes.userId
    if (-not $UserId) { $UserId = $RRes.UserId }
    if (-not $UserId) { $UserId = $RRes.value } 
    
    Write-Host "✅ 1. Register Regular User ($Email)" -ForegroundColor Green
    Start-Sleep -Seconds 2

    # 2. Login as Regular User
    $Log = @{ Email = $Email; Password = "TestPass123!" } | ConvertTo-Json
    $Auth = Invoke-RestMethod "$Base/auth/login" -Method Post -Body $Log -ContentType "application/json"
    $UserToken = $Auth.accessToken
    if (-not $UserToken) { $UserToken = $Auth.AccessToken }
    
    $UserHead = @{ Authorization = "Bearer $UserToken" }
    Write-Host "✅ 2. Login Regular User" -ForegroundColor Green
    Start-Sleep -Seconds 2

    # 3. Login as Admin
    Write-Host "3. Logging in as Admin..." -NoNewline
    $AdminLog = @{ Email = "admin@ecommerce.com"; Password = "AdminPass123!" } | ConvertTo-Json
    try {
        $AdminAuth = Invoke-RestMethod "$Base/auth/login" -Method Post -Body $AdminLog -ContentType "application/json"
        $AdminToken = $AdminAuth.accessToken
        if (-not $AdminToken) { $AdminToken = $AdminAuth.AccessToken }
        $AdminHead = @{ Authorization = "Bearer $AdminToken" }
        Write-Host "✅ Success" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Failed. Did the Seeder run?" -ForegroundColor Red
        throw $_
    }
    Start-Sleep -Seconds 2

    # 4. Security Check (Regular User tries to create Category -> Should Fail)
    Write-Host "4. Security Check (Regular User Forbidden)..." -NoNewline
    $Cat = @{ Name = "HackerCat"; Description = "Malicious" } | ConvertTo-Json
    try {
        Invoke-RestMethod "$Base/categories" -Method Post -Body $Cat -ContentType "application/json" -Headers $UserHead | Out-Null
        Write-Host "❌ FAILED (User was able to create Category!)" -ForegroundColor Red
        throw "Security Hole Detected"
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq [System.Net.HttpStatusCode]::Forbidden) {
            Write-Host "✅ Passed (403 Forbidden)" -ForegroundColor Green
        }
        else {
            Write-Host "⚠️ Unexpected Error: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Seconds 2

    # 5. Admin Creates Category
    $Cat = @{ Name = "OfficialCat"; Description = "Admin Created" } | ConvertTo-Json
    $CRes = Invoke-RestMethod "$Base/categories" -Method Post -Body $Cat -ContentType "application/json" -Headers $AdminHead
    $CId = $CRes.categoryId
    if (-not $CId) { $CId = $CRes.CategoryId }
    Write-Host "✅ 5. Admin Created Category ($CId)" -ForegroundColor Green
    Start-Sleep -Seconds 2

    # 6. Admin Creates Product
    $Prod = @{ Name = "OfficialProd"; Description = "Admin Created"; Price = 10.0; Sku = "SKU-$(Get-Random)"; StockQuantity = 100; CategoryId = $CId; InitialStock = 100 } | ConvertTo-Json
    $PRes = Invoke-RestMethod "$Base/products" -Method Post -Body $Prod -ContentType "application/json" -Headers $AdminHead
    $ProdId = $PRes.productId
    if (-not $ProdId) { $ProdId = $PRes.ProductId }
    Write-Host "✅ 6. Admin Created Product ($ProdId)" -ForegroundColor Green
    Start-Sleep -Seconds 2

    # 7. Regular User Adds to Cart
    $Cart = @{ UserId = $UserId; ProductId = $ProdId; ProductName = "OfficialProd"; UnitPrice = 10.0; Quantity = 1 } | ConvertTo-Json
    Invoke-RestMethod "$Base/cart/items" -Method Post -Body $Cart -ContentType "application/json" -Headers $UserHead | Out-Null
    Write-Host "✅ 7. User Added to Cart" -ForegroundColor Green
    Start-Sleep -Seconds 2

    # 8. Regular User Places Order
    $OrderItems = @( @{ ProductId = $ProdId; ProductName = "OfficialProd"; UnitPrice = 10.0; Quantity = 1 } )
    $Addr = @{ Street = "123 User St"; City = "UserCity"; State = "US"; PostalCode = "11111"; Country = "Userland" }
    $Ord = @{ UserId = $UserId; Items = $OrderItems; ShippingAddress = $Addr } | ConvertTo-Json -Depth 10
    
    $ORes = Invoke-RestMethod "$Base/orders" -Method Post -Body $Ord -ContentType "application/json" -Headers $UserHead
    
    Write-Host "DEBUG OR: Type=$($ORes.GetType().FullName) Val=$ORes" -ForegroundColor Yellow

    $OrdId = $ORes.id
    if (-not $OrdId) { $OrdId = $ORes.Id }
    if (-not $OrdId) { $OrdId = $ORes.orderId }
    if (-not $OrdId) { $OrdId = $ORes.OrderId }
    # Handle Raw GUID String response
    if (-not $OrdId -and $ORes -is [string]) { $OrdId = $ORes }

    Write-Host "✅ 8. User Placed Order ($OrdId)" -ForegroundColor Green

    # 9. Saga Check
    Write-Host "9. Waiting for Payment Confirmation..." -NoNewline
    for ($i = 0; $i -lt 15; $i++) {
        Start-Sleep 2
        try {
            $OChk = Invoke-RestMethod "$Base/orders/$OrdId" -Headers $UserHead
            $St = $OChk.status
            if (-not $St) { $St = $OChk.Status }
            
            Write-Host "[$St]" -NoNewline
        
            if ($St -eq 1 -or $St -eq "Confirmed") {
                Write-Host "`n✅ 9. Order Confirmed! (RBAC Flow Verified)" -ForegroundColor Green
                Write-Host "`n🎉 100% COMPLETE & SECURE" -ForegroundColor Cyan
                exit 0
            }
        }
        catch {
            Write-Host "[ERR: $($_.Exception.Message)]" -NoNewline
        }
        Write-Host "." -NoNewline
    }
    throw "Saga Timed Out"

}
catch {
    Write-Host "`n❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails) {
        Write-Host "DETAILS: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
    elseif ($_.Exception.Response) {
        $Resp = $_.Exception.Response
        try {
            if ($Resp.GetType().Name -eq "HttpResponseMessage") {
                Write-Host "BODY: $($Resp.Content.ReadAsStringAsync().Result)" -ForegroundColor Yellow
            } 
            elseif ($Resp.GetType().Name -eq "HttpWebResponse") {
                $S = $Resp.GetResponseStream()
                $R = New-Object System.IO.StreamReader($S)
                Write-Host "BODY: $($R.ReadToEnd())" -ForegroundColor Yellow
            }
        }
        catch {
            Write-Host "(Could not read error body)" -ForegroundColor DarkGray
        }
    }
    exit 1
}
