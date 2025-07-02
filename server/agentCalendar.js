
import { Agent, hostedMcpTool, MCPServerStreamableHttp } from '@openai/agents';

export const mcpServer = new MCPServerStreamableHttp({
    url: 'http://localhost:3002',
    name: 'google-calendar-mcp',
  });
export const agent = new Agent({
    name: 'GitMCP Assistant',
    instructions: 'Use the tools to respond to user requests.',
    mcpServers: [mcpServer],
  });

// export const agent = new Agent({
//   name: 'Google Calendar Agent',
//   instructions: 'You must always use the MCP tools to answer questions.',
//   tools: [
//     hostedMcpTool({
//       serverLabel: 'google-calendar-mcp',
//       serverUrl: 'http://localhost:3002',
//     }),
//   ],
// });