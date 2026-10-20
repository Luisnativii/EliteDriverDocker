param(
    [string]$ApiBase = 'http://localhost:18080/api',
    [Parameter(Mandatory = $true)][string]$Email,
    [Parameter(Mandatory = $true)][string]$Password,
    [string]$OutputPath = "$PSScriptRoot/../docs/auditoria-movil-2026-10-16/api-results.json"
)

# Local integration audit. Only reservations created here are cancelled.
# Authentication tokens and personal profiles are never written to the report.
$ErrorActionPreference = 'Stop'
if (([uri]$ApiBase).Host -notin @('localhost', '127.0.0.1')) {
    throw 'This audit is restricted to the local Docker environment.'
}
$results = [Collections.Generic.List[object]]::new()
$created = [Collections.Generic.List[string]]::new()
$authHeaders = @{}
function Send-AuditRequest($Method, $Path, $Body = $null, $Headers = @{}) {
    $params = @{ Method = $Method; Uri = "$ApiBase$Path"; Headers = $Headers; SkipHttpErrorCheck = $true; TimeoutSec = 20 }
    if ($null -ne $Body) { $params.Body = ($Body | ConvertTo-Json -Compress); $params.ContentType = 'application/json' }
    $timer = [Diagnostics.Stopwatch]::StartNew()
    $response = Invoke-WebRequest @params
    $timer.Stop()
    $data = $null
    try { $data = $response.Content | ConvertFrom-Json } catch {}
    return @{ Status = [int]$response.StatusCode; Data = $data; Ms = [math]::Round($timer.Elapsed.TotalMilliseconds, 1) }
}
function Record-Check($Name, $Response, $Pass, $Observed) {
    $results.Add([pscustomobject][ordered]@{ name = $Name; passed = [bool]$Pass; status = $Response.Status; milliseconds = $Response.Ms; observed = $Observed })
}
try {
    $login = Send-AuditRequest POST '/auth/login' @{ email = $Email; password = $Password }
    if ($login.Status -ne 200) { throw "Local test login failed: HTTP $($login.Status)" }
    $authHeaders.Authorization = "Bearer $($login.Data.token)"
    Record-Check 'Local customer login' $login $true 'Token received; omitted from report'
    $fleet = Send-AuditRequest GET '/vehicles'
    Record-Check 'Public fleet' $fleet ($fleet.Status -eq 200) "Vehicles: $(@($fleet.Data).Count)"
    $vehicle = @($fleet.Data | Where-Object { $_.name -eq 'Toyota Corolla 2022' })[0]
    if (-not $vehicle) { throw 'Expected local test vehicle Toyota Corolla 2022 was not found.' }
    $known = Send-AuditRequest GET '/reservations/availability?startDate=10-11-2026&endDate=13-11-2026'
    $knownOccupied = @($known.Data | Where-Object { $_.vehicleId -eq $vehicle.id }).Count -gt 0
    Record-Check 'Known occupied range 10-13 Nov' $known $knownOccupied "Corolla occupied: $knownOccupied"
    $interior = Send-AuditRequest GET '/reservations/availability?startDate=11-11-2026&endDate=12-11-2026'
    $interiorOccupied = @($interior.Data | Where-Object { $_.vehicleId -eq $vehicle.id }).Count -gt 0
    Record-Check 'Interior overlap must remain occupied 11-12 Nov' $interior $interiorOccupied "Corolla occupied: $interiorOccupied"
    $badRange = Send-AuditRequest GET '/reservations/availability?startDate=13-11-2026&endDate=10-11-2026'
    Record-Check 'Reversed availability range rejected' $badRange ($badRange.Status -eq 400) $badRange.Data.error
    $invalidDate = Send-AuditRequest GET '/reservations/availability?startDate=31-02-2027&endDate=05-03-2027'
    Record-Check 'Impossible date returns client validation error' $invalidDate ($invalidDate.Status -eq 400) $invalidDate.Data.error
    $body = @{ vehicleId = $vehicle.id; userId = $login.Data.user.id; startDate = '2037-01-10'; endDate = '2037-01-13' }
    $reservation = Send-AuditRequest POST '/reservations' $body $authHeaders
    if ($reservation.Status -eq 201) { $created.Add([string]$reservation.Data.id) }
    Record-Check 'Three days with IVA included total 89.97' $reservation ($reservation.Status -eq 201 -and $reservation.Data.totalPrice -eq 89.97) "Total: $($reservation.Data.totalPrice); status: $($reservation.Data.paymentStatus)"
    $overlap = Send-AuditRequest POST '/reservations' $body $authHeaders
    Record-Check 'Duplicate overlapping reservation rejected' $overlap ($overlap.Status -eq 400) $overlap.Data.error
    if ($overlap.Status -eq 201) { $created.Add([string]$overlap.Data.id) }
    $sameDayBody = $body.Clone(); $sameDayBody.startDate = '2037-02-10'; $sameDayBody.endDate = '2037-02-10'
    $sameDay = Send-AuditRequest POST '/reservations' $sameDayBody $authHeaders
    Record-Check 'Same-day zero-duration booking rejected' $sameDay ($sameDay.Status -eq 400) $sameDay.Data.error
    if ($sameDay.Status -eq 201) { $created.Add([string]$sameDay.Data.id) }
    $reverseBody = $body.Clone(); $reverseBody.startDate = '2037-02-12'; $reverseBody.endDate = '2037-02-10'
    $reverse = Send-AuditRequest POST '/reservations' $reverseBody $authHeaders
    Record-Check 'Reversed booking rejected' $reverse ($reverse.Status -eq 400) $reverse.Data.error
    if ($reverse.Status -eq 201) { $created.Add([string]$reverse.Data.id) }
    $pastBody = $body.Clone(); $pastBody.startDate = '2001-01-10'; $pastBody.endDate = '2001-01-13'
    $past = Send-AuditRequest POST '/reservations' $pastBody $authHeaders
    Record-Check 'Past booking rejected by server' $past ($past.Status -eq 400) "HTTP $($past.Status); total: $($past.Data.totalPrice)"
    if ($past.Status -eq 201) { $created.Add([string]$past.Data.id) }
    $adjacentBody = $body.Clone(); $adjacentBody.startDate = '2037-01-13'; $adjacentBody.endDate = '2037-01-14'
    $adjacent = Send-AuditRequest POST '/reservations' $adjacentBody $authHeaders
    Record-Check 'Observe return-day boundary (current inclusive policy)' $adjacent ($adjacent.Status -eq 400) "Start on previous return date: HTTP $($adjacent.Status)"
    if ($adjacent.Status -eq 201) { $created.Add([string]$adjacent.Data.id) }
    if ($reservation.Status -eq 201) {
        $id = $reservation.Data.id
        $payment = Send-AuditRequest POST "/reservations/$id/payment-link" $null $authHeaders
        Record-Check 'Disabled local Wompi reports 503' $payment ($payment.Status -eq 503) $payment.Data.error
        $status = Send-AuditRequest GET "/reservations/$id/payment" $null $authHeaders
        Record-Check 'Failed payment remains PENDING, never PAID' $status ($status.Data.paymentStatus -eq 'PENDING') "Status: $($status.Data.paymentStatus); amount: $($status.Data.amount)"
    }
} finally {
    foreach ($id in $created) {
        $cancel = Send-AuditRequest DELETE "/reservations/$id" $null $authHeaders
        Record-Check 'Cancel only audit-created reservation' $cancel ($cancel.Status -in @(200, 204)) "HTTP $($cancel.Status)"
    }
    $report = [ordered]@{ timestamp = [DateTimeOffset]::Now.ToString('o'); api = $ApiBase; checks = $results; createdReservations = $created.Count; passed = @($results | Where-Object passed).Count; failed = @($results | Where-Object { -not $_.passed }).Count }
    $report | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $OutputPath -Encoding utf8
    $results | Format-Table name, passed, status, milliseconds -AutoSize
}
