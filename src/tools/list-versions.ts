import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { RedmineClient } from "../redmine-client";
import type { VersionsResponse } from "../types";

export const listVersionsSchema = z.object({
	project_id: z
		.union([z.string(), z.number()])
		.describe("プロジェクトID or 識別子"),
});

export function registerListVersions(
	server: McpServer,
	client: RedmineClient,
): void {
	server.registerTool(
		"list_versions",
		{
			title: "List Versions",
			description:
				"指定プロジェクトのバージョン一覧を取得します。チケット検索時のfixed_version_idの解決に使用します。",
			inputSchema: listVersionsSchema,
		},
		async (input) => {
			const data = await client.get<VersionsResponse>(
				`/projects/${input.project_id}/versions.json`,
			);

			const summary = data.versions
				.map((v) => {
					const parts = [`- ID:${v.id} **${v.name}** [${v.status}]`];
					if (v.due_date) parts.push(`期日: ${v.due_date}`);
					if (v.description) parts.push(`- ${v.description}`);
					return parts.join(" ");
				})
				.join("\n");

			return {
				content: [
					{
						type: "text" as const,
						text:
							summary.length > 0
								? `バージョン一覧:\n\n${summary}`
								: "このプロジェクトにはバージョンが設定されていません。",
					},
				],
			};
		},
	);
}
