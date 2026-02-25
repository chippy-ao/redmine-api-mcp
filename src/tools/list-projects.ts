import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { RedmineClient } from "../redmine-client";
import type { ProjectsResponse } from "../types";

export const listProjectsSchema = z.object({
	include: z
		.array(
			z.enum([
				"trackers",
				"issue_categories",
				"enabled_modules",
				"time_entry_activities",
			]),
		)
		.optional()
		.describe("追加情報"),
	offset: z.number().optional().default(0).describe("取得開始位置"),
	limit: z.number().optional().default(25).describe("取得件数（最大100）"),
});

export function registerListProjects(
	server: McpServer,
	client: RedmineClient,
): void {
	server.registerTool(
		"list_projects",
		{
			title: "List Projects",
			description: "Redmineのプロジェクト一覧を取得します。",
			inputSchema: listProjectsSchema,
		},
		async (input) => {
			const params: Record<string, string> = {
				offset: String(input.offset ?? 0),
				limit: String(input.limit ?? 25),
			};
			if (input.include?.length) params.include = input.include.join(",");

			const data = await client.get<ProjectsResponse>("/projects.json", params);

			const summary = data.projects
				.map(
					(p) =>
						`- **${p.name}** (${p.identifier}) - ${p.description || "説明なし"}`,
				)
				.join("\n");

			return {
				content: [
					{
						type: "text" as const,
						text: `プロジェクト一覧: ${data.total_count}件中 ${data.projects.length}件表示\n\n${summary}`,
					},
				],
			};
		},
	);
}
