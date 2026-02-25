// --- 共通 ---
export interface RedmineIdName {
	id: number;
	name: string;
}

// --- Issues ---
export interface RedmineIssue {
	id: number;
	project: RedmineIdName;
	tracker: RedmineIdName;
	status: RedmineIdName;
	priority: RedmineIdName;
	author: RedmineIdName;
	assigned_to?: RedmineIdName;
	category?: RedmineIdName;
	fixed_version?: RedmineIdName;
	parent?: { id: number };
	subject: string;
	description: string;
	start_date?: string;
	due_date?: string;
	done_ratio: number;
	is_private: boolean;
	estimated_hours?: number;
	spent_hours?: number;
	created_on: string;
	updated_on: string;
	closed_on?: string;
	journals?: RedmineJournal[];
	children?: RedmineChildIssue[];
	relations?: RedmineRelation[];
	attachments?: RedmineAttachment[];
	changesets?: RedmineChangeset[];
	watchers?: RedmineIdName[];
}

export interface RedmineJournal {
	id: number;
	user: RedmineIdName;
	notes: string;
	created_on: string;
	details: RedmineJournalDetail[];
}

export interface RedmineJournalDetail {
	property: string;
	name: string;
	old_value?: string;
	new_value?: string;
}

export interface RedmineChildIssue {
	id: number;
	tracker: RedmineIdName;
	subject: string;
}

export interface RedmineRelation {
	id: number;
	issue_id: number;
	issue_to_id: number;
	relation_type: string;
	delay?: number;
}

export interface RedmineAttachment {
	id: number;
	filename: string;
	filesize: number;
	content_type: string;
	description: string;
	content_url: string;
	author: RedmineIdName;
	created_on: string;
}

export interface RedmineChangeset {
	revision: string;
	user?: RedmineIdName;
	comments: string;
	committed_on: string;
}

export interface IssuesResponse {
	issues: RedmineIssue[];
	total_count: number;
	offset: number;
	limit: number;
}

export interface IssueResponse {
	issue: RedmineIssue;
}

// --- Projects ---
export interface RedmineProject {
	id: number;
	name: string;
	identifier: string;
	description: string;
	status: number;
	is_public: boolean;
	created_on: string;
	updated_on: string;
	trackers?: RedmineIdName[];
	issue_categories?: RedmineIdName[];
}

export interface ProjectsResponse {
	projects: RedmineProject[];
	total_count: number;
	offset: number;
	limit: number;
}

// --- Trackers ---
export interface RedmineTracker {
	id: number;
	name: string;
	default_status: RedmineIdName;
	description: string;
}

export interface TrackersResponse {
	trackers: RedmineTracker[];
}

// --- Issue Statuses ---
export interface RedmineIssueStatus {
	id: number;
	name: string;
	is_closed: boolean;
}

export interface IssueStatusesResponse {
	issue_statuses: RedmineIssueStatus[];
}

// --- Issue Categories ---
export interface RedmineIssueCategory {
	id: number;
	name: string;
	project: RedmineIdName;
	assigned_to?: RedmineIdName;
}

export interface IssueCategoriesResponse {
	issue_categories: RedmineIssueCategory[];
}

// --- Versions ---
export interface RedmineVersion {
	id: number;
	project: RedmineIdName;
	name: string;
	description: string;
	status: string;
	due_date?: string;
	sharing: string;
	created_on: string;
	updated_on: string;
}

export interface VersionsResponse {
	versions: RedmineVersion[];
}
