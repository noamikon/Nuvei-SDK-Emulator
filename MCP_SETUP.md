# Nuvei MCP Server Configuration

## Server Details
- **Name**: nuvei-mcp
- **URL**: http://nuvei-mcp-prod.eastus.azurecontainer.io:8000/sse
- **Transport**: SSE (Server-Sent Events)
- **Tool**: #searchDocumentation

## Configuration Steps

### Option 1: Through Cursor Settings UI
1. Open Cursor Settings (Cmd+, on Mac / Ctrl+, on Windows)
2. Navigate to **Features** → **MCP Servers**
3. Click **Add Server**
4. Configure:
   - Name: `nuvei-mcp`
   - Transport: `SSE`
   - URL: `http://nuvei-mcp-staging.eastus.azurecontainer.io:8000/sse`

### Option 2: Through Cursor MCP Config File
1. Edit the MCP configuration file at `~/.cursor/mcp.json`
2. Current configuration (using array format):

```json
{
  "mcpServers": [
    {
      "name": "nuvei-mcp",
      "type": "streamableHttp",
      "url": "http://nuvei-mcp-staging.eastus.azurecontainer.io:8000/sse"
    }
  ]
}
```

**Note**: If the above doesn't work, try this alternative format:

```json
{
  "mcpServers": {
    "nuvei-mcp": {
      "transport": "sse",
      "url": "http://nuvei-mcp-staging.eastus.azurecontainer.io:8000/sse"
    }
  }
}
```

## Verifying Configuration

After configuration, the MCP server should be available and you should be able to:
- List MCP resources using `list_mcp_resources`
- Access Nuvei documentation using the `#searchDocumentation` tool
- Fetch MCP resources using `fetch_mcp_resource`

## Usage

Once configured, the AI assistant can:
- Search Nuvei documentation
- Access Nuvei API documentation
- Get information about Nuvei SDK methods and flows
- Retrieve code examples and integration guides


