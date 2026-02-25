import { describe, expect, it } from "bun:test";
import { getConfig } from "../config";

describe("getConfig", () => {
	it("REDMINE_URLとREDMINE_API_KEYが設定されている場合、設定を返す", () => {
		const env = {
			REDMINE_URL: "https://redmine.example.com",
			REDMINE_API_KEY: "test-api-key-123",
		};
		const config = getConfig(env);
		expect(config.redmineUrl).toBe("https://redmine.example.com");
		expect(config.redmineApiKey).toBe("test-api-key-123");
	});

	it("REDMINE_URLの末尾スラッシュを除去する", () => {
		const env = {
			REDMINE_URL: "https://redmine.example.com/",
			REDMINE_API_KEY: "test-api-key-123",
		};
		const config = getConfig(env);
		expect(config.redmineUrl).toBe("https://redmine.example.com");
	});

	it("REDMINE_URLが未設定の場合、エラーを投げる", () => {
		const env = { REDMINE_API_KEY: "key" };
		expect(() => getConfig(env)).toThrow("REDMINE_URL");
	});

	it("REDMINE_API_KEYが未設定の場合、エラーを投げる", () => {
		const env = { REDMINE_URL: "https://redmine.example.com" };
		expect(() => getConfig(env)).toThrow("REDMINE_API_KEY");
	});
});
