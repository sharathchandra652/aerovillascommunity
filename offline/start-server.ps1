# Aero Villas offline preview: serves the exported site in .\site on localhost
# and opens it in the default browser. Uses only what ships with Windows.

$ErrorActionPreference = "Stop"
$root = Join-Path $PSScriptRoot "site"
if (-not (Test-Path (Join-Path $root "index.html"))) {
  Write-Host "Could not find the site folder next to this script." -ForegroundColor Red
  Read-Host "Press Enter to close"
  exit 1
}

$types = @{
  ".html" = "text/html; charset=utf-8"; ".txt" = "text/plain; charset=utf-8"
  ".js" = "application/javascript"; ".css" = "text/css"; ".json" = "application/json"
  ".jpg" = "image/jpeg"; ".jpeg" = "image/jpeg"; ".png" = "image/png"; ".webp" = "image/webp"
  ".svg" = "image/svg+xml"; ".ico" = "image/x-icon"; ".gif" = "image/gif"
  ".woff" = "font/woff"; ".woff2" = "font/woff2"; ".mp4" = "video/mp4"; ".mp3" = "audio/mpeg"
}

# First free port from 8080
$listener = $null
foreach ($port in 8080..8099) {
  try {
    $l = New-Object System.Net.HttpListener
    $l.Prefixes.Add("http://localhost:$port/")
    $l.Start()
    $listener = $l
    break
  } catch { }
}
if (-not $listener) {
  Write-Host "No free port between 8080 and 8099." -ForegroundColor Red
  Read-Host "Press Enter to close"
  exit 1
}

$url = $listener.Prefixes | Select-Object -First 1
Write-Host ""
Write-Host "  AERO VILLAS - offline preview" -ForegroundColor Yellow
Write-Host "  Running at $url"
Write-Host "  Keep this window open while you browse. Close it to stop."
Write-Host ""
Start-Process $url

function Resolve-File([string]$path) {
  $rel = [Uri]::UnescapeDataString($path).TrimStart("/").Replace("/", "\")
  $full = [IO.Path]::GetFullPath((Join-Path $root $rel))
  if (-not $full.StartsWith($root, [StringComparison]::OrdinalIgnoreCase)) { return $null }
  if (Test-Path $full -PathType Leaf) { return $full }
  if (Test-Path "$full.html" -PathType Leaf) { return "$full.html" }
  $index = Join-Path $full "index.html"
  if (Test-Path $index -PathType Leaf) { return $index }
  return $null
}

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $res = $ctx.Response
  try {
    $file = Resolve-File $ctx.Request.Url.LocalPath
    if ($file) {
      $res.StatusCode = 200
    } else {
      $res.StatusCode = 404
      $file = Join-Path $root "404.html"
    }
    $ext = [IO.Path]::GetExtension($file).ToLower()
    $res.ContentType = if ($types.ContainsKey($ext)) { $types[$ext] } else { "application/octet-stream" }
    $bytes = [IO.File]::ReadAllBytes($file)
    $res.ContentLength64 = $bytes.Length
    $res.OutputStream.Write($bytes, 0, $bytes.Length)
  } catch {
    $res.StatusCode = 500
  } finally {
    $res.OutputStream.Close()
  }
}
