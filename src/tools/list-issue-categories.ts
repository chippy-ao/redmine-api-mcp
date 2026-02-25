import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { RedmineClient } from "../redmine-client";
import type { IssueCategoriesResponse } from "../types";

export const listIssueCategoriesSchema = z.object({
	project_id: z
		.union([z.string(), z.number()])
		.describe("プロジェクトID or 識別子"),
});

export function registerListIssueCategories(
	server: McpServer,
	client: RedmineClient,
): void {
	server.registerTool(
		"list_issue_categories",
		{
			title: "List Issue Categories",
			description:
				"指定プロジェクトのチケットカテゴリ一覧を取得します。チケット検索時のcategory_idの解決に使用します。",
			inputSchema: listIssueCategoriesSchema,
		},
		async (input) => {
			const data = await client.get<IssueCategoriesResponse>(
				`/projects/${input.project_id}/issue_categories.json`,
			);

			const summary = data.issue_categories
				.map(
					(c) =>
						`- ID:${c.id} **${c.name}**${c.assigned_to ? ` (デフォルト担当: ${c.assigned_to.name})` : ""}`,
				)
				.join("\n");

			return {
				content: [
					{
						type: "text" as const,
						text:
							summary.length > 0
								? `カテゴリ一覧:\n\n${summary}`
								: "このプロジェクトにはカテゴリが設定されていません。",
					},
				],
			};
		},
	);
}
