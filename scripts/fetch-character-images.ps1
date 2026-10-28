# Downloads the FNAF character renders used by the fan wiki.
# Local copies keep the site working even if the wiki blocks hotlinking.
$ErrorActionPreference = "Stop"

$ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
$ref = "https://freddy-fazbears-pizza.fandom.com/"

$images = [ordered]@{
  "freddy-fazbear"  = "https://static.wikia.nocookie.net/freddy-fazbears-pizza/images/b/b5/Freddy_Fazbear_Render.png/revision/latest/scale-to-width-down/373?cb=20251105172837"
  "bonnie"          = "https://static.wikia.nocookie.net/freddy-fazbears-pizza/images/2/2a/ClassicBonnie_Infobox.png/revision/latest?cb=20260105073447"
  "chica"           = "https://static.wikia.nocookie.net/freddy-fazbears-pizza/images/1/10/ClassicChica_Infobox.png/revision/latest?cb=20260510031724"
  "foxy"            = "https://static.wikia.nocookie.net/freddy-fazbears-pizza/images/a/a2/ClassicFoxy_Infobox.png/revision/latest?cb=20260105105541"
  "golden-freddy"   = "https://static.wikia.nocookie.net/freddy-fazbears-pizza/images/9/99/YellowBear.png/revision/latest?cb=20160508161323"
  "the-puppet"      = "https://static.wikia.nocookie.net/freddy-fazbears-pizza/images/8/89/ThePuppetFullBody.png/revision/latest/scale-to-width-down/234?cb=20160529091041"
  "balloon-boy"     = "https://static.wikia.nocookie.net/freddy-fazbears-pizza/images/e/ef/12e.png/revision/latest?cb=20190407003108"
  "mangle"          = "https://static.wikia.nocookie.net/freddy-fazbears-pizza/images/d/d0/Mangle-Infobox.png/revision/latest?cb=20260512011009"
  "springtrap"      = "https://static.wikia.nocookie.net/freddy-fazbears-pizza/images/5/5d/Springtrap.png/revision/latest?cb=20210123161956"
  "circus-baby"     = "https://static.wikia.nocookie.net/freddy-fazbears-pizza/images/8/85/Circus_Baby_Full_Body.png/revision/latest?cb=20260328135840"
  "funtime-freddy"  = "https://static.wikia.nocookie.net/freddy-fazbears-pizza/images/2/2f/Funtime_Freddy_Full_Body.png/revision/latest?cb=20260328135840"
  "ballora"         = "https://static.wikia.nocookie.net/freddy-fazbears-pizza/images/f/f9/Ballora_Full_Body.png/revision/latest?cb=20260328135839"
  "ennard"          = "https://static.wikia.nocookie.net/freddy-fazbears-pizza/images/6/69/EnnardsActualFullBodyRender.png/revision/latest/scale-to-width-down/373?cb=20251122164202"
  "glamrock-freddy" = "https://static.wikia.nocookie.net/freddy-fazbears-pizza/images/5/5e/Glamrock_Freddy_HW2_Gallery.png/revision/latest/scale-to-width-down/461?cb=20240101102101"
  "montgomery-gator"= "https://static.wikia.nocookie.net/freddy-fazbears-pizza/images/9/94/Monty_HW2_Gallery.png/revision/latest/scale-to-width-down/462?cb=20240101131241"
  "roxanne-wolf"    = "https://static.wikia.nocookie.net/freddy-fazbears-pizza/images/5/51/Roxanne_Wolf_HW2_Gallery.png/revision/latest/scale-to-width-down/361?cb=20240101130217"
  "the-mimic"       = "https://static.wikia.nocookie.net/freddy-fazbears-pizza/images/6/62/Mimic_Render.png/revision/latest/scale-to-width-down/283?cb=20250504181308"
  "william-afton"   = "https://static.wikia.nocookie.net/freddy-fazbears-pizza/images/7/71/Purple_man.png/revision/latest?cb=20150723044740"
  "michael-afton"   = "https://static.wikia.nocookie.net/freddy-fazbears-pizza/images/e/eb/Eggs_Benedict_Silhouette.png/revision/latest?cb=20161010223506"
  "henry-emily"     = "https://static.wikia.nocookie.net/freddy-fazbears-pizza/images/4/49/HenryEmilyImage1.png/revision/latest/scale-to-width-down/434?cb=20250524014441"
}

$outDir = Join-Path (Resolve-Path (Join-Path $PSScriptRoot "..")) "public\characters"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

foreach ($id in $images.Keys) {
  $dest = Join-Path $outDir "$id.webp"
  $res = curl.exe -s -L -A $ua -e $ref -o $dest -w "%{http_code} %{content_type}" $images[$id]
  $size = (Get-Item $dest).Length
  Write-Output ("{0,-18} {1,-24} {2} bytes" -f $id, $res, $size)
}
