# PR Merge Bot Documentation

## Overview

This repository is configured with an automated PR merge bot that can automatically merge pull requests based on configurable rules. The bot eliminates the need for manual PR merging while ensuring all quality gates are met.

## 🚀 Quick Start

### For Repository Administrators

1. **Initial Setup**
   ```bash
   # Run the branch protection setup workflow
   # Go to Actions → Setup Branch Protection → Run workflow
   ```

2. **Test the Bot**
   - Create a test PR
   - Get the required approvals
   - Add the `auto-merge` label (if configured)
   - Watch the bot automatically merge your PR

### For Contributors

1. **Create a PR as usual**
2. **Get required approvals** (default: 1 approval)
3. **Ensure status checks pass**
4. **Add auto-merge label** (if configured): `auto-merge` or `ready-to-merge`
5. **Wait for automatic merge** (bot checks every 15 minutes)

## ⚙️ Configuration

The bot behavior is controlled by the `.github/bot-config.yml` file. Users can modify bot rules by submitting PRs that update this configuration file.

### Key Configuration Sections

#### Basic Settings
```yaml
bot_config:
  bot_name: "pr-merge-bot"
  enabled: true  # Turn bot on/off
```

#### Merge Requirements
```yaml
merge:
  required_approvals: 1                    # Minimum approvals needed
  require_conversation_resolution: true     # All conversations resolved
  require_status_checks: true              # Status checks must pass
  required_status_checks:                  # Specific checks required
    - "ci/tests"
    - "ci/lint"
  merge_method: "squash"                   # merge, squash, or rebase
  delete_branch_after_merge: true          # Clean up after merge
```

#### Triggers and Labels
```yaml
triggers:
  auto_merge_labels:                       # Labels that trigger auto-merge
    - "auto-merge"
    - "ready-to-merge"
  skip_labels:                             # Labels that prevent auto-merge
    - "work-in-progress"
    - "do-not-merge"
    - "needs-manual-review"
  merge_drafts: false                      # Don't auto-merge drafts
```

#### Time and Size Limits
```yaml
timing:
  allowed_hours:                           # Business hours only
    start: 9   # 9 AM
    end: 17    # 5 PM
  allowed_days: [1, 2, 3, 4, 5]          # Monday-Friday
  min_open_time_minutes: 30               # PR must be open for 30+ minutes

limits:
  max_changed_files: 50                   # Maximum files changed
  max_lines_changed: 1000                 # Maximum lines changed
```

## 🛡️ Security Features

### Branch Protection
- **Automatic setup**: Configures GitHub branch protection rules
- **Required reviews**: Enforces minimum approval requirements
- **Status checks**: Ensures CI/CD passes before merge
- **Up-to-date branches**: Requires branches to be current

### File Restrictions
```yaml
file_restrictions:
  sensitive_files:                        # Files requiring extra approval
    - ".github/workflows/*"
    - ".github/bot-config.yml"
    - "package.json"
  sensitive_files_additional_approvals: 1
  blocked_paths:                          # Paths requiring manual merge
    - ".github/bot-config.yml"
    - "security/*"
```

### Permissions
```yaml
permissions:
  bypass_users: []                        # Users who can bypass protection
  config_editors:                         # Who can edit bot config
    - "repo-admins"
  min_approval_role: "write"              # Minimum role to approve PRs
```

## 🔄 Workflows

The bot system includes several GitHub Actions workflows:

### 1. `auto-merge-pr.yml` - Main Bot Logic
- **Trigger**: PR events, reviews, status changes, scheduled (every 15 min)
- **Purpose**: Evaluates and merges eligible PRs
- **Permissions**: `contents: write`, `pull-requests: write`

### 2. `validate-bot-config.yml` - Configuration Validation
- **Trigger**: PRs that modify `.github/bot-config.yml`
- **Purpose**: Validates configuration changes
- **Features**: Schema validation, security checks, generates reports

### 3. `setup-branch-protection.yml` - Initial Setup
- **Trigger**: Manual dispatch
- **Purpose**: Configures branch protection rules
- **Permissions**: `administration: write`

## 📋 Usage Examples

### Standard Workflow
1. Create PR
2. Get 1+ approvals
3. Ensure CI passes
4. Add `auto-merge` label
5. Bot merges automatically

### Emergency Bypass
1. Add `do-not-merge` label to prevent auto-merge
2. Handle manually when ready

