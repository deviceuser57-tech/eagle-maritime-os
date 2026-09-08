$srcDir = "d:\Eagle Maritime OS- 06-07-2026- 0135Hrs\eagle-maritime-os\src"
$outFile = "d:\Eagle Maritime OS- 06-07-2026- 0135Hrs\eagle-maritime-os\audit_fields.json"

$files = Get-ChildItem -Path $srcDir -Recurse -Include *.tsx, *.ts
$results = @()

$pattern = '<(Input|Select|Dropdown|Combobox|Textarea|Checkbox|Switch|DatePicker|FormField)([^>]+)>'

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $matches = [regex]::Matches($content, $pattern, "IgnoreCase")
    
    foreach ($match in $matches) {
        $tag = $match.Groups[1].Value
        $props = $match.Groups[2].Value
        
        $nameMatch = [regex]::Match($props, '(?:name|id)=["'']([^"'']+)["'']', "IgnoreCase")
        $labelMatch = [regex]::Match($props, 'label=["'']([^"'']+)["'']', "IgnoreCase")
        
        $name = if ($nameMatch.Success) { $nameMatch.Groups[1].Value } else { "Unknown" }
        $label = if ($labelMatch.Success) { $labelMatch.Groups[1].Value } else { "Unknown" }
        
        $results += [PSCustomObject]@{
            File = $file.FullName.Replace($srcDir, "")
            Component = $file.BaseName
            Tag = $tag
            Name = $name
            Label = $label
            Props = $props.Substring(0, [math]::Min($props.Length, 150))
        }
    }
}

$results | ConvertTo-Json -Depth 5 | Out-File -FilePath $outFile -Encoding utf8
