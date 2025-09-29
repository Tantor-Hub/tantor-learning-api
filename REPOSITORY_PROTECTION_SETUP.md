# Repository Protection Setup Guide

This guide explains how to set up repository protection to prevent pushes with failed builds or vulnerabilities.

## 🛡️ What's Included

### 1. GitHub Actions CI/CD Pipeline (`.github/workflows/ci.yml`)
- **Security Audit**: Checks for vulnerabilities before allowing pushes
- **Build Check**: Ensures the application builds successfully
- **Linting**: Runs ESLint to check code quality
- **Type Check**: Validates TypeScript types
- **Tests**: Runs all tests to ensure functionality
- **Dependency Check**: Warns about outdated dependencies

### 2. Pre-commit Script (`scripts/pre-commit-check.sh`)
- Local script to run all checks before committing
- Can be integrated with git hooks for automatic checking

### 3. NPM Scripts
- `npm run pre-commit`: Run all pre-commit checks locally
- `npm run security-audit`: Check for security vulnerabilities
- `npm run type-check`: Run TypeScript type checking

## 🚀 Setup Instructions

### Step 1: Enable GitHub Actions
1. Go to your repository on GitHub
2. Click on the "Actions" tab
3. Enable GitHub Actions if not already enabled

### Step 2: Set Up Branch Protection Rules
1. Go to your repository settings
2. Click on "Branches" in the left sidebar
3. Click "Add rule" or edit existing rules for `main` and `develop` branches
4. Configure the following settings:

#### Required Settings:
- ✅ **Require a pull request before merging**
- ✅ **Require status checks to pass before merging**
- ✅ **Require branches to be up to date before merging**
- ✅ **Restrict pushes that create files larger than 100 MB**

#### Required Status Checks:
Add these status checks (they will appear after the first workflow run):
- `Security Audit`
- `Build and Test`
- `Type Check`
- `All Checks Passed`

#### Additional Protection:
- ✅ **Require linear history**
- ✅ **Include administrators** (applies rules to admins too)
- ✅ **Allow force pushes**: ❌ (disabled)
- ✅ **Allow deletions**: ❌ (disabled)

### Step 3: Test the Setup
1. Make a small change to your code
2. Try to push directly to `main` branch
3. The push should be blocked if you have branch protection enabled
4. Create a pull request instead
5. The CI/CD pipeline will run automatically
6. The PR can only be merged if all checks pass

## 🔧 Local Development

### Run Pre-commit Checks Locally
```bash
# Run all checks before committing
npm run pre-commit

# Or run individual checks
npm run security-audit
npm run type-check
npm run lint
npm run build
npm run test
```

### Set Up Git Hooks (Optional)
To automatically run checks before every commit:

```bash
# Make the script executable
chmod +x scripts/pre-commit-check.sh

# Create a pre-commit hook
echo '#!/bin/bash\nnpm run pre-commit' > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## 🚨 What Gets Blocked

The following will be blocked by the protection rules:

### Build Failures
- TypeScript compilation errors
- Missing dependencies
- Build script failures

### Security Issues
- Known vulnerabilities in dependencies
- High or critical severity issues
- Outdated vulnerable packages

### Code Quality Issues
- ESLint errors
- TypeScript type errors
- Failed tests

### Other Issues
- Outdated dependencies (warning only)
- Large file uploads (>100MB)

## 📋 Workflow Details

### Security Audit Job
- Runs `npm audit` with moderate severity threshold
- Fails if any vulnerabilities are found
- Must pass before other jobs can run

### Build and Test Job
- Installs dependencies with `npm ci`
- Runs linting with `npm run lint`
- Builds the application with `npm run build`
- Runs tests with `npm run test`
- All steps must pass

### Type Check Job
- Runs TypeScript compiler in check mode
- Validates all type definitions
- Catches type errors before runtime

### Dependency Check Job
- Checks for outdated dependencies
- Provides warnings but doesn't fail the build
- Helps maintain up-to-date dependencies

## 🔄 Workflow Triggers

The CI/CD pipeline runs on:
- **Push** to `main` or `develop` branches
- **Pull requests** targeting `main` or `develop` branches

## 🛠️ Customization

### Modify Security Audit Level
Edit `.github/workflows/ci.yml` and change:
```yaml
npm audit --audit-level=moderate
```
To:
- `--audit-level=low` (less strict)
- `--audit-level=high` (more strict)
- `--audit-level=critical` (most strict)

### Add More Checks
You can add additional jobs to the workflow:
- Code coverage checks
- Performance tests
- Integration tests
- Custom security scans

### Modify Branch Protection
You can adjust the branch protection rules in GitHub settings to:
- Allow certain users to bypass checks
- Require specific reviewers
- Set different rules for different branches

## 📞 Troubleshooting

### Workflow Not Running
- Check if GitHub Actions is enabled
- Verify the workflow file is in `.github/workflows/`
- Check the Actions tab for error messages

### Checks Not Appearing
- Run the workflow at least once
- Check that job names match the required status checks
- Verify branch protection rules are configured correctly

### Local Script Issues
- Ensure you have Node.js and npm installed
- Run `npm install` to install dependencies
- Check file permissions on the script file

## 🎯 Benefits

✅ **Prevents broken code** from reaching the main branch  
✅ **Catches security vulnerabilities** before they're deployed  
✅ **Maintains code quality** with automated linting and testing  
✅ **Ensures type safety** with TypeScript validation  
✅ **Keeps dependencies updated** with automated checks  
✅ **Provides clear feedback** on what needs to be fixed  

This setup ensures your repository maintains high quality and security standards while providing a smooth development experience.
