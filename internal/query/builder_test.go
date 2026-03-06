package query

import (
	"net/url"
	"testing"
)

func TestBuildSearchParams(t *testing.T) {
	t.Run("basic params are converted to string map", func(t *testing.T) {
		p := SearchParams{
			ProjectID:      "my-project",
			StatusID:       "open",
			AssignedToID:   "me",
			TrackerID:      1,
			CategoryID:     2,
			FixedVersionID: 3,
			Sort:           "updated_on:desc",
			Offset:         10,
			Limit:          50,
		}
		result := BuildSearchParams(p)

		expected := map[string]string{
			"project_id":       "my-project",
			"status_id":        "open",
			"assigned_to_id":   "me",
			"tracker_id":       "1",
			"category_id":      "2",
			"fixed_version_id": "3",
			"sort":             "updated_on:desc",
			"offset":           "10",
			"limit":            "50",
		}
		for k, v := range expected {
			if result[k] != v {
				t.Errorf("key %q: got %q, want %q", k, result[k], v)
			}
		}
	})

	t.Run("missing params are not included", func(t *testing.T) {
		p := SearchParams{
			ProjectID: "test",
		}
		result := BuildSearchParams(p)

		if _, ok := result["tracker_id"]; ok {
			t.Error("tracker_id should not be present when zero")
		}
		if _, ok := result["category_id"]; ok {
			t.Error("category_id should not be present when zero")
		}
		if _, ok := result["fixed_version_id"]; ok {
			t.Error("fixed_version_id should not be present when zero")
		}
		if _, ok := result["status_id"]; ok {
			t.Error("status_id should not be present when empty")
		}
		if _, ok := result["assigned_to_id"]; ok {
			t.Error("assigned_to_id should not be present when empty")
		}
		if _, ok := result["sort"]; ok {
			t.Error("sort should not be present when empty")
		}
		if result["project_id"] != "test" {
			t.Errorf("project_id: got %q, want %q", result["project_id"], "test")
		}
	})

	t.Run("default offset is 0 and default limit is 25", func(t *testing.T) {
		p := SearchParams{}
		result := BuildSearchParams(p)

		if result["offset"] != "0" {
			t.Errorf("offset: got %q, want %q", result["offset"], "0")
		}
		if result["limit"] != "25" {
			t.Errorf("limit: got %q, want %q", result["limit"], "25")
		}
	})
}

