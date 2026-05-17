$base = "C:\Users\JUAN CARLOS\Documents\MarketingSkils\surus-estrategico\public"
$scriptTag = @"

<script src="/js/intel-data.js"></script>
<script src="/js/intel-operativo.js"></script>
"@

$files = @(
  "kuka-kr210.html","aleo-solar.html","bsh-esquiroz.html",
  "neapco-europe.html","frieslandcampina.html","eyrise-smart-glass.html",
  "ti-group-automotive.html","obeikan-mdf.html","torello-holzher.html",
  "all-in-foods.html","balta-industries.html","extrusion-plasticas.html",
  "nynas-refineria.html"
)

foreach($f in $files) {
  $path = Join-Path $base $f
  if(Test-Path $path) {
    $content = Get-Content $path -Raw -Encoding UTF8
    if($content -notmatch "intel-operativo\.js") {
      $content = $content -replace '</body>', "$scriptTag`n</body>"
      [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
      Write-Host "OK: $f"
    } else {
      Write-Host "SKIP: $f (already has intel)"
    }
  } else {
    Write-Host "MISS: $f"
  }
}
Write-Host "Done!"
