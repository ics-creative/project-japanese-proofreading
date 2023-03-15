import { DefaultExtensionRuleType } from "./rule-data";

/**
 * テキスト校正くんで使用する、「拡張機能のデフォルトルール」です。
 * 関連する機能に以下があります。
 * 「VSCodeのユーザー設定ルール」: VSCode設定画面で設定できます。
 * 「ICS MEDIA校正ルール」: GitHubで提供されている辞書とルールのセットです。
 *
 * ルールに関して、同じルールがある場合、「拡張機能のデフォルトルール」より「VSCodeのユーザー設定ルール」が優先されます。
 *

 * 「ICS MEDIA校正ルール」の辞書は、「拡張機能のデフォルトルール」内に組み込まれています。
 */
export const DEFAULT_EXTENSION_RULES: readonly DefaultExtensionRuleType[] = [
  {
    ruleName: "読点の数",
    ruleId: "preset-japanese/max-ten",
    enabled: true,
  },
  {
    ruleName: "逆接の「が」の複数回出現",
    ruleId: "preset-japanese/no-doubled-conjunctive-particle-ga",
    enabled: true,
  },
  {
    ruleName: "接続詞の連続",
    ruleId: "preset-japanese/no-doubled-conjunction",
    enabled: true,
  },
  {
    ruleName: "二重否定",
    ruleId: "preset-japanese/no-double-negative-ja",
    enabled: true,
  },
  {
    ruleName: "助詞の連続",
    ruleId: "preset-japanese/no-doubled-joshi",
    enabled: true,
  },
  {
    ruleName: "ら抜き言葉",
    ruleId: "preset-japanese/no-dropping-the-ra",
    enabled: true,
  },
  {
    ruleName: "ですます調",
    ruleId: "preset-japanese/no-mix-dearu-desumasu",
    enabled: true,
  },
  {
    ruleName: "不自然な濁点",
    ruleId: "preset-japanese/no-nfd",
    enabled: true,
  },
  {
    ruleName: "制御文字",
    ruleId: "preset-japanese/no-invalid-control-character",
    enabled: true,
  },
  {
    ruleName: "ゼロ幅スペース",
    ruleId: "preset-japanese/no-zero-width-spaces",
    enabled: true,
  },
  {
    ruleName: "康煕部首",
    ruleId: "preset-japanese/no-kangxi-radicals",
    enabled: true,
  },
  {
    ruleName: "誤字",
    ruleId: "prh/誤字",
    enabled: true,
  },
  {
    ruleName: "重言",
    ruleId: "prh/重言",
    enabled: true,
  },
  {
    ruleName: "ひらく漢字",
    ruleId: "prh/ひらく漢字",
    enabled: true,
  },
  {
    ruleName: "冗長な表現",
    ruleId: "prh/冗長な表現",
    enabled: true,
  },
  {
    ruleName: "外来語カタカナ表記",
    ruleId: "prh/外来語カタカナ表記",
    enabled: true,
  },
  {
    ruleName: "固有名詞",
    ruleId: "prh/固有名詞",
    enabled: true,
  },
  {
    ruleName: "技術用語",
    ruleId: "prh/技術用語",
    enabled: true,
  },
  {
    /**
     * 有効の場合:
     * 句読点には全角の「、」と「。」を使います。和文の句読点としてピリオド(.)とカンマ(,)を使用しません。
     *
     * テキスト校正くんでは、和文の句読点として半角ピリオド(.)と半角カンマ(.)が使用されているかチェックするために使用します。
     */
    ruleName: "ピリオドとカンマの使用（半角）",
    ruleId: "preset-jtf-style/1.2.1.句点(。)と読点(、)",
    enabled: true,
  },
  {
    /**
     * 有効の場合:
     * 欧文で表記する組織名などの固有名詞や数字にピリオド(.)やカンマ(,)が含まれる場合は、和文中でもピリオド（.）とカンマ（,）を使用します。
     *
     * テキスト校正くんでは、和文の句読点として全角ピリオド(．)と全角カンマ(，)が使用されているかチェックするために使用します。
     * 注意点として、1行に1文字のみ検知するようになっています。
     */
    ruleName: "ピリオドとカンマの使用（全角）",
    ruleId: "preset-jtf-style/1.2.2.ピリオド(.)とカンマ(,)",
    enabled: true,
  },
  {
    ruleName: "算用数字",
    ruleId: "preset-jtf-style/2.1.8.算用数字",
    enabled: true,
  },
  {
    ruleName: "アルファベット",
    ruleId: "preset-jtf-style/2.1.9.アルファベット",
    enabled: true,
  },
  {
    ruleName: "算用数字と漢数字の使い分け",
    ruleId: "preset-jtf-style/2.2.2.算用数字と漢数字の使い分け",
    enabled: true,
  },
  {
    ruleName: "一部の助数詞の表記",
    ruleId: "preset-jtf-style/2.2.3.一部の助数詞の表記",
    enabled: true,
  },
  {
    ruleName: "全角文字と半角文字の間",
    ruleId: "preset-jtf-style/3.1.1.全角文字と半角文字の間",
    enabled: true,
  },
  {
    ruleName: "全角文字どうし",
    ruleId: "preset-jtf-style/3.1.2.全角文字どうし",
    enabled: true,
  },
  {
    ruleName: "かっこ類と隣接する文字の間のスペースの有無",
    ruleId: "preset-jtf-style/3.3.かっこ類と隣接する文字の間のスペースの有無",
    enabled: true,
  },
  {
    ruleName: "疑問符(？)",
    ruleId: "preset-jtf-style/4.2.2.疑問符(？)",
    enabled: true,
  },
  {
    ruleName: "ハイフン(-)",
    ruleId: "preset-jtf-style/4.2.6.ハイフン(-)",
    enabled: true,
  },
  {
    ruleName: "ダッシュ(-)",
    ruleId: "preset-jtf-style/4.2.9.ダッシュ(-)",
    enabled: true,
  },
  {
    ruleName: "丸かっこ（）",
    ruleId: "preset-jtf-style/4.3.1.丸かっこ（）",
    enabled: true,
  },
  {
    ruleName: "大かっこ［］",
    ruleId: "preset-jtf-style/4.3.2.大かっこ［］",
    enabled: true,
  },
] as const;
