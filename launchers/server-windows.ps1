# WORLD-404: local static HTTP server, Windows PowerShell 5.1+; no Python/Node/admin.
$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$listener = New-Object Net.Sockets.TcpListener([Net.IPAddress]::Loopback, 8765)
$listener.Start()
$port = ([Net.IPEndPoint]$listener.LocalEndpoint).Port
$url = "http://127.0.0.1:$port/"
$mime = @{'.html'='text/html; charset=utf-8';'.css'='text/css; charset=utf-8';'.js'='text/javascript; charset=utf-8';'.json'='application/json; charset=utf-8';'.png'='image/png';'.svg'='image/svg+xml';'.ico'='image/x-icon';'.webp'='image/webp';'.wav'='audio/wav'}
Write-Host 'WORLD-404 v1.6 - Windows' -ForegroundColor Cyan
Write-Host "URL: $url"
Write-Host 'Para cerrar, pulsa Ctrl+C en esta ventana.'
try { Start-Process $url | Out-Null } catch { Write-Host "Abre manualmente: $url" }
try {
  while ($true) {
    $client = $listener.AcceptTcpClient()
    try {
      $client.ReceiveTimeout = 3000; $client.SendTimeout = 3000
      $stream = $client.GetStream()
      $reader = New-Object IO.StreamReader($stream, [Text.Encoding]::ASCII, $false, 1024, $true)
      $line = $reader.ReadLine()
      if (-not $line) { continue }
      $parts = $line.Split(' ')
      while ($true) { $header = $reader.ReadLine(); if ($null -eq $header -or $header -eq '') { break } }
      $status = '200 OK'; $content = [byte[]]@(); $type = 'text/plain; charset=utf-8'; $method = $parts[0]
      if ($parts.Length -lt 3 -or $method -notin @('GET','HEAD')) { $status = '405 Method Not Allowed' }
      else {
        try {
          $requestPath = [Uri]::UnescapeDataString($parts[1].Split('?')[0]).Replace('/', [IO.Path]::DirectorySeparatorChar)
          if ($requestPath -match '[\x00-\x1f]') { throw 'Invalid path' }
          $relative = $requestPath.TrimStart([IO.Path]::DirectorySeparatorChar)
          if ([string]::IsNullOrWhiteSpace($relative)) { $relative = 'index.html' }
          $full = [IO.Path]::GetFullPath((Join-Path $root $relative))
          if (-not $full.StartsWith($root + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Outside root' }
          $ext = [IO.Path]::GetExtension($full).ToLowerInvariant()
          if ($ext -notin @('.html','.css','.js','.json','.png','.svg','.ico','.webp','.wav')) { throw 'Forbidden extension' }
          if (-not [IO.File]::Exists($full)) { $status = '404 Not Found' }
          else { $content = [IO.File]::ReadAllBytes($full); $type = $mime[$ext] }
        } catch { $status = '404 Not Found' }
      }
      if ($status -ne '200 OK') { $content = [Text.Encoding]::UTF8.GetBytes($status) }
      $headers = "HTTP/1.1 $status`r`nContent-Type: $type`r`nContent-Length: $($content.Length)`r`nConnection: close`r`nCache-Control: no-store`r`nX-Content-Type-Options: nosniff`r`n`r`n"
      $head = [Text.Encoding]::ASCII.GetBytes($headers)
      $stream.Write($head,0,$head.Length)
      if ($method -ne 'HEAD' -and $content.Length -gt 0) { $stream.Write($content,0,$content.Length) }
      $stream.Flush()
    } catch { Write-Warning "Peticion descartada: $_" }
    finally { $client.Dispose() }
  }
} finally { $listener.Stop() }
