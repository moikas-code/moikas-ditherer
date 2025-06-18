#!/usr/bin/env bun

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const package_json_path = path.join(__dirname, '..', 'package.json');
const package_json = JSON.parse(fs.readFileSync(package_json_path, 'utf8'));

const current_version = package_json.version;
const tag_name = `v${current_version}`;

console.log(`📦 Creating production release for Moi Dither ${tag_name}`);

try {
  // Check if tag already exists
  try {
    execSync(`git rev-parse ${tag_name}`, { stdio: 'ignore' });
    console.error(`❌ Tag ${tag_name} already exists!`);
    console.log('💡 Update the version in package.json first');
    process.exit(1);
  } catch (e) {
    // Tag doesn't exist, which is good
  }

  // Check for uncommitted changes
  const status = execSync('git status --porcelain').toString();
  if (status.trim()) {
    console.error('❌ You have uncommitted changes!');
    console.log('💡 Commit or stash your changes before creating a release');
    process.exit(1);
  }

  // Create and push tag
  console.log(`🏷️  Creating tag ${tag_name}...`);
  execSync(`git tag -a ${tag_name} -m "Release ${tag_name}"`, { stdio: 'inherit' });
  
  console.log('📤 Pushing tag to remote...');
  execSync(`git push origin ${tag_name}`, { stdio: 'inherit' });
  
  console.log(`✅ Successfully created release ${tag_name}!`);
  console.log('🚀 GitHub Actions will now build and publish the release');
  console.log(`📎 Check progress at: https://github.com/${get_repo_name()}/actions`);
  
} catch (error) {
  console.error('❌ Failed to create release:', error.message);
  process.exit(1);
}

function get_repo_name() {
  try {
    const remote_url = execSync('git config --get remote.origin.url').toString().trim();
    const match = remote_url.match(/github\.com[:/](.+?)(?:\.git)?$/);
    return match ? match[1] : 'your-repo';
  } catch (e) {
    return 'your-repo';
  }
}