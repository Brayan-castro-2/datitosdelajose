Add-Type -AssemblyName System.IO.Compression.FileSystem

$zipPath = Join-Path (Get-Location) "Base de Datos Web Completa (127 Negocios y Atractivos) - Datitos de la Jose.xlsx"
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)

$sheetEntry = $zip.GetEntry("xl/worksheets/sheet1.xml")
$reader = New-Object System.IO.StreamReader($sheetEntry.Open())
$sheetXml = [xml]$reader.ReadToEnd()
$reader.Close()

$rows = $sheetXml.worksheet.sheetData.row
Write-Host "Total rows in sheet1: $($rows.Count)"

for ($i = 0; $i -lt [Math]::Min(5, $rows.Count); $i++) {
    $r = $rows[$i]
    $cells = @()
    foreach ($c in $r.c) {
        $val = ""
        if ($c.is -and $c.is.t) { $val = $c.is.t }
        elseif ($c.v) { $val = $c.v }
        $cells += "[$($c.r)]: $val"
    }
    Write-Host "Row $($r.r): $($cells -join ' | ')"
}

$zip.Dispose()
