import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { RedmineClient } from "../redmine-client";
import type { IssueStatusesResponse } from "../types";

export function registerListIssueStatuses(
	server: McpServer,
	client: RedmineClient,
): void {
	server.registerTool(
		"list_issue_statuses",
		{
			title: "List Issue Statuses",
			description:
				"Redmineのチケットステータス一覧を取得します。チケット検索時のstatus_idの解決に使用します。",
			inputSchema: z.object({}),
		},
		async () => {
			const data = await client.get<IssueStatusesResponse>(
				"/issue_statuses.json",
			);

			const summary = data.issue_statuses
				.map(
					(s) =>
						`- ID:${s.id} **${s.name}** ${s.is_closed ? "(完了)" : "(未完了)"}`,
				)
				.join("\n");

			return {
				content: [
					{
						type: "text" as const,
						text: `ステータス一覧:\n\n${summary}`,
					},
				],
			};
		},
	);
}
