# Remove Claude Attribution from Git History

This guide will help you remove all Claude AI attribution from your Git commit history and prevent it from happening again in future.

## 🎯 What This Does

- Removes "Co-Authored-By: Claude" from all commits
- Removes "🤖 Generated with Claude Code" messages
- Keeps only your name as the author
- Prevents Claude from adding attribution in future commits

---

## 📋 Prerequisites

Before starting:
- ✅ Take a full backup of your project
- ✅ Make sure no one else has cloned the repository
- ✅ Close all open files in your IDE
- ✅ Have Python installed (for git-filter-repo)

---

## Part 1: Remove Existing Attribution from History

### Step 1: Install git-filter-repo

```bash
pip install git-filter-repo
```

### Step 2: Navigate to your project and check status

```bash
cd path/to/your/project
git status
```

### Step 3: Commit any uncommitted changes (if needed)

```bash
git add .
git commit -m "Save current work before history rewrite"
```

### Step 4: Check your Git config

```bash
git config user.name
git config user.email
git remote get-url origin
```

**Note down these values - you'll need them!**

### Step 5: Run git-filter-repo to remove attribution

```bash
git filter-repo --force --message-callback 'return message.replace(b"\n\nCo-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>", b"").replace(b"\nCo-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>", b"").replace(b"\n\nCo-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>", b"").replace(b"\nCo-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>", b"").replace(b"\n\n\360\237\244\226 Generated with [Claude Code](https://claude.com/claude-code)\n", b"\n").replace(b"\n\360\237\244\226 Generated with [Claude Code](https://claude.com/claude-code)", b"")'
```

**What this does:**
- Removes "Co-Authored-By: Claude Opus 4.5"
- Removes "Co-Authored-By: Claude Sonnet 4.5"
- Removes "🤖 Generated with Claude Code" links
- Keeps your commit messages intact

### Step 6: Add remote back

```bash
git remote add origin YOUR_GITHUB_URL_HERE
```

Replace `YOUR_GITHUB_URL_HERE` with your actual repository URL from Step 4.

Example:
```bash
git remote add origin https://github.com/username/project-name.git
```

### Step 7: Force push to GitHub

```bash
git push origin --force --all
git push origin --force --tags
```

### Step 8: Verify Claude is removed

```bash
# Check for any remaining Claude attribution
git log --all --format='%B' | grep -i "Co-Authored-By.*claude"

# Should return nothing if successful
```

---

## Part 2: Prevent Future Attribution

### Add Git Policy to CLAUDE.md

Create or edit `CLAUDE.md` in your project root and add this section:

```markdown
## Git Commit Policy

**CRITICAL:** When creating git commits:
- NEVER add "Co-Authored-By: Claude" or any AI attribution
- NEVER add "Generated with Claude Code" or similar messages
- Only use the project owner's name and email (from git config)
- Keep commit messages clean and professional
```

### Alternative: Add to existing CLAUDE.md

If you already have a `CLAUDE.md` file, add the above section anywhere in the file. Claude will automatically read and follow these instructions in every session.

### Commit the change

```bash
git add CLAUDE.md
git commit -m "Add git commit policy to prevent AI attribution"
git push
```

---

## ✅ Success Checklist

- [ ] git-filter-repo ran successfully
- [ ] Force push completed without errors
- [ ] Verification shows no Claude attribution
- [ ] CLAUDE.md updated with Git Commit Policy
- [ ] Policy committed and pushed to GitHub
- [ ] Check GitHub repository - contributor graph should only show you

---

## 🚨 Important Notes

### After Force Push:

1. **If you have other clones of this repository:**
   - Delete them and re-clone from GitHub
   - Or run: `git fetch origin && git reset --hard origin/main`

2. **If others have cloned this repository:**
   - They need to delete their local copy and re-clone
   - Or run: `git fetch origin && git reset --hard origin/main`

3. **Check GitHub:**
   - Go to your repository on GitHub
   - Check the contributor graph - should only show your name
   - Check recent commits - no Claude attribution

### Troubleshooting:

**Problem:** `git-filter-repo` not found
- **Solution:** Make sure Python Scripts folder is in PATH
- Or use: `python -m git_filter_repo` instead of `git filter-repo`

**Problem:** Remote already exists
- **Solution:** Run `git remote remove origin` then add it again

**Problem:** Force push rejected
- **Solution:** Check repository settings on GitHub for branch protection rules

---

## 📝 Quick Summary

```bash
# 1. Install
pip install git-filter-repo

# 2. Check status
cd your-project
git status
git config user.name
git config user.email
git remote get-url origin

# 3. Run cleanup (copy the full command from Step 5)
git filter-repo --force --message-callback '...'

# 4. Re-add remote
git remote add origin YOUR_URL

# 5. Force push
git push origin --force --all
git push origin --force --tags

# 6. Verify
git log --all --format='%B' | grep -i "Co-Authored-By.*claude"

# 7. Add policy to CLAUDE.md
# (Edit CLAUDE.md manually)

# 8. Commit policy
git add CLAUDE.md
git commit -m "Add git commit policy to prevent AI attribution"
git push
```

---

## 🎉 Done!

Your Git history is now clean, and Claude won't add attribution in future commits!

**Remember:** Keep a backup of your project just in case you need to revert anything.

---

## 📚 Additional Resources

- [git-filter-repo Documentation](https://github.com/newren/git-filter-repo)
- [Git Force Push Guide](https://git-scm.com/docs/git-push#Documentation/git-push.txt---force)
- [CLAUDE.md Best Practices](https://github.com/anthropics/claude-code)
