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
	});
});
