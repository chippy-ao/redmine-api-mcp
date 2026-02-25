import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getConfig } from "./config";
import { RedmineClient } from "./redmine-client";
import { createServer } from "./server";

async function main() {
	const config = getConfig();
	const client = new RedmineClient(config.redmineUrl, config.redmineApiKey);
	const server = createServer(client);
	const transport = new StdioServerTransport();
	await server.connect(transport);
}

main().catch((error) => {
	console.error("サーバー起動エラー:", error.message);
	process.exit(1);
});
