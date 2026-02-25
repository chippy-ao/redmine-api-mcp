import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { RedmineClient } from "../redmine-client";
import type { IssueResponse } from "../types";

const includeValues = [
	"journals",
	"children",
	"relations",
	"attachments",
	"changesets",
	"watchers",
	"allowed_statuses",
] as const;

export const getIssueSchema = z.object({
	issue_id: z.number().describe("チケットID"),
	include: z
		.array(z.enum(includeValues))
		.optional()
		.describe(
			"追加情報: journals, children, relations, attachments, changesets, watchers, allowed_statuses",
		),
});

export function buildIncludeParam(
	include: readonly string[] | undefined,
): string | undefined {
	if (!include || include.length === 0) return undefined;
	return include.join(",");
}

export function registerGetIssue(
	server: McpServer,
	client: RedmineClient,
): void {
	server.registerTool(
		"get_issue",
		{
			title: "Get Issue",
			description: "Redmineのチケット詳細を取得します。",
			inputSchema: getIssueSchema,
		},
		async (input) => {
			const params: Record<string, string> = {};
			const includeParam = buildIncludeParam(input.include);
			if (includeParam) params.include = includeParam;

			const data = await client.get<IssueResponse>(
				`/issues/${input.issue_id}.json`,
				Object.keys(params).length > 0 ? params : undefined,
			);

			const issue = data.issue;
			const lines = [
				`# #${issue.id} ${issue.subject}`,
				"",
				`- **プロジェクト:** ${issue.project.name}`,
				`- **トラッカー:** ${issue.tracker.name}`,
				`- **ステータス:** ${issue.status.name}`,
				`- **優先度:** ${issue.priority.name}`,
				`- **担当者:** ${issue.assigned_to?.name ?? "未担当"}`,
				`- **作成者:** ${issue.author.name}`,
				`- **進捗率:** ${issue.done_ratio}%`,
				`- **作成日:** ${issue.created_on}`,
				`- **更新日:** ${issue.updated_on}`,
			];

			if (issue.category) lines.push(`- **カテゴリ:** ${issue.category.name}`);
			if (issue.fixed_version)
				lines.push(`- **対象バージョン:** ${issue.fixed_version.name}`);
			if (issue.start_date) lines.push(`- **開始日:** ${issue.start_date}`);
			if (issue.due_date) lines.push(`- **期日:** ${issue.due_date}`);
			if (issue.estimated_hours)
				lines.push(`- **予定工数:** ${issue.estimated_hours}h`);

			if (issue.description) {
				lines.push("", "## 説明", "", issue.description);
			}

			if (issue.journals?.length) {
				lines.push("", "## 履歴");
				for (const journal of issue.journals) {
					if (journal.notes) {
						lines.push(
							"",
							`### ${journal.user.name} (${journal.created_on})`,
							"",
							journal.notes,
						);
					}
				}
			}

			return {
				content: [{ type: "text" as const, text: lines.join("\n") }],
			};
		},
	);
}
