#!/usr/bin/env node
const axios = require('axios');

(async function() {
  try {
    const {
      GITHUB_TOKEN,
      JIRA_USER,
      JIRA_API_TOKEN,
      JIRA_BASE_URL,
      PR_NUMBER,
      REPO,
      ISSUE_KEY
    } = process.env;

    // Validate environment variables
    if (!GITHUB_TOKEN || !JIRA_USER || !JIRA_API_TOKEN || !JIRA_BASE_URL || !PR_NUMBER || !REPO || !ISSUE_KEY) {
      console.error('Missing required environment variables.');
      process.exit(1);
    }

    // 1. Fetch Jira issue details
    // Jira API: GET /rest/api/3/issue/{issueIdOrKey}
    const jiraIssueUrl = `${JIRA_BASE_URL}/rest/api/3/issue/${ISSUE_KEY}`;

    const jiraResponse = await axios.get(jiraIssueUrl, {
      auth: {
        username: JIRA_USER,
        password: JIRA_API_TOKEN
      },
      headers: {
        'Accept': 'application/json'
      }
    });

    const issueData = jiraResponse.data;
    const fields = issueData.fields;

    // Extract fields for PR
    const prTitle = fields.summary || `Update related to ${ISSUE_KEY}`;
    // You can enrich PR body with more details from the Jira description and root cause if available.
    // const prDescriptionParts = [
    //   // `## JIRA`
      
    //   //   `[MAIN_JIRA]:[${ISSUE_KEY}](${JIRA_BASE_URL}/browse/${ISSUE_KEY})`

    //   // `* [Main JIRA ticket][MAIN_JIRA]`,
    //   // '',
    //   `**Code reviewers**:`,
    //   '',
    //   `[] @ranjan`,
    //   '',
    //   `**Jira Issue**: [${ISSUE_KEY}](${JIRA_BASE_URL}/browse/${ISSUE_KEY})`,
    //   '',
    //   `**Summary**: ${fields.summary}`,
    //   '',
    //   `**Description**:`,
    //   `${fields.description?.content?.map(block => block.content?.map(c => c.text).join(' ')).join('\n') || 'No description provided.'}`,
    //   '',
    //   `**Root Cause Summary**: ${fields.customfield_10022 || 'Not provided'}`
    // ];

    const prDescriptionParts = [
  `## JIRA`,
  `[MAIN_JIRA]: ${JIRA_BASE_URL}/browse/${ISSUE_KEY}`,
  ``,
  `* [Main JIRA ticket][MAIN_JIRA]`,
  ``,
  `## Code reviewers`,
  `- [x] @akshay-coupa`,
  `- [x] @prachisrivastava-coupa`,
  ``,
  `## Summary of issue:`,
  `${fields.summary}`,
  ``,
  `${fields.description?.content?.map(block => block.content?.map(c => c.text).join(' ')).join('\n') || 'No description provided.'}`,
  ``, 
  `## Root Cause Summary:`,
  ``,
  `${fields.customfield_10022 || 'Not provided'}`,
  ``, 
  `## Summary of change:`,
  ``,
  `## Testing approach:`,
  `Rspec`,
  ``,
  `## Select which Feature Test set to run:`,
  `- [x] Speculator tests`,
  `- [x] Component tests`,
  `- [ ] No tests`,
  ``,
  `## Useful Links`,
  `<details>`,
  `<summary>Show links</summary>`,
  `* [Code Review Checklists 1](https://stackoverflowteams.com/c/coupa/articles/2518)`,
  `* [Code Review Checklists 2](https://coupadev.atlassian.net/wiki/display/CD/Code+Review+Checklist)`,
  `</details>`,
  ``,
];

    const prBody = prDescriptionParts.join('\n');

    // 2. Update the GitHub PR
    const githubApiUrl = `https://api.github.com/repos/${REPO}/pulls/${PR_NUMBER}`;

    await axios.patch(githubApiUrl,
      {
        title: prTitle,
        body: prBody
      },
      {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    console.log(`PR #${PR_NUMBER} updated successfully with Jira details.`);
  } catch (error) {
    console.error('Error updating PR:', error.message);
    console.error(error.response?.data || error);
    process.exit(1);
  }
})();
