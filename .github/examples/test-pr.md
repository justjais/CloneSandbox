# Test PR Example

This file demonstrates how to test the PR merge bot functionality.

## Creating a Test PR

1. **Make a simple change** to this file
2. **Create a PR** with a clear title
3. **Get the required approvals** (check `.github/bot-config.yml` for count)
4. **Add the auto-merge label** (default: `auto-merge`)
5. **Wait for the bot** to automatically merge your PR

## Test Scenarios

### Scenario 1: Basic Auto-Merge
- Edit this file (add your name below)
- Create PR with title: "Test: Add name to test file"
- Add label: `auto-merge`
- Get 1 approval
- Bot should merge automatically

### Scenario 2: Skip Auto-Merge
- Make any change
- Add label: `do-not-merge`
- Bot should skip this PR even with approvals

### Scenario 3: Work in Progress
- Create draft PR or add `work-in-progress` label
- Bot should ignore until ready

## Test Contributors

Add your name here to test the bot:

- Bot Test User (example)
- <!-- Add your name above this line -->

## Bot Status Checks

The bot evaluates these criteria (configurable in `.github/bot-config.yml`):

- ✅ Required approvals received
- ✅ All status checks passing  
- ✅ No blocking labels present
- ✅ Within allowed time window
- ✅ File/line change limits respected
- ✅ Auto-merge label present (if required)
- ✅ PR not a draft
- ✅ Branch up-to-date (if required)

## Common Test Commands

```bash
# Check current bot configuration
yq '.bot_config' .github/bot-config.yml

# See protected branches
yq '.bot_config.branch_protection.protected_branches' .github/bot-config.yml

# Check required approvals
yq '.bot_config.merge.required_approvals' .github/bot-config.yml

# Check auto-merge labels
yq '.bot_config.triggers.auto_merge_labels' .github/bot-config.yml
```

## Expected Bot Behavior

1. **PR Created**: Bot ignores (waits for approvals)
2. **Approval Added**: Bot evaluates but waits for label
3. **Auto-merge Label Added**: Bot queues for merge on next run (every 15 min)
4. **Bot Run**: Evaluates all criteria and merges if met
5. **Post-Merge**: Deletes branch (if configured), sends notifications

## Troubleshooting Test Issues

If the bot doesn't merge your test PR:

1. **Check the Actions tab** for bot workflow runs
2. **Look for evaluation logs** showing why PR was skipped
3. **Verify all requirements** are met (approvals, labels, checks)
4. **Ensure bot is enabled** in configuration
5. **Check time restrictions** (business hours, days)

---

*This file is safe to edit for testing purposes. Changes here won't affect bot functionality.*

