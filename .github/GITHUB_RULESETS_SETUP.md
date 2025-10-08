# 🔒 GitHub Rulesets Setup Guide

## 📋 What You're Seeing

GitHub has **two** branch protection systems:

1. **Branch Protection Rules** (classic) - `Settings → Branches`
2. **Rulesets** (new) - `Settings → Rules → Rulesets` ← You are here!

Both work fine. Rulesets are more powerful. Here's how to use them:

---

## ⚡ Quick Setup: Protect `dev` Branch with Rulesets

### Step 1: Name Your Ruleset
```
Ruleset Name: protect-dev-branch
```

### Step 2: Enforcement Status
```
☑️ Active (not "Evaluate" mode)
```

### Step 3: Bypass List (Optional)
```
Leave empty for maximum protection
OR
Add yourself for emergency access only
```

### Step 4: Target Branches ⭐ **IMPORTANT**
```
Click "Add target"
Select: "Include by pattern"
Pattern: dev

This tells the ruleset to apply ONLY to the dev branch
```

### Step 5: Branch Rules (Enable These)

#### 🚫 **Restrict updates** ⭐ **THIS IS THE KEY ONE**
```
☑️ Restrict updates
    → This BLOCKS direct pushes to dev
    → Equivalent to old "Restrict who can push"
    → Users must use PRs instead
```

#### 🔒 **Restrict deletions**
```
☑️ Restrict deletions
    → Prevents accidental branch deletion
```

#### 📝 **Require a pull request before merging** ⭐ **IMPORTANT**
```
☑️ Require a pull request before merging
    Required approvals: 1 (or 0 if working solo)
    ☑️ Dismiss stale pull request approvals when new commits are pushed
    ☑️ Require review from Code Owners (if using CODEOWNERS)
    ☑️ Require conversation resolution before merging
```

#### ✅ **Require status checks to pass** (Optional)
```
☑️ Require status checks to pass
    Add checks like:
    - vercel (Vercel deployment)
    - build
    - lint
    
    Only enable if you have these checks set up!
```

#### 🛡️ **Block force pushes**
```
☑️ Block force pushes
    → Prevents git push --force
    → Protects history
```

#### 📊 **Other Optional Rules**
```
☐ Require linear history (optional - prevents merge commits)
☐ Require signed commits (optional - extra security)
☐ Require deployments to succeed (optional)
```

### Step 6: Save
```
Click "Create" at the bottom
```

---

## 🎯 Complete Configuration Example

### For `dev` Branch (Development/Staging):

```yaml
Ruleset Name: protect-dev-branch
Enforcement: Active
Bypass List: (empty)

Target Branches:
  ✅ Include by pattern: dev

Branch Rules:
  ✅ Restrict updates           # ← Blocks direct pushes!
  ✅ Restrict deletions
  ✅ Require pull request before merging
      → Required approvals: 1
      → Dismiss stale approvals: Yes
      → Require Code Owners review: Yes
      → Require conversation resolution: Yes
  ✅ Block force pushes
  ☐ Require status checks (add if available)
  ☐ Require linear history (optional)
```

### For `main` Branch (Production):

```yaml
Ruleset Name: protect-main-branch
Enforcement: Active
Bypass List: (empty)

Target Branches:
  ✅ Include by pattern: main

Branch Rules:
  ✅ Restrict updates           # ← Blocks direct pushes!
  ✅ Restrict deletions
  ✅ Require pull request before merging
      → Required approvals: 2    # ← More approvals for production!
      → Dismiss stale approvals: Yes
      → Require Code Owners review: Yes
      → Require conversation resolution: Yes
  ✅ Require status checks to pass
      → Add: vercel, build, lint (if available)
  ✅ Block force pushes
  ☐ Require linear history (optional)
```

---

## 🔑 Key Differences: Old vs New System

| Feature | Branch Protection (Old) | Rulesets (New) |
|---------|------------------------|----------------|
| Location | Settings → Branches | Settings → Rules → Rulesets |
| "Block pushes" | "Restrict who can push" | "Restrict updates" |
| Pattern matching | Basic | Advanced (regex support) |
| Apply to multiple branches | One rule per pattern | One ruleset, multiple patterns |
| Bypass permissions | User-based | Role/team-based |

---

## 📊 What Each Rule Does

### 🚫 **Restrict updates** (Most Important!)
- **What it does**: Blocks `git push origin dev`
- **Result**: Users MUST create a feature branch and PR
- **This is what prevents direct pushes** ⭐

### 🔒 **Restrict deletions**
- **What it does**: Prevents `git push origin :dev` (delete branch)
- **Result**: Branch can't be accidentally deleted

