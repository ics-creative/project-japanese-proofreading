export interface IRuleItem {
  ruleId: string; // モジュールのパッケージ名です。
  enabled: boolean;
  ruleName: string; // package.jsonのconfigurationの名前と同一
}
