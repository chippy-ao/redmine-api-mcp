package query

import (
	"fmt"
	"net/url"
	"strings"
)

// SearchParams はRedmineのチケット検索パラメータを表す。
type SearchParams struct {
	ProjectID      string
	StatusID       string
	AssignedToID   string
	TrackerID      int
	CategoryID     int
	FixedVersionID int
	Sort           string
	Offset         int
	Limit          int
}

// BuildSearchParams は SearchParams を文字列マップに変換する。
// ゼロ値・空文字列のフィールドは含まれないが、offset と limit は常に含まれる。
func BuildSearchParams(p SearchParams) map[string]string {
	m := make(map[string]string)

	if p.ProjectID != "" {
		m["project_id"] = p.ProjectID
	}
	if p.StatusID != "" {
		m["status_id"] = p.StatusID
	}
	if p.AssignedToID != "" {
		m["assigned_to_id"] = p.AssignedToID
	}
	if p.TrackerID != 0 {
		m["tracker_id"] = fmt.Sprintf("%d", p.TrackerID)
	}
	if p.CategoryID != 0 {
		m["category_id"] = fmt.Sprintf("%d", p.CategoryID)
	}
	if p.FixedVersionID != 0 {
		m["fixed_version_id"] = fmt.Sprintf("%d", p.FixedVersionID)
	}
	if p.Sort != "" {
		m["sort"] = p.Sort
	}

	m["offset"] = fmt.Sprintf("%d", p.Offset)

	limit := p.Limit
	if limit == 0 {
		limit = 25
	}
	m["limit"] = fmt.Sprintf("%d", limit)

	return m
}

// BuildFilterQuery はキーワードとフィルタパラメータからRedmineのフィルタクエリ文字列を構築する。
// キーワードが空の場合は空文字列を返す。
func BuildFilterQuery(keyword string, p SearchParams) string {
	if keyword == "" {
		return ""
	}

	parts := []string{
		"set_filter=1",
		"f[]=any_searchable",
		"op[any_searchable]=~",
		"v[any_searchable][]=" + url.QueryEscape(keyword),
	}

	if p.TrackerID != 0 {
		parts = append(parts, addFilter("tracker_id", fmt.Sprintf("%d", p.TrackerID))...)
	}
	if p.AssignedToID != "" {
		parts = append(parts, addFilter("assigned_to_id", p.AssignedToID)...)
	}
	if p.CategoryID != 0 {
		parts = append(parts, addFilter("category_id", fmt.Sprintf("%d", p.CategoryID))...)
	}
	if p.FixedVersionID != 0 {
		parts = append(parts, addFilter("fixed_version_id", fmt.Sprintf("%d", p.FixedVersionID))...)
	}
	if p.StatusID != "" && !IsStatusSpecial(p.StatusID) {
		parts = append(parts, addFilter("status_id", p.StatusID)...)
	}

	return strings.Join(parts, "&")
}

// IsStatusSpecial は特殊なステータス値（open, closed, *）かどうかを返す。
func IsStatusSpecial(status string) bool {
	return status == "open" || status == "closed" || status == "*"
}

func addFilter(name, value string) []string {
	return []string{
		fmt.Sprintf("f[]=%s", name),
		fmt.Sprintf("op[%s]==", name),
		fmt.Sprintf("v[%s][]=%s", name, value),
	}
}
