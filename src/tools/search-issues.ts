import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { RedmineClient } from "../redmine-client";
import type { IssuesResponse } from "../types";

export const searchIssuesSchema = z.object({
	keyword: z
		.string()
		.optional()
		.describe("全文テキスト検索（Redmine 5.1+、any_searchable）"),
	project_id: z
		.union([z.string(), z.number()])
		.optional()
		.describe("プロジェクトID or 識別子"),
	status_id: z
		.string()
		.optional()
		.describe("ステータス: open, closed, *, または数値ID"),
	assigned_to_id: z
		.union([z.string(), z.number()])
		.optional()
		.describe("担当者ID（meも可）"),
	tracker_id: z.number().optional().describe("トラッカーID"),
	category_id: z.number().optional().describe("カテゴリID"),
	fixed_version_id: z.number().optional().describe("対象バージョンID"),
	sort: z.string().optional().describe("ソート列（例: updated_on:desc）"),
	offset: z.number().optional().default(0).describe("取得開始位置"),
	limit: z.number().optional().default(25).describe("取得件数（最大100）"),
});

type SearchIssuesInput = z.input<typeof searchIssuesSchema>;

export function buildSearchParams(
	input: Omit<SearchIssuesInput, "keyword">,
): Record<string, string> {
	const params: Record<string, string> = {};

	if (input.project_id !== undefined)
		params.project_id = String(input.project_id);
	if (input.status_id !== undefined) params.status_id = input.status_id;
	if (input.assigned_to_id !== undefined)
		params.assigned_to_id = String(input.assigned_to_id);
	if (input.tracker_id !== undefined)
		params.tracker_id = String(input.tracker_id);
	if (input.category_id !== undefined)
		params.category_id = String(input.category_id);
	if (input.fixed_version_id !== undefined)
		params.fixed_version_id = String(input.fixed_version_id);
	if (input.sort !== undefined) params.sort = input.sort;

	params.offset = String(input.offset ?? 0);
	params.limit = String(input.limit ?? 25);

	return params;
}

/** status_id の特殊値（set_filter=1 でも通常パラメータとして動作する） */
const STATUS_SPECIAL_VALUES = ["open", "closed", "*"];

/** keyword 使用時に f[]/op[]/v[] 形式が必要なパラメータ（status_id は別途処理） */
const FILTER_PARAM_KEYS = [
	"tracker_id",
	"assigned_to_id",
	"category_id",
	"fixed_version_id",
] as const;

export function buildFilterQuery(
	keyword: string | undefined,
	filters: Omit<SearchIssuesInput, "keyword"> = {},
): string {
	if (!keyword) return "";

	const parts = [
		"set_filter=1",
		"f[]=any_searchable",
		"op[any_searchable]=~",
		`v[any_searchable][]=${encodeURIComponent(keyword)}`,
	];

	const addEqFilter = (name: string, value: string | number) => {
		parts.push(`f[]=${name}`);
		parts.push(`op[${name}]==`);
		parts.push(`v[${name}][]=${encodeURIComponent(String(value))}`);
	};

	for (const key of FILTER_PARAM_KEYS) {
		const value = filters[key];
		if (value !== undefined) addEqFilter(key, value);
	}

	// status_id: 数値IDのみフィルタ形式、特殊値(open/closed/*)は通常パラメータ
	if (
		filters.status_id !== undefined &&
		!STATUS_SPECIAL_VALUES.includes(filters.status_id)
	) {
		addEqFilter("status_id", filters.status_id);
	}

	return parts.join("&");
}

export function registerSearchIssues(
	server: McpServer,
	client: RedmineClient,
): void {
	server.registerTool(
		"search_issues",
		{
			title: "Search Issues",
			description: "Redmineのチケットをキーワードやフィルタで検索します。",
			inputSchema: searchIssuesSchema,
		},
		async (input) => {
			const { keyword, ...rest } = input;

			let data: IssuesResponse;

			if (keyword) {
				const filterQuery = buildFilterQuery(keyword, rest);
				const regularParams = buildSearchParams(rest);
				// フィルタ形式で処理済みのパラメータを通常パラメータから除外
				for (const key of FILTER_PARAM_KEYS) {
					delete regularParams[key];
				}
				if (
					rest.status_id !== undefined &&
					!STATUS_SPECIAL_VALUES.includes(rest.status_id)
				) {
					delete regularParams.status_id;
				}

				const paramParts = Object.entries(regularParams).map(
					([k, v]) => `${k}=${encodeURIComponent(v)}`,
				);
				const fullQuery = [filterQuery, ...paramParts].join("&");
				data = await client.getWithRawParams<IssuesResponse>(
					"/issues.json",
					fullQuery,
				);
			} else {
				data = await client.get<IssuesResponse>(
					"/issues.json",
					buildSearchParams(rest),
				);
			}

			const summary = data.issues
				.map(
					(issue) =>
						`#${issue.id} [${issue.status.name}] ${issue.subject} (${issue.assigned_to?.name ?? "未担当"})`,
				)
				.join("\n");

			return {
				content: [
					{
						type: "text" as const,
						text: `検索結果: ${data.total_count}件中 ${data.issues.length}件表示\n\n${summary}`,
					},
				],
			};
		},
	);
}
