$path = "c:\Users\JUAN CARLOS\Documents\MarketingSkils\surus-estrategico\public\dashboard\index.html"
$bytes = [System.IO.File]::ReadAllBytes($path)
$content = [System.Text.Encoding]::UTF8.GetString($bytes)

# Fix double CR line endings
$content = $content -replace "`r`r`n", "`n"
$content = $content -replace "`r`n", "`n"

# Fix mojibake characters (UTF-8 double-encoded through Latin-1)
$replacements = @{
    'DÃ¼RR' = 'DÜRR'
    'GÃ¼DEL' = 'GÜDEL'
    'StÃ¤ubli' = 'Stäubli'
    'LÃ¼nen' = 'Lünen'
    'LÃ¼nders' = 'Lünders'
    'DÃ¼ren' = 'Düren'
    'TÃºnez' = 'Túnez'
    'SudÃ¡frica' = 'Sudáfrica'
    'Ã¡frica' = 'áfrica'
    'Ãfrica' = 'África'
    'Ã frica' = 'África'
    'Asiático' = 'Asiático'
    'construcciÃ³n' = 'construcción'
    'transiciÃ³n' = 'transición'
    'expansiÃ³n' = 'expansión'
    'eÃ³licos' = 'eólicos'
    'â†'' = '→'
    'â†"' = '↓'
    'â€"' = '—'
    'â€™' = "'"
    'â€œ' = '"'
    'â€' = '"'
    'Ã—' = '×'
    'Ã©' = 'é'
    'Ã¨' = 'è'
    'Ã ' = 'à'
    'Ã¡' = 'á'
    'Ã³' = 'ó'
    'Ãº' = 'ú'
    'Ã±' = 'ñ'
    'Ã¶' = 'ö'
    'Ã¼' = 'ü'
    'Ã¤' = 'ä'
    'Å¡' = 'š'
    'Å ' = 'Š'
}

foreach ($key in $replacements.Keys) {
    $content = $content.Replace($key, $replacements[$key])
}

# Write back as clean UTF-8 with BOM
$utf8 = New-Object System.Text.UTF8Encoding($true)
[System.IO.File]::WriteAllText($path, $content, $utf8)

Write-Host "Fixed encoding. New size: $($content.Length) chars"

# Verify no broken chars remain
$remaining = [regex]::Matches($content, 'Ã[¡-¼]|â€|Å[¡ ]')
if ($remaining.Count -gt 0) {
    Write-Host "WARNING: $($remaining.Count) possible broken chars remain"
    $remaining | Select-Object -First 5 | ForEach-Object { Write-Host "  Found: '$($_.Value)' at index $($_.Index)" }
} else {
    Write-Host "SUCCESS: No broken characters detected"
}
