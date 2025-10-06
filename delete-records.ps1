# PowerShell script to delete all records from sessioncours, lesson, and lessondocument tables
# Make sure to update the connection parameters below

param(
    [string]$Host = "localhost",
    [string]$Port = "5432", 
    [string]$Database = "your_database_name",
    [string]$Username = "your_username",
    [string]$Password = "your_password"
)

Write-Host "WARNING: This will delete ALL records from sessioncours, lesson, and lessondocument tables!" -ForegroundColor Red
Write-Host "Are you sure you want to continue? (y/N)" -ForegroundColor Yellow
$confirmation = Read-Host

if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
    Write-Host "Deleting all records..." -ForegroundColor Yellow
    
    # Set environment variable for password
    $env:PGPASSWORD = $Password
    
    # Run the SQL script
    psql -h $Host -p $Port -U $Username -d $Database -f "delete-all-records.sql"
    
    Write-Host "Deletion completed!" -ForegroundColor Green
} else {
    Write-Host "Operation cancelled." -ForegroundColor Yellow
}
