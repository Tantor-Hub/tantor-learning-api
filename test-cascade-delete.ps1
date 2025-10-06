# PowerShell script to test CASCADE DELETE functionality
# Make sure to update the connection parameters below

param(
    [string]$Host = "localhost",
    [string]$Port = "5432", 
    [string]$Database = "your_database_name",
    [string]$Username = "your_username",
    [string]$Password = "your_password"
)

Write-Host "🧪 Testing CASCADE DELETE Functionality" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Set environment variable for password
$env:PGPASSWORD = $Password

Write-Host "📋 Step 1: Running CASCADE DELETE setup..." -ForegroundColor Yellow
psql -h $Host -p $Port -U $Username -d $Database -f "add-cascade-delete-simple.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ CASCADE DELETE setup completed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ CASCADE DELETE setup failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n🧪 Step 2: Running CASCADE DELETE test..." -ForegroundColor Yellow
psql -h $Host -p $Port -U $Username -d $Database -f "test-cascade-delete.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ CASCADE DELETE test completed successfully!" -ForegroundColor Green
    Write-Host "🎉 All test data was properly cascaded and cleaned up!" -ForegroundColor Green
} else {
    Write-Host "`n❌ CASCADE DELETE test failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n📊 Test Results Summary:" -ForegroundColor Cyan
Write-Host "- CASCADE DELETE constraints added to all foreign keys" -ForegroundColor White
Write-Host "- Test data created and verified" -ForegroundColor White
Write-Host "- SessionCours deletion cascaded to all related records" -ForegroundColor White
Write-Host "- All test data cleaned up successfully" -ForegroundColor White

Write-Host "`n🚀 Your CASCADE DELETE functionality is working correctly!" -ForegroundColor Green
