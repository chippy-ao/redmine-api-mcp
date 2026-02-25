import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { RedmineClient } from "../redmine-client";
import type { TrackersResponse } from "../types";

export function registerListTrackers(
	server: McpServer,
	client: RedmineClient,
): void {
	server.registerTool(
		"list_trackers",
		{
			title: "List Trackers",
			description:
				"Redmineのトラッカー一覧を取得します。チケット検索・作成時のtracker_idの解決に使用します。",
			inputSchema: z.object({}),
		},
		async () => {
			const data = await client.get<TrackersResponse>("/trackers.json");

			const summary = data.trackers
				.map((t) => `- ID:${t.id} **${t.name}**`)
				.join("\n");

			return {
				content: [
					{
						type: "text" as const,
						text: `トラッカー一覧:\n\n${summary}`,
					},
				],
			};
		},
	);
}
