# 🔒 Quick Setup: Branch Protection Rules

## ⚡ Fast Setup (5 minutes)

Follow these steps to protect your `dev` and `main` branches from accidental direct pushes.

### Step 1: Access Branch Protection Settings

1. Go to your GitHub repository
2. Click **Settings** (top navigation)
3. Click **Branches** (left sidebar under "Code and automation")

### Step 2: Protect the `dev` Branch

1. Click **Add branch protection rule** (or **Add rule**)
2. In **Branch name pattern**, type: `dev`
3. Enable these settings:

#### ✅ Pull Request Settings
```
☑️ Require a pull request before merging
    ☑️ Require approvals: 1
    ☑️ Dismiss stale pull request approvals when new commits are pushed
```

#### ✅ Status Check Settings (Optional but Recommended)
```
☑️ Require status checks to pass before merging
    ☑️ Require branches to be up to date before merging
    Add status checks if you have CI/CD:
    - Vercel deployment check
    - Build check
    - Lint check
```

#### ✅ Conversation Settings
```
☑️ Require conversation resolution before merging
```

#### ✅ Push Restrictions
```
☑️ Restrict who can push to matching branches
    (Leave empty to block ALL direct pushes, or add specific users for emergencies)
```

#### ✅ Other Settings
```
☑️ Do not allow bypassing the above settings
☐ Allow force pushes (keep this UNCHECKED)
☐ Allow deletions (keep this UNCHECKED)
```

4. Click **Create** or **Save changes**

### Step 3: Protect the `main` Branch

1. Click **Add branch protection rule** again
2. In **Branch name pattern**, type: `main`
3. Use the **same settings as `dev`**, but consider:
   - **Require approvals**: `2` (for production, require more reviews)
   - Add all deployment status checks

4. Click **Create** or **Save changes**

### Step 4: Test the Protection

```bash
# Try to push directly to dev (this should fail)
git checkout dev
git commit --allow-empty -m "test: checking branch protection"
git push origin dev

# Expected result: ❌ Push rejected!
# Error: "protected branch hook declined"
```

If you see the error above, **protection is working! ✅**

---

## 🎯 What This Accomplishes

### Before Branch Protection:
```bash
git push origin dev  # ✅ Works (dangerous!)
# Code goes straight to production without review
```

### After Branch Protection:
```bash
git push origin dev  # ❌ Blocked!
# Error: protected branch requires a pull request

# Correct workflow:
git push origin feature/my-changes  # ✅ Push feature branch
# Create PR on GitHub → Get review → Merge → Auto-deploy
```

---

## 🔧 Configuration Examples

### Strict Protection (Recommended for Teams)
```
✅ Require pull request (1+ approvals)
✅ Require status checks
✅ Require conversation resolution
✅ Restrict push access
✅ Include administrators
```

### Moderate Protection (Solo Developer with Safety Net)
```
✅ Require pull request (0 approvals - can self-merge)
✅ Require status checks (if available)
✅ Restrict push access (prevents accidents)
⬜ Include administrators (can bypass if needed)
```

### Minimal Protection (Just Prevent Accidents)
```
✅ Require pull request (0 approvals)
⬜ Require status checks
⬜ Require conversation resolution
✅ Restrict push access
⬜ Include administrators
```

---

## 📋 Quick Checklist

After setup, verify:

- [ ] ✅ `dev` branch is protected
- [ ] ✅ `main` branch is protected
- [ ] ✅ Direct pushes are blocked
- [ ] ✅ Pull requests are required
- [ ] ✅ CODEOWNERS file is committed
- [ ] ✅ PR template is available
- [ ] ✅ Team members know the new workflow

---

## 🆘 Troubleshooting

### "I can still push directly to dev"
- Check if you're listed in the bypass permissions
- Ensure "Do not allow bypassing" is checked
- Verify you're pushing to `dev` and not a different branch

### "I can't merge my own PR"
- If "Require approvals" is set to 1+, you need another person to review
- Change to 0 approvals if working solo
- Or add yourself to the bypass list (not recommended)

### "Status checks are required but none exist"
- Uncheck "Require status checks" for now
- Or set up CI/CD workflow first
- Or add a simple check workflow

---

## 🔗 Visual Guide

Here's what your settings should look like:

```
Branch name pattern: dev

╔═══════════════════════════════════════════════════════╗
║ Protect matching branches                             ║
╠═══════════════════════════════════════════════════════╣
║ ☑️ Require a pull request before merging              ║
║   ☑️ Require approvals: [1]                           ║
║   ☑️ Dismiss stale pull request approvals             ║
║                                                        ║
║ ☑️ Require status checks to pass before merging       ║
║   ☑️ Require branches to be up to date                ║
║                                                        ║
║ ☑️ Require conversation resolution before merging     ║
║                                                        ║
║ ☑️ Restrict who can push to matching branches         ║
║   [Empty - no one can push directly]                  ║
║                                                        ║
║ ☑️ Do not allow bypassing the above settings          ║
║ ☐ Allow force pushes                                  ║
║ ☐ Allow deletions                                     ║
╚═══════════════════════════════════════════════════════╝
```

---

## 📚 Related Documentation

- [Branch Protection Guide](./BRANCH_PROTECTION_GUIDE.md) - Detailed workflow documentation
- [Pull Request Template](./PULL_REQUEST_TEMPLATE.md) - PR template for consistency
- [CODEOWNERS](./CODEOWNERS) - Automatic review assignments

---

**Need help?** Check the [GitHub Branch Protection Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)

**Ready to work?** Use this workflow:
```bash
git checkout dev
git pull
git checkout -b feature/my-feature
# ... make changes ...
git push origin feature/my-feature
# Create PR on GitHub → Review → Merge
```

🎉 **You're all set! Your branches are now protected!** 🎉

