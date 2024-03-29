# テキスト校正くんチェック事例
こちらに書かれている内容はテキスト校正くんにて検出される**NG例**です。

## 「ですます」調と「である」調の混在
これは素敵です。あれは平凡である。

---
補足：ですます調の検出には[textlint-rule-no-mix-dearu-desumasu](https://github.com/textlint-ja/textlint-rule-no-mix-dearu-desumasu)を利用しています。誤検出の回避のため「である調」の判定は明らかに常体な「〜である」のみとなっています。
以下のような例は検出できません。

「これは素敵です。あれは平凡だ。」
「これは素敵です。あれは平凡と言われている。」

---

## 大文字アルファベットの使用
点Ａと点Ｂを結んだ線分

## かっこ類と隣接する文字の間にスペースが使用されている
炭酸水素ナトリウム （別名、重曹） があります

## 和文におけるダッシュ「-」の使用
彼は―たとえそうだとしても

## 和文におけるハイフン「-」の使用
東京-横浜間の電車

## ひらくべき漢字
例えば

## 和文の句読点として半角ピリオド「.」と半角カンマ「,」が使用されている
しかし,

## 和文の句読点として全角ピリオド「．」と全角カンマ「，」が使用されている
しかし，

## ら抜き言葉
食べれる

## 助数詞にともなう「ヶ」の表記を使用している（「か」の使用を推奨）
1ヶ月

## 外来語カタカナ表記の語尾の長音表記を省略している
プリンタ

## 半角の丸かっこの使用
塩化ナトリウム(別名、食塩)があります

## 半角の大かっこの使用
祇園精舎の[中略]盛者必衰の理をあらはす。

## ウェブ技術に関する誤った固有名詞の使用
githubにあるWebpackのソースコード

## 和文に半角の疑問符（？）が使用されている
そうでしょうか?

## 疑問符（？）の後ろと続く文の間に半角スペースが使われている
でしょうか？ しかしながら

---

注：校正ルールを参考にしている『JTF日本語標準スタイルガイド』によれば

> 文末に疑問符を使用し、後に別の文が続く場合は、直後に全角スペースを挿入します。文中に疑問符を使用する場合はスペースを挿入しません。
>
> 『JTF日本語標準スタイルガイド 第3.0版』 3.2.2 疑問符（？）より

とあり、文末の疑問符には直後に全角スペースをいれるのが望ましいとされています。しかしながら、疑問符の使用が文末か文中かは検出性能の限界のためわかりません。そのため「でしょうか？しかしながら」のような文末における全角スペースなしの場合でもNGにはなりません。

---

## 逆説の「が」が複数回使用されている
寝坊したが、いつもより遅い電車に乗ったが、幸い間に合った。

## 誤った固有名詞の使用
ビッグカメラに寄った後、東京ビックサイトに行った

## 誤った慣用表現
取り付く暇もない

---
補足：検出される間違いやすい慣用表現や誤字については[ics-creative/textlint-rule-preset-icsmedia](https://github.com/ics-creative/textlint-rule-preset-icsmedia/blob/master/dict/prh_idiom.yml)に記載されています。

---

## 康煕部首に含まれる漢字が使われている
道具を⽤いた

---
補足：康煕部首はUnicodeのブロックに存在する漢字の部首を表す文字です。一部の部首が普段使う漢字と**非常によく似ている**ため紛れ込んでいると区別がつきづらいです。文字化けや検索に引っかからないなどの不具合を引き起こす恐れがあるのでテキスト校正くんでは検出しています。

---

## 全角の算用数字の使用
１月１日

## 誤った算用数字と漢数字の使用
第3者の意見を一か月後にヒアリングします

## 重言の使用
馬から落馬する

## 助詞の連続使用
旅行先で怪我で病院に運ばれた

---
注：初期設定ではオフにしています。プラグインの設定より有効にできます。

---

## 冗長な表現の使用
提供することができます

## 制御文字の使用


---
補足：ウェブサイト上だと制御文字は文字化けしてしまうので、こちらのマークダウンファイルをダウンロードしてご確認ください。

---

## 全角文字同士の間にスペースが使用されている
ここには山 川がある

## 全角文字と半角文字の間にスペースが使用されている
成田空港から Los Angelsに向かった

## 読点が1つの文中に4回以上使用されている
私は、しかし、どんな理由があろうとも、とにかく、見たかった。

## 二重否定の使用
できなくもない

## 不自然な濁点の使用
エンシ゛ンの不調
