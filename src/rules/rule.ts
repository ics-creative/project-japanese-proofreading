import { IRuleItem } from "./rule-data";

export const rules: IRuleItem[] = [
  {
    ruleName: "ですます調",
    ruleId: "preset-japanese/no-mix-dearu-desumasu",
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
    ruleName: "読点の数",
    ruleId: "preset-japanese/max-ten",
    enabled: true,
  },
  {
    ruleName: "助詞の連続",
    ruleId: "preset-japanese/no-doubled-joshi",
    enabled: true,
  },
  {
    ruleName: "句点(。)と読点(、)",
    ruleId: "preset-jtf-style/1.2.1.句点(。)と読点(、)",
    enabled: true,
  },
  {
    ruleName: "ピリオド(.)とカンマ(,)",
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
  {
    ruleName: "ら抜き言葉",
    ruleId: "preset-japanese/no-dropping-the-ra",
    enabled: true,
  },
];