func TestBuildFilterQuery(t *testing.T) {
	t.Run("keyword only", func(t *testing.T) {
		result := BuildFilterQuery("test keyword", SearchParams{})
		expected := "set_filter=1&f[]=any_searchable&op[any_searchable]=~&v[any_searchable][]=" + url.QueryEscape("test keyword")
		if result != expected {
			t.Errorf("got %q, want %q", result, expected)
		}
	})

	t.Run("empty keyword returns empty string", func(t *testing.T) {
		result := BuildFilterQuery("", SearchParams{})
		if result != "" {
			t.Errorf("got %q, want empty string", result)
		}
	})

	t.Run("keyword with tracker_id", func(t *testing.T) {
		result := BuildFilterQuery("test", SearchParams{TrackerID: 5})
		expected := "set_filter=1&f[]=any_searchable&op[any_searchable]=~&v[any_searchable][]=" + url.QueryEscape("test") +
			"&f[]=tracker_id&op[tracker_id]==&v[tracker_id][]=5"
		if result != expected {
			t.Errorf("got %q, want %q", result, expected)
		}
	})

	t.Run("keyword with assigned_to_id", func(t *testing.T) {
		result := BuildFilterQuery("test", SearchParams{AssignedToID: "42"})
		expected := "set_filter=1&f[]=any_searchable&op[any_searchable]=~&v[any_searchable][]=" + url.QueryEscape("test") +
			"&f[]=assigned_to_id&op[assigned_to_id]==&v[assigned_to_id][]=42"
		if result != expected {
			t.Errorf("got %q, want %q", result, expected)
		}
	})

	t.Run("keyword with category_id", func(t *testing.T) {
		result := BuildFilterQuery("test", SearchParams{CategoryID: 7})
		expected := "set_filter=1&f[]=any_searchable&op[any_searchable]=~&v[any_searchable][]=" + url.QueryEscape("test") +
			"&f[]=category_id&op[category_id]==&v[category_id][]=7"
		if result != expected {
			t.Errorf("got %q, want %q", result, expected)
		}
	})

	t.Run("keyword with fixed_version_id", func(t *testing.T) {
		result := BuildFilterQuery("test", SearchParams{FixedVersionID: 10})
		expected := "set_filter=1&f[]=any_searchable&op[any_searchable]=~&v[any_searchable][]=" + url.QueryEscape("test") +
			"&f[]=fixed_version_id&op[fixed_version_id]==&v[fixed_version_id][]=10"
		if result != expected {
			t.Errorf("got %q, want %q", result, expected)
		}
	})

	t.Run("keyword with numeric status_id adds filter", func(t *testing.T) {
		result := BuildFilterQuery("test", SearchParams{StatusID: "3"})
		expected := "set_filter=1&f[]=any_searchable&op[any_searchable]=~&v[any_searchable][]=" + url.QueryEscape("test") +
			"&f[]=status_id&op[status_id]==&v[status_id][]=3"
		if result != expected {
			t.Errorf("got %q, want %q", result, expected)
		}
	})

	t.Run("keyword with status_id open does not add filter", func(t *testing.T) {
		result := BuildFilterQuery("test", SearchParams{StatusID: "open"})
		expected := "set_filter=1&f[]=any_searchable&op[any_searchable]=~&v[any_searchable][]=" + url.QueryEscape("test")
		if result != expected {
			t.Errorf("got %q, want %q", result, expected)
		}
	})

	t.Run("keyword with status_id closed does not add filter", func(t *testing.T) {
		result := BuildFilterQuery("test", SearchParams{StatusID: "closed"})
		expected := "set_filter=1&f[]=any_searchable&op[any_searchable]=~&v[any_searchable][]=" + url.QueryEscape("test")
		if result != expected {
			t.Errorf("got %q, want %q", result, expected)
		}
	})

	t.Run("keyword with status_id * does not add filter", func(t *testing.T) {
		result := BuildFilterQuery("test", SearchParams{StatusID: "*"})
		expected := "set_filter=1&f[]=any_searchable&op[any_searchable]=~&v[any_searchable][]=" + url.QueryEscape("test")
		if result != expected {
			t.Errorf("got %q, want %q", result, expected)
		}
	})

	t.Run("keyword with multiple filters", func(t *testing.T) {
		result := BuildFilterQuery("bug", SearchParams{
			TrackerID:      1,
			AssignedToID:   "5",
			CategoryID:     3,
			FixedVersionID: 2,
			StatusID:       "4",
		})
		expected := "set_filter=1&f[]=any_searchable&op[any_searchable]=~&v[any_searchable][]=" + url.QueryEscape("bug") +
			"&f[]=tracker_id&op[tracker_id]==&v[tracker_id][]=1" +
			"&f[]=assigned_to_id&op[assigned_to_id]==&v[assigned_to_id][]=5" +
			"&f[]=category_id&op[category_id]==&v[category_id][]=3" +
			"&f[]=fixed_version_id&op[fixed_version_id]==&v[fixed_version_id][]=2" +
			"&f[]=status_id&op[status_id]==&v[status_id][]=4"
		if result != expected {
			t.Errorf("got %q, want %q", result, expected)
		}
	})
}

func TestIsStatusSpecial(t *testing.T) {
	tests := []struct {
		input string
		want  bool
	}{
		{"open", true},
		{"closed", true},
		{"*", true},
		{"1", false},
		{"42", false},
		{"", false},
	}
	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			if got := IsStatusSpecial(tt.input); got != tt.want {
				t.Errorf("IsStatusSpecial(%q) = %v, want %v", tt.input, got, tt.want)
			}
		})
	}
}
