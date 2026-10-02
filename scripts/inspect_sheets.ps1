Add-Type -AssemblyName System.IO.Compression.FileSystem

$zipPath = Join-Path (Get-Location) "Base de Datos Web Completa (127 Negocios y Atractivos) - Datitos de la Jose.xlsx"
$zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)

# Read workbook.xml to get sheet names
$wbEntry = $zip.GetEntry("xl/workbook.xml")
$reader = New-Object System.IO.StreamReader($wbEntry.Open())
$wbXml = [xml]$reader.ReadToEnd()
$reader.Close()

Write-Host "--- Sheets in Workbook ---"
foreach ($sheet in $wbXml.workbook.sheets.sheet) {
    Write-Host "$($sheet.name) (Id: $($sheet.sheetId), r:id: $($sheet.'r:id'))"
}

$zip.Dispose()
