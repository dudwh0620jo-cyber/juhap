$ErrorActionPreference = "Stop"

$url = "http://localhost:5173"
$chromeCandidates = @(
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "$env:LocalAppData\Google\Chrome\Application\chrome.exe"
)

$chrome = $chromeCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1

if (-not $chrome) {
  throw "Chrome 실행 파일을 찾지 못했습니다. Chrome이 설치되어 있는지 확인해 주세요."
}

Start-Job -ScriptBlock {
  param($chromePath, $targetUrl)
  Start-Sleep -Seconds 1
  Start-Process -FilePath $chromePath -ArgumentList $targetUrl
} -ArgumentList $chrome, $url | Out-Null

npm.cmd exec vite -- --host localhost --port 5173
