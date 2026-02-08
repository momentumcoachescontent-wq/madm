# GitHub MCP Server Configuration (Without Docker)

## Issue
When trying to configure the GitHub MCP server, you may encounter the following error:

```text
Error: exec: "docker": executable file not found in $PATH.
```

This error occurs because the environment you are running in (e.g., Google Antigravity) does not have Docker installed or accessible in the `PATH`.

## Solution: Use `npx` (Node.js)

Instead of running the MCP server as a Docker container, you can run it directly using Node.js via `npx`. This method requires Node.js to be installed (which is standard in most development environments) but does not require Docker.

### Configuration

Update your MCP server configuration with the following details:

| Setting | Value |
| :--- | :--- |
| **Command** | `npx` |
| **Arguments** | `-y`, `@modelcontextprotocol/server-github` |
| **Environment Variables** | `GITHUB_PERSONAL_ACCESS_TOKEN=<your_token>` |

### JSON Configuration Example

If you are configuring this via a JSON file (e.g., `mcp-config.json` or similar), it would look like this:

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
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

## Prerequisites

### 1. GitHub Personal Access Token (PAT)

You need a GitHub Personal Access Token to authenticate.

1.  Go to **GitHub Settings** > **Developer settings** > **Personal access tokens** > **Tokens (classic)**.
2.  Click **Generate new token (classic)**.
3.  Give it a name (e.g., "MCP Server").
4.  Select the following scopes:
    *   `repo` (Full control of private repositories)
    *   `user` (Update all user data) - *Optional depending on usage*
    *   `project` (Full control of projects) - *Optional depending on usage*
5.  Click **Generate token**.
6.  **Copy the token immediately** (you won't see it again).

### 2. Verify Node.js

Ensure Node.js is installed in your environment by running:

```bash
node -v
npm -v
```

If these commands work, `npx` should also be available.
