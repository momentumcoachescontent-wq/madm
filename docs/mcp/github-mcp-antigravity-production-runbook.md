# GitHub MCP + Google Antigravity Production Runbook

This document outlines the secure, production-ready integration plan between GitHub, the GitHub MCP Server, and Google Antigravity (as the MCP host client). It is designed to ensure least privilege access and prevent secret leakage.

## 1. Architecture Overview

We support two primary integration modes. For **Google Antigravity users**, the **Local (npx)** method is required due to Docker restrictions. For other environments (e.g., local development machines), Docker is a viable alternative.

### Mode A: Local MCP (npx) - **Recommended for Antigravity**
- **Host:** Google Antigravity Environment (or local machine)
- **Runtime:** Node.js (`npx`)
- **Transport:** Stdio (Standard Input/Output)
- **Authentication:** `GITHUB_PERSONAL_ACCESS_TOKEN` passed via environment variable.
- **Why:** Bypasses Docker requirements in restricted environments like Antigravity.

### Mode B: Remote MCP (Copilot)
- **Host:** GitHub Copilot Managed Service
- **Endpoint:** `https://api.githubcopilot.com/mcp/`
- **Authentication:** GitHub Personal Access Token (PAT)
- **Why:** Zero local infrastructure; fully managed by GitHub.

## 2. Authentication Model

We adhere to a **Least Privilege** model.

*   **Credential Type:** **Fine-grained Personal Access Tokens (PATs)**.
    *   *Why:* Granular control over repository access and permissions compared to Classic PATs. Easier to rotate than machine user keys.
*   **Account:** Individual Developer Account (for personal use) or a dedicated Service Account (if available/approved by Org).
    *   *Recommendation:* Use your individual account for development/testing. Use a service account for CI/CD or shared automation if applicable.

## 3. GitHub Configuration (Manual Steps)

Before enabling the MCP server, ensure the target repositories are hardened.

### Organization & Repository Hardening Checklist
Apply these settings via the GitHub UI:

1.  **Branch Protection Rules (`main` / `release` branches):**
    *   [ ] Require a pull request before merging.
    *   [ ] Require approvals (minimum 1).
    *   [ ] Require status checks to pass before merging (e.g., `test`, `build`).
    *   [ ] Require conversation resolution before merging.
    *   [ ] *Optional:* Require signed commits.

2.  **Actions Security:**
    *   [ ] Restrict Actions to "Allow select actions and reusable workflows" (if possible).
    *   [ ] "Fork pull request workflows from outside collaborators" -> Require approval for all contributors.

3.  **Dependabot:**
    *   [ ] Enable Dependabot Alerts.
    *   [ ] Enable Dependabot Security Updates.

4.  **Secret Scanning:**
    *   [ ] Enable Secret Scanning (if available on the plan).
    *   [ ] Enable Push Protection.

## 4. Token Permissions (Least Privilege)

Construct your Fine-grained PAT with *only* the permissions required for your specific task.

| Toolset Capability | Required Repository Permissions | Scope |
| :--- | :--- | :--- |
| **Code Reading & Analysis** | `Contents: Read-only`, `Metadata: Read-only` | Target Repositories Only |
| **Issue Management** | `Issues: Read & Write` | Target Repositories Only |
| **Pull Request Mgmt** | `Pull Requests: Read & Write` | Target Repositories Only |
| **Actions Monitoring** | `Actions: Read-only` | Target Repositories Only |
| **Security Alerts** | `Code Scanning: Read-only`, `Dependabot Alerts: Read-only` | Target Repositories Only |

**Baseline Recommendation (Read-Only):**
*   **Repositories:** Select only the specific repos you are working on (e.g., `madm/madm`).
*   **Permissions:** `Contents: Read-only`, `Metadata: Read-only`.

**Write-Enabled Baseline:**
*   Add `Issues: Read & Write` and `Pull Requests: Read & Write` only if you intend to create/edit issues or PRs via MCP.

