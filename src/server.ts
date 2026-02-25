import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RedmineClient } from "./redmine-client";

export function createServer(_client: RedmineClient): McpServer {
	const server = new McpServer({
		name: "redmine-api-mcp",
		version: "1.0.0",
	});

	// ツールはTask 6以降で登録する
	return server;
}
