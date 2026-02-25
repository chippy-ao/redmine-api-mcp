export interface Config {
	redmineUrl: string;
	redmineApiKey: string;
}

export function getConfig(
	env: Record<string, string | undefined> = process.env,
): Config {
	const redmineUrl = env.REDMINE_URL;
	if (!redmineUrl) {
		throw new Error(
			"環境変数 REDMINE_URL が設定されていません。RedmineサーバーのURLを設定してください。",
		);
	}

	const redmineApiKey = env.REDMINE_API_KEY;
	if (!redmineApiKey) {
		throw new Error(
			"環境変数 REDMINE_API_KEY が設定されていません。RedmineのAPIキーを設定してください。",
		);
	}

	return {
		redmineUrl: redmineUrl.replace(/\/+$/, ""),
		redmineApiKey,
	};
}
