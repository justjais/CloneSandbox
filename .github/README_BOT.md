# Automated PR Merge Bot

This repository is equipped with an intelligent PR merge bot that automatically merges pull requests when they meet configured criteria.

## 🤖 Bot Features

- **Automated Merging**: No more manual PR merges
- **Configurable Rules**: Customize merge criteria via `.github/bot-config.yml`
- **Security First**: Enforces approvals, status checks, and branch protection
- **Time-Based Controls**: Restrict merges to business hours/days
- **Size Limits**: Prevent auto-merge of oversized changes
- **Label-Based Triggers**: Use labels to control merge behavior
- **Notification Support**: Slack/Teams webhooks for merge events

## 🚀 Quick Start

### For Contributors
1. Create your PR normally
2. Get required approvals (default: 1)
3. Ensure all status checks pass
4. Add the `auto-merge` label
5. Wait for automatic merge (checks every 15 minutes)

### For Maintainers
- Modify bot rules by editing `.github/bot-config.yml`
- Changes require PR review and approval
- Run "Setup Branch Protection" workflow for initial setup

## 📋 Default Settings

- **Required Approvals**: 1
- **Merge Method**: Squash and merge
- **Auto-Delete Branches**: Yes
- **Business Hours Only**: 9 AM - 5 PM UTC, Mon-Fri
- **Size Limits**: Max 50 files, 1000 lines changed

## 🏷️ Bot Labels

| Label | Effect |
|-------|--------|
| `auto-merge` | Triggers automatic merging |
| `do-not-merge` | Prevents automatic merging |
| `work-in-progress` | Skips auto-merge evaluation |

## 🔧 Configuration

Edit `.github/bot-config.yml` to customize:

```yaml
bot_config:
  enabled: true
  merge:
    required_approvals: 1
    merge_method: "squash"
  triggers:
    auto_merge_labels: ["auto-merge", "ready-to-merge"]
    skip_labels: ["do-not-merge", "work-in-progress"]
```

## 📖 Full Documentation

For complete setup instructions, troubleshooting, and advanced configuration:

👉 **[Read the Complete Bot Documentation](/PR_MERGE_BOT.md)**

## 🆘 Emergency Controls

- **Disable Bot**: Set `enabled: false` in bot-config.yml
- **Skip Auto-merge**: Add `do-not-merge` label to any PR
- **Force Merge**: Repository admins can always merge manually

## 🔍 Monitoring

- Check the **Actions** tab for bot activity logs
- Look for "Automated PR Merge Bot" workflow runs
- PRs get detailed evaluation comments when rules change

---

**Need help?** See the [detailed documentation](.github/PR_MERGE_BOT.md) or check recent workflow runs in the Actions tab.

