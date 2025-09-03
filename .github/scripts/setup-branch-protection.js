#!/usr/bin/env node

/**
 * Branch Protection Setup Script
 * 
 * This script configures branch protection rules for the repository based on the bot configuration.
 * It should be run by a repository administrator to set up the initial protection rules.
 * 
 * Usage:
 *   node .github/scripts/setup-branch-protection.js
 * 
 * Environment Variables:
 *   GITHUB_TOKEN - GitHub Personal Access Token with repo permissions
 *   GITHUB_REPOSITORY - Repository in format "owner/repo" (auto-set in GitHub Actions)
 */

const { Octokit } = require('@octokit/rest');
const yaml = require('js-yaml');
const fs = require('fs');

async function setupBranchProtection() {
  try {
    // Validate environment
    const token = process.env.GITHUB_TOKEN;
    const repository = process.env.GITHUB_REPOSITORY;
    
    if (!token) {
      throw new Error('GITHUB_TOKEN environment variable is required');
    }
    
    if (!repository) {
      throw new Error('GITHUB_REPOSITORY environment variable is required');
    }

    const [owner, repo] = repository.split('/');
    
    console.log(`Setting up branch protection for ${owner}/${repo}...`);
    
    // Initialize Octokit
    const octokit = new Octokit({ auth: token });
    
    // Load bot configuration
    console.log('Loading bot configuration...');
    const configPath = '.github/bot-config.yml';
    
    if (!fs.existsSync(configPath)) {
      throw new Error(`Bot configuration file not found: ${configPath}`);
    }
    
    const configContent = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(configContent);
    
    if (!config.bot_config) {
      throw new Error('Invalid configuration: bot_config section not found');
    }
    
    const botConfig = config.bot_config;
    console.log('✅ Bot configuration loaded');
    
    // Get protected branches from configuration
    const protectedBranches = botConfig.branch_protection?.protected_branches || ['main'];
    console.log(`Protected branches: ${protectedBranches.join(', ')}`);
    
    // Get list of existing branches
    console.log('Fetching repository branches...');
    const branches = await octokit.rest.repos.listBranches({
      owner,
      repo
    });
    
    const existingBranches = branches.data.map(branch => branch.name);
    console.log(`Found branches: ${existingBranches.join(', ')}`);
    
    // Filter protected branches to only those that exist (handle wildcards later)
    const branchesToProtect = protectedBranches.filter(pattern => {
      if (pattern.includes('*')) {
        // Simple wildcard matching
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return existingBranches.some(branch => regex.test(branch));
      }
      return existingBranches.includes(pattern);
    });
    
    if (branchesToProtect.length === 0) {
      console.log('⚠️  No matching branches found to protect');
      return;
    }
    
    console.log(`Branches to protect: ${branchesToProtect.join(', ')}`);
    
    // Configure branch protection for each branch
    for (const branch of branchesToProtect) {
      console.log(`\n🔒 Setting up protection for branch: ${branch}`);
      
      try {
        const protectionSettings = {
          owner,
          repo,
          branch,
          required_status_checks: null,
          enforce_admins: false, // Allow admins to bypass (they can manage the bot config)
          required_pull_request_reviews: {
            required_approving_review_count: botConfig.merge?.required_approvals || 1,
            dismiss_stale_reviews: botConfig.branch_protection?.dismiss_stale_reviews ?? true,
            restrict_dismissals: false,
            require_code_owner_reviews: false
          },
          restrictions: null // No push restrictions - bot needs to be able to merge
        };
        
        // Add status checks if configured
        if (botConfig.merge?.require_status_checks && botConfig.merge?.required_status_checks?.length > 0) {
          protectionSettings.required_status_checks = {
            strict: botConfig.branch_protection?.require_up_to_date_branches ?? true,
            contexts: botConfig.merge.required_status_checks
          };
        }
        
        // Apply linear history requirement if configured
        if (botConfig.branch_protection?.require_linear_history) {
          protectionSettings.required_linear_history = true;
        }
        
        // Configure force push and deletion settings
        protectionSettings.allow_force_pushes = botConfig.branch_protection?.allow_force_pushes ?? false;
        protectionSettings.allow_deletions = botConfig.branch_protection?.allow_deletions ?? false;
        
        await octokit.rest.repos.updateBranchProtection(protectionSettings);
        
        console.log(`✅ Branch protection configured for: ${branch}`);
        console.log(`   - Required approvals: ${protectionSettings.required_pull_request_reviews.required_approving_review_count}`);
        console.log(`   - Dismiss stale reviews: ${protectionSettings.required_pull_request_reviews.dismiss_stale_reviews}`);
        console.log(`   - Allow force pushes: ${protectionSettings.allow_force_pushes}`);
        console.log(`   - Allow deletions: ${protectionSettings.allow_deletions}`);
        
        if (protectionSettings.required_status_checks) {
          console.log(`   - Required status checks: ${protectionSettings.required_status_checks.contexts.join(', ')}`);
          console.log(`   - Require up-to-date: ${protectionSettings.required_status_checks.strict}`);
        }
        
      } catch (error) {
        if (error.status === 404) {
          console.log(`❌ Branch not found: ${branch}`);
        } else if (error.status === 403) {
          console.log(`❌ Permission denied for branch: ${branch}`);
          console.log('   Make sure you have admin permissions on this repository');
        } else {
          console.log(`❌ Failed to protect branch ${branch}:`, error.message);
        }
      }
    }
    
    // Configure repository settings
    console.log('\n⚙️  Configuring repository settings...');
    
    try {
      const repoSettings = {
        owner,
        repo,
        // Allow squash merging (commonly used)
        allow_squash_merge: true,
        // Allow merge commits
        allow_merge_commit: true,
        // Allow rebase merging
        allow_rebase_merge: true,
        // Auto-delete head branches after merge
        delete_branch_on_merge: botConfig.merge?.delete_branch_after_merge ?? true
      };
      
      await octokit.rest.repos.update(repoSettings);
      console.log('✅ Repository settings updated');
      
    } catch (error) {
      console.log('⚠️  Could not update repository settings:', error.message);
    }
    
    // Create required labels if they don't exist
    console.log('\n🏷️  Setting up required labels...');
    
    const labelsToCreate = [
      ...(botConfig.triggers?.auto_merge_labels || []),
      ...(botConfig.triggers?.skip_labels || [])
    ].filter((label, index, arr) => arr.indexOf(label) === index); // Remove duplicates
    
    if (labelsToCreate.length > 0) {
      const existingLabels = await octokit.rest.issues.listLabelsForRepo({
        owner,
        repo
      });
      
      const existingLabelNames = existingLabels.data.map(label => label.name);
      
      for (const labelName of labelsToCreate) {
        if (!existingLabelNames.includes(labelName)) {
          try {
            // Determine label color based on type
            let color = '0E8A16'; // Green for auto-merge
            if (botConfig.triggers?.skip_labels?.includes(labelName)) {
              color = 'D93F0B'; // Red for skip labels
            }
            
            await octokit.rest.issues.createLabel({
              owner,
              repo,
              name: labelName,
              color,
              description: `Automatically managed label for PR merge bot`
            });
            
            console.log(`✅ Created label: ${labelName}`);
            
          } catch (error) {
            console.log(`⚠️  Could not create label ${labelName}:`, error.message);
          }
        } else {
          console.log(`✅ Label already exists: ${labelName}`);
        }
      }
    }
    
    console.log('\n🎉 Branch protection setup completed!');
    console.log('\nNext steps:');
    console.log('1. Verify that the GitHub Actions have the necessary permissions');
    console.log('2. Test the bot by creating a PR and checking if it gets auto-merged');
    console.log('3. Monitor the bot logs in the Actions tab');
    console.log('4. Adjust the configuration in .github/bot-config.yml as needed');
    
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

// Check if running as main script
if (require.main === module) {
  // Install required packages if not available
  try {
    require('@octokit/rest');
    require('js-yaml');
  } catch (error) {
    console.log('Installing required dependencies...');
    const { execSync } = require('child_process');
    execSync('npm install @octokit/rest js-yaml', { stdio: 'inherit' });
  }
  
  setupBranchProtection().catch(error => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  });
}

module.exports = { setupBranchProtection };

