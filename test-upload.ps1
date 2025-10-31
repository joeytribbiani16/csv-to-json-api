# Test CSV upload script
$uri = "http://localhost:3001/api/upload-csv"
$filePath = "sample-data/users.csv"

# Create multipart form data
Add-Type -AssemblyName System.Net.Http

$httpClientHandler = New-Object System.Net.Http.HttpClientHandler
$httpClient = New-Object System.Net.Http.HttpClient($httpClientHandler)

$multipartContent = New-Object System.Net.Http.MultipartFormDataContent

$fileContent = New-Object System.Net.Http.StreamContent([System.IO.File]::OpenRead($filePath))
$fileContent.Headers.ContentDisposition = New-Object System.Net.Http.Headers.ContentDispositionHeaderValue("form-data")
$fileContent.Headers.ContentDisposition.Name = '"csvFile"'
$fileContent.Headers.ContentDisposition.FileName = '"users.csv"'

$multipartContent.Add($fileContent)

# Send the request
$response = $httpClient.PostAsync($uri, $multipartContent).Result
$content = $response.Content.ReadAsStringAsync().Result

Write-Host "Status: $($response.StatusCode)"
Write-Host "Response: $content"

# Clean up
$httpClient.Dispose()
$fileContent.Dispose()
$multipartContent.Dispose()
