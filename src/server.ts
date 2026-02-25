import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RedmineClient } from "./redmine-client";
import { registerGetIssue } from "./tools/get-issue";
import { registerListIssueCategories } from "./tools/list-issue-categories";
import { registerListIssueStatuses } from "./tools/list-issue-statuses";
import { registerListProjects } from "./tools/list-projects";
import { registerListTrackers } from "./tools/list-trackers";
import { registerListVersions } from "./tools/list-versions";
import { registerSearchIssues } from "./tools/search-issues";

export function createServer(client: RedmineClient): McpServer {
	const server = new McpServer({
		name: "redmine-api-mcp",
		version: "1.0.0",
	});

	registerSearchIssues(server, client);
	registerGetIssue(server, client);
	registerListProjects(server, client);
	registerListTrackers(server, client);
	registerListIssueStatuses(server, client);
	registerListIssueCategories(server, client);
	registerListVersions(server, client);

	return server;
}
