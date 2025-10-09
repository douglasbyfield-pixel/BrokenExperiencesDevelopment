# Branch Protection & Workflow Guide

## 🔒 Branch Protection Strategy

This repository uses branch protection rules to maintain code quality and prevent accidental direct pushes to protected branches.

## 🌳 Branch Structure

- **`main`** - Production branch (protected)
- **`dev`** - Development/staging branch (protected, auto-deploys to Vercel & Render)
- **`develop`** - Legacy development branch (synced with dev)
- **`feature/*`** - Feature branches for new development

## 🚀 Deployment Pipeline

### Automated Deployments
- **`dev` branch** → Auto-deploys to:
  - **Render** (Backend API)
  - **Vercel** (Frontend Web App)

### How It Works
1. Create a feature branch from `dev`
2. Make your changes
3. Push your feature branch
4. Create a Pull Request to `dev`
5. Once merged, automatic deployment triggers

## 🛡️ Setting Up Branch Protection Rules

### For the `dev` branch:

1. Go to **GitHub Repository** → **Settings** → **Branches**
2. Click **Add rule** or edit existing rule for `dev`
3. Configure the following settings:

#### Required Settings:
- ✅ **Require a pull request before merging**
  - ✅ Require approvals: `1` (or more for team projects)
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from Code Owners (optional)

- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - Add status checks (if using CI/CD):
    - `build` (if you have a build check)
    - `lint` (if you have linting)
    - `test` (if you have tests)

- ✅ **Require conversation resolution before merging**

- ✅ **Do not allow bypassing the above settings**

- ✅ **Restrict who can push to matching branches**
  - Add specific users/teams who can push directly (for emergencies only)
  - Or leave empty to prevent ALL direct pushes

#### Optional Settings:
- ⚪ **Require signed commits** (for extra security)
- ⚪ **Require linear history** (prevents merge commits)
- ⚪ **Include administrators** (applies rules to admins too)

### For the `main` branch:

Follow the same settings as `dev`, but consider:
- Requiring **2+ approvals** for production changes
- **Requiring status checks** from your deployment pipeline
- **Including administrators** in the rules

## 📋 Recommended Workflow

### Creating a New Feature

```bash
# 1. Start from the latest dev branch
git checkout dev
git pull origin dev

# 2. Create a feature branch
git checkout -b feature/your-feature-name

# 3. Make your changes
# ... edit files ...

# 4. Commit your changes
git add .
git commit -m "feat: your feature description"

# 5. Push your feature branch
git push origin feature/your-feature-name

# 6. Create a Pull Request on GitHub
# Go to GitHub and create PR from feature/your-feature-name → dev
```

### Updating Your Feature Branch

```bash
# Get latest changes from dev
git checkout dev
git pull origin dev

# Merge into your feature branch
git checkout feature/your-feature-name
git merge dev

# Or rebase (cleaner history)
git rebase dev
```

### Hotfixes (Emergency Changes)

For urgent fixes that need to go directly to production:

```bash
# 1. Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-fix

# 2. Make your fix
# ... edit files ...

# 3. Commit and push
git add .
git commit -m "fix: critical bug description"
git push origin hotfix/critical-bug-fix

# 4. Create PR to main
# After merging to main, also merge to dev to keep branches in sync
```

## 🔑 Bypassing Protection (Emergencies Only)

If you absolutely need to push directly to `dev`:

1. **Option 1**: Temporarily disable branch protection
   - Go to Settings → Branches → Edit rule
   - Uncheck "Do not allow bypassing"
   - Make your push
   - **Re-enable protection immediately**

2. **Option 2**: Use administrator override (if enabled)
   - Add yourself to the bypass list
   - Push your changes
   - Remove yourself from bypass list

⚠️ **Warning**: Direct pushes should be extremely rare and documented

## 🤝 Code Review Guidelines

When reviewing PRs:
- ✅ Check code quality and style
- ✅ Verify functionality works as expected
- ✅ Look for potential bugs or security issues
- ✅ Ensure tests pass (if applicable)
- ✅ Verify deployment will succeed
- ✅ Check for breaking changes

## 📊 Monitoring Deployments

### Render (Backend)
- Dashboard: https://dashboard.render.com
- Check deploy status after merging to `dev`
- Monitor logs for errors

### Vercel (Frontend)
- Dashboard: https://vercel.com/dashboard
- Preview deployments on PRs
- Production deployment from `main`

## 🆘 Troubleshooting

### "Push rejected - branch protected"
✅ This is working as intended! Create a PR instead.

### "Can't merge PR - status checks failing"
1. Check the failed status check
2. Fix the issue in your feature branch
3. Push the fix
4. Status checks will re-run automatically

### "Deployment failed after merge"
1. Check deployment logs (Render/Vercel dashboard)
2. If critical, revert the merge commit
3. Fix the issue in a new PR
4. Redeploy

## 📝 Additional Resources

- [GitHub Branch Protection Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [Git Flow Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 🔄 Sync Commands

### Sync develop with dev (when needed)
```bash
git checkout develop
git reset --hard dev
git push origin develop --force
```

### Sync main with dev (for releases)
```bash
git checkout main
git merge dev
git push origin main
```

---

**Remember**: Branch protection is there to help prevent mistakes, not to slow you down. When used properly, it improves code quality and reduces bugs in production! 🚀

