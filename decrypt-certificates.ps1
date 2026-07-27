# decrypt-certificates.ps1
# Decrypts .enc files in the certificates/ folder back to original files

$ErrorActionPreference = "Stop"
$certDir = Join-Path $PSScriptRoot "certificates"

if (-not (Test-Path $certDir)) {
    Write-Host "ERROR: certificates/ folder not found." -ForegroundColor Red
    exit 1
}

$encFiles = Get-ChildItem -Path $certDir -Filter "*.enc" -File

if ($encFiles.Count -eq 0) {
    Write-Host "No .enc files found in certificates/" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "  Smart Tutors - Certificate Decryption" -ForegroundColor Cyan
Write-Host "  ======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Files to decrypt:" -ForegroundColor White
foreach ($f in $encFiles) {
    $originalName = $f.Name -replace '\.enc$', ''
    Write-Host "    - $($f.Name) -> $originalName" -ForegroundColor Gray
}
Write-Host ""

# Secure password input
$securePassword = Read-Host -Prompt "  Enter decryption password" -AsSecureString
$password = [System.Net.NetworkCredential]::new($securePassword).Password

Write-Host ""
Write-Host "  Decrypting..." -ForegroundColor Yellow

foreach ($file in $encFiles) {
    $data = [System.IO.File]::ReadAllBytes($file.FullName)

    # Extract salt (first 32 bytes), IV (next 16 bytes), ciphertext (rest)
    $salt = $data[0..31]
    $iv = $data[32..47]
    $ciphertext = $data[48..($data.Length - 1)]

    # Convert arrays to byte arrays
    $saltBytes = New-Object byte[] 32
    [Buffer]::BlockCopy([byte[]]$salt, 0, $saltBytes, 0, 32)

    $ivBytes = New-Object byte[] 16
    [Buffer]::BlockCopy([byte[]]$iv, 0, $ivBytes, 0, 16)

    $cipherBytes = New-Object byte[] $ciphertext.Length
    [Buffer]::BlockCopy([byte[]]$ciphertext, 0, $cipherBytes, 0, $ciphertext.Length)

    # Derive key using same parameters as encryption
    $key = New-Object System.Security.Cryptography.Rfc2898DeriveBytes($password, $saltBytes, 100000, "SHA256")
    $encryptionKey = $key.GetBytes(32)

    $aes = [System.Security.Cryptography.Aes]::Create()
    $aes.Key = $encryptionKey
    $aes.IV = $ivBytes
    $aes.Mode = "CBC"
    $aes.Padding = "PKCS7"

    try {
        $decryptor = $aes.CreateDecryptor()
        $decBytes = $decryptor.TransformFinalBlock($cipherBytes, 0, $cipherBytes.Length)

        $outPath = $file.FullName -replace '\.enc$', ''
        [System.IO.File]::WriteAllBytes($outPath, $decBytes)

        $originalName = $file.Name -replace '\.enc$', ''
        Write-Host "    Decrypted: $($file.Name) -> $originalName" -ForegroundColor Green
    }
    catch {
        Write-Host "    FAILED: $($file.Name) - Wrong password or corrupted file" -ForegroundColor Red
    }
    finally {
        $aes.Dispose()
        $key.Dispose()
    }
}

# Clear sensitive data
$password = $null

Write-Host ""
Write-Host "  Decryption complete." -ForegroundColor Green
Write-Host "  WARNING: Original .der/.pem files are now unprotected." -ForegroundColor Yellow
Write-Host "  Do not commit them to git." -ForegroundColor Yellow
Write-Host ""