### 📝 **Require pull request before merging**
- **What it does**: All changes must go through a PR
- **Result**: Code review process enforced
- **Options**:
  - `0 approvals`: Can self-merge (solo dev)
  - `1+ approvals`: Need others to review (team)

### 🛡️ **Block force pushes**
- **What it does**: Prevents `git push --force`
- **Result**: History can't be rewritten

### ✅ **Require status checks**
- **What it does**: CI/CD must pass before merge
- **Result**: Build/tests must succeed
- **Note**: Only enable if you have CI/CD set up

---

## 🧪 Testing Your Ruleset

After creating the ruleset, test it:

```bash
# 1. Try to push directly to dev (should fail)
git checkout dev
git commit --allow-empty -m "test: checking protection"
git push origin dev

# Expected result: ❌ Error!
# "refusing to allow a GitHub App to create or update workflow"
# OR "protected branch update failed"

# 2. Correct workflow (should work)
git checkout -b feature/test-branch
git commit --allow-empty -m "test: via feature branch"
git push origin feature/test-branch
# Then create PR on GitHub
```

If step 1 fails with an error, **protection is working!** ✅

---

## 🆘 Troubleshooting

### "I can still push to dev"
- Check ruleset **Enforcement status** is "Active" (not "Evaluate")
- Verify **Target branches** includes `dev`
- Ensure **"Restrict updates"** is checked
- Check you're not in the bypass list

### "I can't merge my PR"
- If you require approvals, you need someone else to review
- OR change "Required approvals" to `0` for solo work
- Check if status checks are failing

### "Status checks are blocking me"
- Either fix the failing checks
- OR remove "Require status checks" if you don't have CI/CD
- Make sure the check names match exactly

### "I need to bypass for emergency"
- Add yourself to the "Bypass list"
- Push your emergency fix
- **Remove yourself from bypass list immediately after**

---

## 📝 Configuration Checklist

After setup, verify:

- [ ] ✅ Ruleset for `dev` created
- [ ] ✅ Ruleset for `main` created
- [ ] ✅ "Restrict updates" enabled (blocks direct pushes)
- [ ] ✅ "Require pull request" enabled
- [ ] ✅ "Block force pushes" enabled
- [ ] ✅ Target branches configured correctly
- [ ] ✅ Enforcement status is "Active"
- [ ] ✅ Tested: direct push is blocked
- [ ] ✅ Tested: PR workflow works

---

## 🎯 Recommended Settings

### Solo Developer:
```
☑️ Restrict updates
☑️ Restrict deletions
☑️ Require pull request (0 approvals)
☑️ Block force pushes
☐ Require status checks (if you have CI/CD)
```

### Small Team (2-5 people):
```
☑️ Restrict updates
☑️ Restrict deletions
☑️ Require pull request (1 approval)
    ☑️ Require Code Owners review
    ☑️ Require conversation resolution
☑️ Require status checks
☑️ Block force pushes
```

### Larger Team/Production:
```
☑️ Restrict updates
☑️ Restrict deletions
☑️ Require pull request (2+ approvals)
    ☑️ Dismiss stale approvals
    ☑️ Require Code Owners review
    ☑️ Require conversation resolution
    ☑️ Require approval of most recent push
☑️ Require status checks
☑️ Require deployments to succeed
☑️ Block force pushes
☑️ Require signed commits (optional)
☑️ Require linear history (optional)
```

---

## 🔗 Additional Resources

- **Old system guide**: [SETUP_BRANCH_PROTECTION.md](./SETUP_BRANCH_PROTECTION.md)
- **Workflow guide**: [BRANCH_PROTECTION_GUIDE.md](./BRANCH_PROTECTION_GUIDE.md)
- **PR template**: [PULL_REQUEST_TEMPLATE.md](./PULL_REQUEST_TEMPLATE.md)
- **GitHub Docs**: [About rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets)

---

## ✅ Quick Comparison: What You Need

| Your Goal | Enable This Rule | What It Does |
|-----------|------------------|--------------|
| Block direct pushes | **Restrict updates** ⭐ | Can't `git push origin dev` |
| Force PRs | **Require pull request** | Must create PR to merge |
| Require review | **Required approvals: 1+** | Someone must review |
| Prevent branch deletion | **Restrict deletions** | Can't delete branch |
| Block force push | **Block force pushes** | No `--force` allowed |
| Require CI/CD | **Require status checks** | Build must pass |

---

**TL;DR**: Enable **"Restrict updates"** + **"Require pull request"** = Problem solved! 🎉

That's the new way to block direct pushes in the Rulesets UI.

