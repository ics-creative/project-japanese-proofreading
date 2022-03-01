/**
 * ルールのデフォルト設定
 */
export interface IRuleItem {
  /** モジュールのパッケージ名です。 */
  ruleId: string; // モジュールのパッケージ名です。
  /** デフォルトでルールを有効にするか？ */
  enabled: boolean;
  /** package.jsonのconfigurationの名前と同一 */
  ruleName: string;
}