## 5. Token Storage & Rotation

**NEVER commit tokens to code.**

### Storage
*   **Antigravity / Local Dev:** Use environment variables.
    *   Export `GITHUB_PERSONAL_ACCESS_TOKEN` in your shell session or add to a `.env.local` file (which is git-ignored).
    *   VS Code MCP Config: Use `${input:github_mcp_pat}` to prompt for the token or read from a safe storage, never hardcode in `.vscode/mcp.json`.

### Rotation Plan
1.  **Cadence:** Rotate PATs every 30-90 days.
2.  **Procedure:**
    *   Generate a new Fine-grained PAT in GitHub Developer Settings.
    *   Update your local environment variable or secret store.
    *   Revoke the old PAT immediately after verifying the new one works.

## 6. MCP Configuration Examples

### A. Local MCP (npx) - Antigravity Compatible

Add this to your MCP client configuration (e.g., `.vscode/mcp.json` or VS Code `settings.json`):

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${input:github_mcp_pat}"
      }
    }
  }
}
```
*Note: `${input:github_mcp_pat}` implies the client supports input variables. If not, set the env var in your shell before launching the client, or use a secure credential manager.*

### B. Remote MCP (Copilot)

```json
{
  "mcpServers": {
    "github-remote": {
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer ${input:github_mcp_pat}"
      }
    }
  }
}
```

## 7. Operational Safeguards

*   **Read-Only First:** Always start with a Read-Only PAT. Upgrade to Write permissions only for specific tasks and revert afterwards if possible.
*   **PR-Based Workflow:** Do not use MCP to push directly to protected branches (`main`). Always work on feature branches and use Pull Requests.
*   **Audit Logging:** Periodically review your GitHub Personal Access Token usage log (in GitHub Settings) to verify no unauthorized access occurred.

## 8. Validation Steps

Perform these steps to verify the integration is working securely:

1.  **Configure MCP:** Set up the server using the "Read-Only Baseline" token.
2.  **List Resources:** Ask the MCP client to "List repositories in organization `madm`".
    *   *Expected:* Returns list of repos you selected in the PAT scope.
3.  **Read File:** Ask "Read `README.md` from repository `madm/madm`".
    *   *Expected:* Returns file content.
4.  **Write Attempt (Negative Test):** Ask "Create an issue in `madm/madm` titled 'Test'".
    *   *Expected:* **Permission Denied** error (since token is Read-Only).
5.  **Upgrade & Retry:** Generate a Write-enabled token, update config, and retry step 4.
    *   *Expected:* Issue created successfully.

## 9. Incident Response

**If a token is suspected to be leaked:**

1.  **Immediate Revocation:** Go to GitHub Settings > Developer Settings > Personal access tokens. Find the token and click **Revoke**.
2.  **Audit:** Check the "Last used" date and IP address (if available in audit logs) to see if it was used maliciously.
3.  **Rotate:** Generate a new token and update your secure storage.
4.  **Assess:** Check repository commits and settings for any unauthorized changes during the exposure window.

---

## Appendix: Manual Configuration Checklist

**Repository:** `madm/madm` (and others in list)

1.  [ ] **Settings > Branches:** Add branch protection rule for `main`.
    *   [ ] Check "Require a pull request before merging".
    *   [ ] Check "Require status checks to pass before merging".
2.  [ ] **Settings > Actions > General:**
    *   [ ] Select "Allow select actions and reusable workflows".
    *   [ ] Select "Read repository contents (read-only)" as the default.
    *   [ ] *Note:* Workflows needing write access must request elevated rights explicitly using the `permissions:` key in the workflow YAML.
3.  [ ] **Settings > Code security and analysis:**
    *   [ ] Enable "Dependabot alerts".
    *   [ ] Enable "Dependabot security updates".
    *   [ ] Enable "Secret scanning" (if available).
4.  [ ] **Settings > Secrets and variables > Actions:**
    *   [ ] Review existing secrets. Ensure no old/unused tokens are stored.
