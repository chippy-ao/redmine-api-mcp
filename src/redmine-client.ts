export class RedmineClient {
	private baseUrl: string;
	private apiKey: string;

	constructor(baseUrl: string, apiKey: string) {
		this.baseUrl = baseUrl;
		this.apiKey = apiKey;
	}

	async get<T>(path: string, params?: Record<string, string>): Promise<T> {
		const url = new URL(path, this.baseUrl);
		if (params) {
			for (const [key, value] of Object.entries(params)) {
				url.searchParams.append(key, value);
			}
		}

		const response = await fetch(url.toString(), {
			method: "GET",
			headers: {
				"X-Redmine-API-Key": this.apiKey,
				"Content-Type": "application/json",
			},
		});

		await this.handleErrorResponse(response);
		return response.json() as Promise<T>;
	}

	async getWithRawParams<T>(path: string, rawQuery: string): Promise<T> {
		const url = `${this.baseUrl}${path}${rawQuery ? `?${rawQuery}` : ""}`;

		const response = await fetch(url, {
			method: "GET",
			headers: {
				"X-Redmine-API-Key": this.apiKey,
				"Content-Type": "application/json",
			},
		});

		await this.handleErrorResponse(response);
		return response.json() as Promise<T>;
	}

	private async handleErrorResponse(response: Response): Promise<void> {
		if (response.ok) return;

		switch (response.status) {
			case 401:
				throw new Error(
					"認証エラー: REDMINE_API_KEY が無効です。APIキーを確認してください。",
				);
			case 403:
				throw new Error("権限エラー: このリソースへのアクセス権がありません。");
			case 404:
				throw new Error(`リソースが見つかりません（404）: ${response.url}`);
			default:
				throw new Error(
					`Redmine APIエラー（${response.status}）: ${await response.text()}`,
				);
		}
	}
}
