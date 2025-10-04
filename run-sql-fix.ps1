# PowerShell script to run the SQL fix
# This script will attempt to run the SQL fix using psql if available

param(
    [string]$Host = "localhost",
    [string]$Port = "5432",
    [string]$Database = "your_database_name_here",
    [string]$Username = "postgres"
)

Write-Host "Event UUID Array Fix Script" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

# Check if psql is available
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "psql is not found in PATH. Please install PostgreSQL client or run the SQL script manually." -ForegroundColor Red
    Write-Host "You can run the SQL script 'fix-event-uuid-issue-simple.sql' directly in your PostgreSQL client (pgAdmin, DBeaver, etc.)" -ForegroundColor Yellow
    exit 1
}

Write-Host "Found psql at: $($psqlPath.Source)" -ForegroundColor Green

# Prompt for password
$Password = Read-Host "Enter database password" -AsSecureString
$PlainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($Password))

# Set environment variable for password
$env:PGPASSWORD = $PlainPassword

try {
    Write-Host "Running SQL fix script..." -ForegroundColor Yellow
    
    # Run the SQL script
    psql -h $Host -p $Port -U $Username -d $Database -f "fix-event-uuid-issue-simple.sql"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SQL fix completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "SQL fix failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    }
} catch {
    Write-Host "Error running SQL fix: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    # Clear the password from environment
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host "Script completed." -ForegroundColor Green
