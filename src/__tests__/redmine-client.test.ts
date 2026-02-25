import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { RedmineClient } from "../redmine-client";

const originalFetch = globalThis.fetch;

describe("RedmineClient", () => {
	let client: RedmineClient;

	beforeEach(() => {
		client = new RedmineClient("https://redmine.example.com", "test-api-key");
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	describe("get", () => {
		it("正しいURLとヘッダーでGETリクエストを送る", async () => {
			const mockResponse = {
				issues: [],
				total_count: 0,
				offset: 0,
				limit: 25,
			};
			globalThis.fetch = mock(() =>
				Promise.resolve(
					new Response(JSON.stringify(mockResponse), { status: 200 }),
				),
			) as unknown as typeof fetch;

			await client.get("/issues.json");

			expect(globalThis.fetch).toHaveBeenCalledWith(
				"https://redmine.example.com/issues.json",
				expect.objectContaining({
					method: "GET",
					headers: expect.objectContaining({
						"X-Redmine-API-Key": "test-api-key",
						"Content-Type": "application/json",
					}),
				}),
			);
		});

		it("クエリパラメータを正しく付与する", async () => {
			const mockFn = mock(() =>
				Promise.resolve(new Response(JSON.stringify({}), { status: 200 })),
			);
			globalThis.fetch = mockFn as unknown as typeof fetch;

			await client.get("/issues.json", {
				status_id: "open",
				limit: "25",
			});

			const callArgs = mockFn.mock.calls[0] as unknown as string[];
			const url = callArgs[0];
			expect(url).toContain("status_id=open");
			expect(url).toContain("limit=25");
		});

		it("401エラーで適切なエラーメッセージを返す", async () => {
			globalThis.fetch = mock(() =>
				Promise.resolve(new Response("Unauthorized", { status: 401 })),
			) as unknown as typeof fetch;

			expect(client.get("/issues.json")).rejects.toThrow(
				"REDMINE_API_KEY が無効です",
			);
		});

		it("403エラーで適切なエラーメッセージを返す", async () => {
			globalThis.fetch = mock(() =>
				Promise.resolve(new Response("Forbidden", { status: 403 })),
			) as unknown as typeof fetch;

			expect(client.get("/issues.json")).rejects.toThrow(
				"アクセス権がありません",
			);
		});

		it("404エラーで適切なエラーメッセージを返す", async () => {
			globalThis.fetch = mock(() =>
				Promise.resolve(new Response("Not Found", { status: 404 })),
			) as unknown as typeof fetch;

			expect(client.get("/issues/999.json")).rejects.toThrow("見つかりません");
		});
	});
});
