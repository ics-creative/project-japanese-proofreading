/**
 * ルールのデフォルト設定
 */
export interface DefaultExtensionRuleType {
  /** モジュールのパッケージ名です。 */
  ruleId: string;
  /** デフォルトでルールを有効にするか？ */
  enabled: boolean;
  /** package.jsonのconfigurationの名前と同一 */
  ruleName: string;
}
