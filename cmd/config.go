package cmd

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/chippy-ao/redmine-cli/internal/config"
	"github.com/spf13/cobra"
)

var configCmd = &cobra.Command{
	Use:   "config",
	Short: "プロファイル設定の管理",
}

// --- config add ---

var addURL string
var addAPIKey string

var configAddCmd = &cobra.Command{
	Use:   "add <name>",
	Short: "プロファイルを追加する",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		name := args[0]
		path := config.DefaultConfigPath()

		cfg, err := config.LoadConfig(path)
		if err != nil {
			return err
		}

		cfg.Profiles[name] = config.Profile{
			URL:    strings.TrimRight(addURL, "/"),
			APIKey: addAPIKey,
		}

		if cfg.DefaultProfile == "" {
			cfg.DefaultProfile = name
		}

		if err := config.SaveConfig(path, cfg); err != nil {
			return err
		}

		fmt.Fprintf(os.Stderr, "プロファイル '%s' を追加しました。\n", name)
		return nil
	},
}

// --- config list ---

type profileOutput struct {
	URL    string `json:"url"`
	APIKey string `json:"api_key"`
}

type configListOutput struct {
	DefaultProfile string                   `json:"default_profile"`
	Profiles       map[string]profileOutput `json:"profiles"`
}

func maskAPIKey(key string) string {
	if len(key) <= 4 {
		return "****"
	}
	return "****" + key[len(key)-4:]
}

var configListCmd = &cobra.Command{
	Use:   "list",
	Short: "プロファイル一覧を表示する",
	Args:  cobra.NoArgs,
	RunE: func(cmd *cobra.Command, args []string) error {
		path := config.DefaultConfigPath()

		cfg, err := config.LoadConfig(path)
		if err != nil {
			return err
		}

		out := configListOutput{
			DefaultProfile: cfg.DefaultProfile,
			Profiles:       make(map[string]profileOutput),
		}
		for name, p := range cfg.Profiles {
			out.Profiles[name] = profileOutput{
				URL:    p.URL,
				APIKey: maskAPIKey(p.APIKey),
			}
		}

		data, err := json.MarshalIndent(out, "", "  ")
		if err != nil {
			return fmt.Errorf("JSONのシリアライズに失敗しました: %w", err)
		}

		fmt.Fprintln(os.Stdout, string(data))
		return nil
	},
}

// --- config remove ---

var configRemoveCmd = &cobra.Command{
	Use:   "remove <name>",
	Short: "プロファイルを削除する",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		name := args[0]
		path := config.DefaultConfigPath()

		cfg, err := config.LoadConfig(path)
		if err != nil {
			return err
		}

		if _, ok := cfg.Profiles[name]; !ok {
			return fmt.Errorf("プロファイル '%s' が見つかりません", name)
		}

		delete(cfg.Profiles, name)

		if cfg.DefaultProfile == name {
			cfg.DefaultProfile = ""
		}

		if err := config.SaveConfig(path, cfg); err != nil {
			return err
		}

		fmt.Fprintf(os.Stderr, "プロファイル '%s' を削除しました。\n", name)
		return nil
	},
}

// --- config set-default ---

var configSetDefaultCmd = &cobra.Command{
	Use:   "set-default <name>",
	Short: "デフォルトプロファイルを設定する",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		name := args[0]
		path := config.DefaultConfigPath()

		cfg, err := config.LoadConfig(path)
		if err != nil {
			return err
		}

		if _, ok := cfg.Profiles[name]; !ok {
			return fmt.Errorf("プロファイル '%s' が見つかりません", name)
		}

		cfg.DefaultProfile = name

		if err := config.SaveConfig(path, cfg); err != nil {
			return err
		}

		fmt.Fprintf(os.Stderr, "デフォルトプロファイルを '%s' に設定しました。\n", name)
		return nil
	},
}

func init() {
	configAddCmd.Flags().StringVar(&addURL, "url", "", "Redmine の URL")
	configAddCmd.Flags().StringVar(&addAPIKey, "api-key", "", "Redmine の API キー")
	_ = configAddCmd.MarkFlagRequired("url")
	_ = configAddCmd.MarkFlagRequired("api-key")

	configCmd.AddCommand(configAddCmd)
	configCmd.AddCommand(configListCmd)
	configCmd.AddCommand(configRemoveCmd)
	configCmd.AddCommand(configSetDefaultCmd)

	rootCmd.AddCommand(configCmd)
}
