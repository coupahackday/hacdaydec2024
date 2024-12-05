#!/usr/bin/env node
const axios = require('axios');

(async function() {
  try {
    const {
      JIRA_USER,
      JIRA_API_TOKEN,
      JIRA_BASE_URL,
      ISSUE_KEY
    } = process.env;

    // Suppose you want to add the root cause summary to Jira issue:
    // Update the custom field with a known ID (replace `customfield_10022` with the correct field ID)
    // The value could come from some logic or static text. Adjust as needed.
    const updatePayload = {
      fields: {
        customfield_10022: "Root cause: Detailed explanation goes here."
      }
    };

    const jiraIssueUrl = `${JIRA_BASE_URL}/rest/api/3/issue/${ISSUE_KEY}`;
    await axios.put(jiraIssueUrl, updatePayload, {
      auth: {
        username: JIRA_USER,
        password: JIRA_API_TOKEN
      },
      headers: { 'Content-Type': 'application/json' }
    });

    console.log(`Jira ticket ${ISSUE_KEY} updated with root cause summary.`);
  } catch (error) {
    console.error('Error updating Jira ticket:', error.message);
    console.error(error.response?.data || error);
    process.exit(1);
  }
})();
