# encrypt-certificates.ps1
# Encrypts all files in the certificates/ folder using AES-256-CBC
# Encrypted files are saved with .enc extension alongside originals
# Originals can then be safely deleted

param(
    [switch]$DeleteOriginals
)

$ErrorActionPreference = "Stop"
$certDir = Join-Path $PSScriptRoot "certificates"

if (-not (Test-Path $certDir)) {
    Write-Host "ERROR: certificates/ folder not found." -ForegroundColor Red
    exit 1
}

$files = Get-ChildItem -Path $certDir -File | Where-Object { $_.Extension -ne ".enc" -and $_.Name -ne "README.md" }

if ($files.Count -eq 0) {
    Write-Host "No unencrypted files found in certificates/" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "  Smart Tutors - Certificate Encryption" -ForegroundColor Cyan
Write-Host "  ======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Files to encrypt:" -ForegroundColor White
foreach ($f in $files) {
    Write-Host "    - $($f.Name) ($([math]::Round($f.Length / 1KB, 1)) KB)" -ForegroundColor Gray
}
Write-Host ""

# Secure password input
$securePassword = Read-Host -Prompt "  Enter encryption password" -AsSecureString
$confirmPassword = Read-Host -Prompt "  Confirm password" -AsSecureString

$pwd1 = [System.Net.NetworkCredential]::new($securePassword).Password
$pwd2 = [System.Net.NetworkCredential]::new($confirmPassword).Password

if ($pwd1 -ne $pwd2) {
    Write-Host "  ERROR: Passwords do not match." -ForegroundColor Red
    exit 1
}

if ($pwd1.Length -lt 8) {
    Write-Host "  ERROR: Password must be at least 8 characters." -ForegroundColor Red
    exit 1
}

# Derive key using PBKDF2 with SHA-256
$salt = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($salt)

$key = New-Object System.Security.Cryptography.Rfc2898DeriveBytes($pwd1, $salt, 100000, "SHA256")
$encryptionKey = $key.GetBytes(32)

Write-Host ""
Write-Host "  Encrypting..." -ForegroundColor Yellow

foreach ($file in $files) {
    $encPath = "$($file.FullName).enc"
    $iv = New-Object byte[] 16
    $rng.GetBytes($iv)

    $aes = [System.Security.Cryptography.Aes]::Create()
    $aes.Key = $encryptionKey
    $aes.IV = $iv
    $aes.Mode = "CBC"
    $aes.Padding = "PKCS7"

    $plainBytes = [System.IO.File]::ReadAllBytes($file.FullName)

    $encryptor = $aes.CreateEncryptor()
    $encBytes = $encryptor.TransformFinalBlock($plainBytes, 0, $plainBytes.Length)

    # Format: [32-byte salt][16-byte iv][encrypted data]
    $output = New-Object byte[] ($salt.Length + $iv.Length + $encBytes.Length)
    [Buffer]::BlockCopy($salt, 0, $output, 0, $salt.Length)
    [Buffer]::BlockCopy($iv, 0, $output, $salt.Length, $iv.Length)
    [Buffer]::BlockCopy($encBytes, 0, $output, $salt.Length + $iv.Length, $encBytes.Length)

    [System.IO.File]::WriteAllBytes($encPath, $output)

    $aes.Dispose()
    Write-Host "    Encrypted: $($file.Name) -> $($file.Name).enc" -ForegroundColor Green
}

# Clear sensitive data from memory
$pwd1 = $null
$pwd2 = $null
$encryptionKey = $null
$key.Dispose()
$rng.Dispose()

Write-Host ""
Write-Host "  Encryption complete." -ForegroundColor Green
Write-Host ""

if ($DeleteOriginals) {
    foreach ($file in $files) {
        Remove-Item $file.FullName -Force
        Write-Host "    Deleted original: $($file.Name)" -ForegroundColor DarkGray
    }
    Write-Host ""
    Write-Host "  Original files removed." -ForegroundColor Green
} else {
    Write-Host "  Original files retained. Run with -DeleteOriginals to remove them:" -ForegroundColor Yellow
    Write-Host "    .\encrypt-certificates.ps1 -DeleteOriginals" -ForegroundColor Gray
}

Write-Host ""
Write-Host "  IMPORTANT: Store the password securely!" -ForegroundColor Yellow
Write-Host "  The .enc files are safe to commit to git." -ForegroundColor Yellow
Write-Host ""
