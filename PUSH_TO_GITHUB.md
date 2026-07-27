# How to Push Changes to Your Own GitHub Repository

Your commit was successful locally (`git commit -m "project setup for aws"`).
`git push` failed because `origin` currently points to the original author's repository (`Piyush-Singh-coder/loan-management-system`), which requires write permissions.

Follow these 3 quick steps to push to your own GitHub account:

### Step 1: Create a Repository on GitHub
1. Go to [https://github.com/new](https://github.com/new)
2. **Repository name**: `loan-management-system`
3. Click **Create repository** (do NOT add README or .gitignore).

### Step 2: Update Remote URL in Terminal
Run this in your project folder (`C:\Users\Dell\OneDrive\Desktop\loan-management-system`):

```bash
git remote set-url origin https://github.com/<YOUR-GITHUB-USERNAME>/loan-management-system.git
```
*(Replace `<YOUR-GITHUB-USERNAME>` with your actual GitHub username).*

### Step 3: Push to Your Repository
```bash
git push -u origin main
```
