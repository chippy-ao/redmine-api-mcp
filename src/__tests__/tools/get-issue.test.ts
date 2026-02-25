import { describe, expect, it } from "bun:test";
import { buildIncludeParam } from "../../tools/get-issue";

describe("get_issue", () => {
	describe("buildIncludeParam", () => {
		it("includeが指定された場合、カンマ区切りの文字列を返す", () => {
			const result = buildIncludeParam(["journals", "children"]);
			expect(result).toBe("journals,children");
		});

		it("includeが未指定の場合、undefinedを返す", () => {
			const result = buildIncludeParam(undefined);
			expect(result).toBeUndefined();
		});

		it("空配列の場合、undefinedを返す", () => {
			const result = buildIncludeParam([]);
			expect(result).toBeUndefined();
		});
	});
});
