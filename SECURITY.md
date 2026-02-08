# Security Policy

## Reporting a Vulnerability

We take the security of this project seriously. If you discover a security vulnerability, please report it privately.

**DO NOT** create a public issue for security vulnerabilities.

Please report security issues to the project maintainers via email (if available) or by contacting the organization administrators directly.

## Supported Versions

Only the latest version of the codebase is supported with security updates.

## Secure Configuration

This project integrates with sensitive services (GitHub API). Please review the [Production Runbook](docs/mcp/github-mcp-antigravity-production-runbook.md) for detailed security guidelines, including:

*   **Least Privilege:** Always use fine-grained Personal Access Tokens (PATs).
*   **Token Storage:** Never commit tokens to the repository.
*   **Rotation:** Regularly rotate your access tokens.
*   **Review:** Regularly review repository access logs.