### Configuration Change
1. Edit `.github/bot-config.yml`
2. Create PR (triggers validation workflow)
3. Get required approvals (may need extra for config changes)
4. Merge manually (config changes often blocked from auto-merge)

## 🔍 Monitoring and Troubleshooting

### Check Bot Status
- Go to **Actions** tab
- Look for "Automated PR Merge Bot" workflow runs
- Check logs for detailed evaluation of each PR

### Common Issues

#### PR Not Auto-Merging
Check if:
- [ ] Required approvals met
- [ ] No "skip" labels present
- [ ] Status checks passing
- [ ] Within allowed time windows
- [ ] PR not too large or too many files changed
- [ ] Auto-merge label present (if required)

#### Bot Disabled
- Check `bot_config.enabled: true` in configuration
- Verify workflow files are present and valid
- Check repository permissions

#### Permission Errors
- Ensure `GITHUB_TOKEN` has necessary permissions
- Check if repository requires admin approval for workflow changes
- Verify branch protection settings don't conflict

### Debug Commands
```bash
# Check current configuration
yq '.bot_config' .github/bot-config.yml

# Validate configuration locally
node .github/scripts/validate-config.js

# Test branch protection setup (dry run)
DRY_RUN=true node .github/scripts/setup-branch-protection.js
```

## 🔧 Advanced Configuration

### Webhook Notifications
```yaml
notifications:
  notify_on_merge: true
  notify_on_failure: true
  slack_webhook: "https://hooks.slack.com/services/..."
  teams_webhook: "https://outlook.office.com/webhook/..."
```

### Trusted Users (Skip Some Checks)
```yaml
triggers:
  trusted_users:
    - "lead-developer"
    - "release-manager"
```

### Complex Time Rules
```yaml
timing:
  allowed_hours: { start: 9, end: 17 }    # Business hours
  allowed_days: [1, 2, 3, 4]              # Mon-Thu only
  timezone: "America/New_York"             # Timezone for rules
  min_open_time_minutes: 60               # 1 hour minimum
```

## 🆘 Emergency Procedures

### Disable Bot Immediately
```yaml
# Edit .github/bot-config.yml
bot_config:
  enabled: false  # Disables all auto-merge activity
```

### Override for Critical Fix
1. Add label: `do-not-merge`
2. Handle manually
3. Remove label when ready for normal processing

### Bypass Protection (Admin Only)
- Repository admins can force-merge if absolutely necessary
- Use GitHub web interface "Merge without waiting for requirements"

## 📊 Metrics and Reporting

The bot provides insights through:
- **Workflow run logs**: Detailed evaluation of each PR
- **PR comments**: Validation reports for configuration changes
- **GitHub Actions summary**: Overview of bot activity

## 🔄 Migration and Updates

### Updating Configuration
1. Edit `.github/bot-config.yml`
2. Create PR (validation workflow runs automatically)
3. Review validation report in PR comments
4. Get approvals and merge

### Bot Version Updates
- Bot logic is embedded in workflow files
- Update by modifying `.github/workflows/*.yml` files
- Test changes thoroughly in a fork first

### Schema Changes
- Update `validate-bot-config.yml` with new schema
- Increment `config_version` in bot-config.yml
- Add migration logic if needed

## 🤝 Contributing

### Modifying Bot Behavior
1. Fork repository
2. Make changes to workflow files
3. Test thoroughly
4. Submit PR with detailed description

### Reporting Issues
- Check existing workflow runs for errors
- Include configuration and error logs
- Describe expected vs. actual behavior

## 📚 Additional Resources

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Octokit REST API Documentation](https://octokit.github.io/rest.js/)
- [YAML Syntax Reference](https://yaml.org/spec/1.2.2/)

## 🏷️ Default Labels

The bot automatically creates these labels if they don't exist:

| Label | Color | Purpose |
|-------|-------|---------|
| `auto-merge` | Green | Triggers automatic merging |
| `ready-to-merge` | Green | Alternative auto-merge trigger |
| `work-in-progress` | Red | Prevents auto-merge |
| `do-not-merge` | Red | Prevents auto-merge |
| `needs-manual-review` | Red | Requires manual attention |

---

**Last Updated**: 2024-12-28  
**Bot Version**: 1.0.0  
**Configuration Version**: 1.0.0

