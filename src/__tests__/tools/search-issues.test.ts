import { describe, expect, it } from "bun:test";
import { buildFilterQuery, buildSearchParams } from "../../tools/search-issues";

describe("search_issues", () => {
	describe("buildSearchParams", () => {
		it("基本的なフィルタパラメータを組み立てる", () => {
			const params = buildSearchParams({
				project_id: "my-project",
				status_id: "open",
				limit: 10,
			});
			expect(params).toEqual({
				project_id: "my-project",
				status_id: "open",
				limit: "10",
				offset: "0",
			});
		});

		it("未指定のパラメータは含まない", () => {
			const params = buildSearchParams({ status_id: "open" });
			expect(params).not.toHaveProperty("project_id");
			expect(params).not.toHaveProperty("keyword");
			expect(params.status_id).toBe("open");
		});

		it("sortパラメータを含める", () => {
			const params = buildSearchParams({ sort: "updated_on:desc" });
			expect(params.sort).toBe("updated_on:desc");
		});

		it("offsetとlimitのデフォルト値を設定する", () => {
			const params = buildSearchParams({});
			expect(params.offset).toBe("0");
			expect(params.limit).toBe("25");
		});
	});

	describe("buildFilterQuery", () => {
		it("keywordが指定された場合、any_searchableフィルタを生成する", () => {
			const query = buildFilterQuery("予防");
			expect(query).toContain("f[]=any_searchable");
			expect(query).toContain("op[any_searchable]=~");
			expect(query).toContain(
				`v[any_searchable][]=${encodeURIComponent("予防")}`,
			);
			expect(query).toContain("set_filter=1");
		});

		it("keywordが未指定の場合、空文字を返す", () => {
			const query = buildFilterQuery(undefined);
			expect(query).toBe("");
		});

		it("keyword + tracker_id でトラッカーもf[]/op[]/v[]形式になる", () => {
			const query = buildFilterQuery("データ移行", { tracker_id: 70 });
			expect(query).toContain("f[]=tracker_id");
			expect(query).toContain("op[tracker_id]==");
			expect(query).toContain("v[tracker_id][]=70");
			expect(query).toContain("f[]=any_searchable");
		});

		it("keyword + assigned_to_id で担当者もフィルタ形式になる", () => {
			const query = buildFilterQuery("テスト", { assigned_to_id: "me" });
			expect(query).toContain("f[]=assigned_to_id");
			expect(query).toContain("op[assigned_to_id]==");
			expect(query).toContain("v[assigned_to_id][]=me");
		});

		it("keyword + category_id でカテゴリもフィルタ形式になる", () => {
			const query = buildFilterQuery("テスト", { category_id: 5 });
			expect(query).toContain("f[]=category_id");
			expect(query).toContain("op[category_id]==");
			expect(query).toContain("v[category_id][]=5");
		});

		it("keyword + fixed_version_id でバージョンもフィルタ形式になる", () => {
			const query = buildFilterQuery("テスト", { fixed_version_id: 3 });
			expect(query).toContain("f[]=fixed_version_id");
			expect(query).toContain("op[fixed_version_id]==");
			expect(query).toContain("v[fixed_version_id][]=3");
		});

		it("keyword + status_id(数値ID) でステータスもフィルタ形式になる", () => {
			const query = buildFilterQuery("テスト", { status_id: "2" });
			expect(query).toContain("f[]=status_id");
			expect(query).toContain("op[status_id]==");
			expect(query).toContain("v[status_id][]=2");
		});

		it("keyword + status_id(open) はフィルタ形式に含めない", () => {
			const query = buildFilterQuery("テスト", { status_id: "open" });
			expect(query).not.toContain("f[]=status_id");
		});

		it("keyword + status_id(closed) はフィルタ形式に含めない", () => {
			const query = buildFilterQuery("テスト", { status_id: "closed" });
			expect(query).not.toContain("f[]=status_id");
		});

		it("keyword + status_id(*) はフィルタ形式に含めない", () => {
			const query = buildFilterQuery("テスト", { status_id: "*" });
			expect(query).not.toContain("f[]=status_id");
		});

		it("keyword + 複数フィルタを同時に指定できる", () => {
			const query = buildFilterQuery("データ移行", {
				tracker_id: 70,
				assigned_to_id: 10,
				status_id: "2",
			});
			expect(query).toContain("f[]=any_searchable");
			expect(query).toContain("f[]=tracker_id");
			expect(query).toContain("f[]=assigned_to_id");
			expect(query).toContain("f[]=status_id");
			expect(query).toContain("v[tracker_id][]=70");
			expect(query).toContain("v[assigned_to_id][]=10");
			expect(query).toContain("v[status_id][]=2");
		});
	});
});
