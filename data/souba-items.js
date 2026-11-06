/*
 * 建材相場ボード（souba.html）の品目データ
 *
 * - price … 相場の目安（公開情報から。地域・規格・時点つき）。載せない品目は priceNote に一言
 * - trend … 過去の動向に使う日銀の指数（系列コード）。数字は data/souba-trends.js（自動生成）
 * - memo  … 「動きのポイント」。改行で段落を分ける
 * 更新のしかたは data/README.md を参照
 */
window.KONYLOG_SOUBA = {
  checkedAt: '2026-11-06',
  categories: [
    { id: 'concrete', label: 'コンクリート・骨材' },
    { id: 'steel', label: '鉄・鋼材' },
    { id: 'nonferrous', label: '銅・アルミ・電線' },
    { id: 'wood', label: '木材・合板' },
    { id: 'insulation', label: 'ウレタン・断熱' },
    { id: 'plastic', label: 'プラスチック' },
    { id: 'finish', label: 'ガラス・内外装' },
    { id: 'fuel', label: 'アスファルト・燃料' },
    { id: 'misc', label: '混合・その他' }
  ],
  kinds: {
    buy: { label: '購入', short: '新材', desc: '新材を買うときの値段', priceLabel: '購入の相場目安', cls: 'bg-base-charcoal text-white', swatch: '#1E2229' },
    sell: { label: '買取', short: '売れる', desc: 'スクラップとして業者に売れる値段', priceLabel: '買取の相場目安', cls: 'bg-base-turquoise text-base-charcoal', swatch: '#00B4D8' },
    dispose: { label: '処分', short: '払う', desc: '処分場・中間処理施設に払う受入単価', priceLabel: '処分費の目安', cls: 'bg-base-mustard text-base-charcoal', swatch: '#F39C12' }
  },
  items: [
    /* ===== コンクリート・骨材 ===== */
    {
      id: 'namacon', cat: 'concrete', kind: 'buy',
      name: '生コンクリート', spec: '普通 21-18-20 など', keywords: ['生コン', 'コンクリート'],
      trend: { code: 'PRCG20_2200850010' },
      memo: '2021年まではほぼ横ばいでしたが、2022年からセメント・骨材・輸送費の値上がりを受けて各地の生コン協同組合が値上げを重ね、指数は過去最高を更新中です。\n地区ごとに価格がまったく違うので、実際の単価は地元の協組や工場に確認するのが確実です。'
    },
    {
      id: 'cement_op', cat: 'concrete', kind: 'buy',
      name: '普通ポルトランドセメント', spec: 'バラ（タンク車）', keywords: ['セメント', 'OPC'],
      trend: { code: 'PRCG20_2200850008' },
      memo: '焼成に使う石炭が2022年に高騰し、セメント各社の値上げが続きました。指数は2023年に約3割上がり、2025年10月に過去最高。2026年は横ばいです。'
    },
    {
      id: 'cement_bb', cat: 'concrete', kind: 'buy',
      name: '高炉セメントB種', spec: 'バラ（タンク車）', keywords: ['セメント', 'BB'],
      trend: { code: 'PRCG20_2200850009' },
      memo: '普通セメントとほぼ同じ動き。土木・公共工事でよく使われます。'
    },
    {
      id: 'saiseki', cat: 'concrete', kind: 'buy',
      name: '砕石', spec: 'C-40・RC-40（再生砕石）', keywords: ['クラッシャーラン', 'RC40', 'C40', '路盤'],
      trend: { code: 'PRCG20_2202150003', link: 'PRCG15_2202150004' },
      memo: '2022年までは横ばいに近い動きでしたが、燃料費・人件費・運賃の上昇で2023年ごろから値上がりが続き、2026年は前年比+10%と上げ足が速くなっています。\n再生砕石（RC-40）は新品の砕石（C-40）より安いのが一般的です。'
    },
    {
      id: 'suna', cat: 'concrete', kind: 'buy',
      name: '砂・砂利', spec: 'コンクリート用骨材', keywords: ['骨材', '細骨材', '山砂'],
      trend: { code: 'PRCG20_2202150002' },
      memo: '砕石と同じく2023年ごろから上がり続け、2026年は前年比+10%。運搬コストの上昇などが背景です。'
    },
    {
      id: 'con_niji', cat: 'concrete', kind: 'buy',
      name: 'コンクリート二次製品', spec: 'U字溝・側溝・境界ブロックなど', keywords: ['U字溝', '側溝', 'プレキャスト'],
      trend: { code: 'PRCG20_2200850013', label: '道路用コンクリート製品' },
      memo: 'セメント・鉄筋・輸送費の値上がりがそのまま響き、2022年以降ほぼ一本調子で上昇。2020年比+7割近くで、コンクリート系では上がり方が大きいグループです。'
    },
    {
      id: 'cb', cat: 'concrete', kind: 'buy',
      name: 'コンクリートブロック', spec: '建築用CB', keywords: ['CB', 'ブロック塀'],
      trend: { code: 'PRCG20_2200850012', link: 'PRCG15_2200850018' },
      memo: '2023年に大きく上がり、その後も年5〜7%のペースで値上がりしています。'
    },
    {
      id: 'alc', cat: 'concrete', kind: 'buy',
      name: 'ALCパネル', spec: '軽量気泡コンクリート', keywords: ['ALC', 'へーベル'],
      trend: { code: 'PRCG20_2200850016', label: '気泡コンクリート製品' },
      memo: 'コンクリート系の中では上げ幅が小さめ（2020年比+2割）。2025年末に一段上がりました。'
    },
    {
      id: 'd_con', cat: 'concrete', kind: 'dispose',
      name: 'コンクリートがら', spec: '無筋・有筋', keywords: ['コンガラ', 'がれき類', '処分費'],
      trend: { code: 'PRCS20_5202050003', label: '産業廃棄物処理（処分費全体）' },
      memo: '再生砕石の原料になるので、処分費は建設廃棄物の中では安い部類です。\nグラフは処分費全体（産業廃棄物処理）の指数で、2005年からずっと上がり続け、2023年以降は上げ幅が大きくなっています。'
    },

    /* ===== 鉄・鋼材 ===== */
    {
      id: 'tekkin', cat: 'steel', kind: 'buy',
      name: '異形棒鋼（鉄筋）', spec: 'SD295 D16 ベース', keywords: ['鉄筋', 'D13', 'D16', 'SD345'],
      trend: { code: 'PRCG20_2200950003', label: '小形棒鋼' },
      memo: '電炉で鉄スクラップから作るので、スクラップ価格と電気代の影響を強く受けます。2021〜2023年に急騰して2023年7月にピーク、2025年は需要の弱さで下がりましたが、2026年は再び上向きです。'
    },
    {
      id: 'h_kou', cat: 'steel', kind: 'buy',
      name: 'H形鋼', spec: 'SS400 ベースサイズ', keywords: ['H鋼', '形鋼', '鉄骨'],
      trend: { code: 'PRCG20_2200950002', label: '形鋼' },
      memo: '2021〜2022年に急上昇し、2024年5月にピーク。2025年にいったん下がり、2026年は前年比+7%と持ち直しています。'
    },
    {
      id: 'atsuita', cat: 'steel', kind: 'buy',
      name: '厚板', spec: 'SS400', keywords: ['鋼板', 'プレート', 'PL'],
      trend: { code: 'PRCG20_2200950005', label: '厚中板' },
      memo: '鉄鉱石・原料炭の高騰と円安で2022年9月にピーク（2020年の1.8倍）。その後は下がりましたが、まだ2020年比+6割の水準です。'
    },
    {
      id: 'netsuen', cat: 'steel', kind: 'buy',
      name: '熱延鋼板', spec: '黒皮', keywords: ['薄板', 'コイル', 'SPHC'],
      trend: { code: 'PRCG20_2200950006', label: '熱延広幅帯鋼' },
      memo: '2022年10月がピーク。その後はアジアの鋼材市況の軟化で下がり、2026年は2020年比+4割前後で横ばいです。'
    },
    {
      id: 'aen_mekki', cat: 'steel', kind: 'buy',
      name: '亜鉛めっき鋼板', spec: 'ガルバリウム鋼板を含む', keywords: ['ガルバ', 'トタン', 'カラー鋼板', '板金'],
      trend: { code: 'PRCG20_2200950019', link: 'PRCG15_2200950014' },
      memo: '屋根・外壁の板金やデッキプレートの材料。2022年10月をピークに少し下がり、いまは2020年比+5割前後で高止まりです。'
    },
    {
      id: 'keiryou', cat: 'steel', kind: 'buy',
      name: '軽量形鋼', spec: 'C形鋼など', keywords: ['Cチャン', 'リップ溝形鋼', '胴縁', '母屋'],
      trend: { code: 'PRCG20_2200950015' },
      memo: '2022年10月のピーク後もあまり下がらず、2020年比+6割台が続いています。'
    },
    {
      id: 'kakukan', cat: 'steel', kind: 'buy',
      name: '角形鋼管・鋼管', spec: 'STKR・BCR・ガス管など', keywords: ['角パイプ', 'コラム', '単管', 'STK'],
      trend: { code: 'PRCG20_2200950011', label: '普通鋼鋼管' },
      memo: '柱やフレームに使う角パイプ・鋼管。2022年以降じわじわ上がり続け、2026年9月が過去最高です。'
    },
    {
      id: 'sus304', cat: 'steel', kind: 'buy',
      name: 'ステンレス鋼板', spec: 'SUS304 2B（冷延）', keywords: ['ステンレス', 'SUS'],
      trend: { code: 'PRCG20_2200950016', label: 'ステンレス冷延鋼板' },
      memo: 'ステンレスはニッケルの相場と円相場で大きく動きます。2022年10月がピーク、2025年に下がったあと2026年は前年比+7%と再び上昇しています。'
    },
    {
      id: 'mesh', cat: 'steel', kind: 'buy',
      name: '溶接金網', spec: 'ワイヤーメッシュ', keywords: ['メッシュ', '金網'],
      trend: { code: 'PRCG20_2201150022', label: '金網' },
      memo: '土間コンの補強などに使うメッシュ。原料の線材の値上がりで2022年に急騰し、2026年8月に過去最高を更新しました。'
    },
    {
      id: 'bolt', cat: 'steel', kind: 'buy',
      name: 'ボルト・ナット', spec: '高力ボルト・アンカーなど', keywords: ['ボルト', 'HTB', 'アンカー'],
      trend: { code: 'PRCG20_2201150010' },
      memo: '鋼材ほどの乱高下はありませんが、2022年以降は毎年じわじわ値上がり。2026年9月が過去最高です。'
    },
    {
      id: 'fe_h2', cat: 'steel', kind: 'sell',
      name: '鉄スクラップ（H2）', spec: '厚さ3〜6mm未満の重量くず', keywords: ['鉄くず', 'スクラップ', 'H2', 'ヘビー'],
      trend: { code: 'PRCG20_2202350002', label: '鉄屑' },
      memo: '鉄スクラップは建材の中でも値動きが激しい品目です。2008年（リーマン・ショック前）と2022年に大きな山があり、2026年は年初から上がったあと夏以降は下げています。\n解体や現場で出る鉄くずは、まとまった量なら買取価格が上がっているタイミングで出すと有利です。'
    },
    {
      id: 'sus_scrap', cat: 'steel', kind: 'sell',
      name: 'ステンレスくず', spec: 'SUS304', keywords: ['ステンレス', 'SUS', 'スクラップ'],
      trend: { code: 'PRCG20_2600350017', proxy: true, label: 'ニッケル地金（輸入物価）' },
      memo: 'ステンレスくずの値段は、含まれるニッケルの相場（と円相場）でほぼ決まります。'
    },

    /* ===== 銅・アルミ・電線 ===== */
    {
      id: 'copper', cat: 'nonferrous', kind: 'buy',
      name: '電気銅（銅建値）', spec: '国内の銅地金の基準価格', keywords: ['銅', '建値', 'LME'],
      trend: { code: 'PRCG20_2201050001', label: '銅' },
      memo: '2020年春の底から上がり続け、2026年は過去最高を更新しています（2020年平均の約3.4倍）。電線・配管・設備機器の価格にそのまま響く、いま一番注意したい品目です。'
    },
    {
      id: 'densen', cat: 'nonferrous', kind: 'buy',
      name: '電線・ケーブル', spec: 'CV・VVF・IVなど', keywords: ['電線', 'ケーブル', 'VVF', 'CV'],
      trend: { code: 'PRCG20_2201050008', label: 'プラスチック被覆銅線' },
      memo: '電線は銅の値段に連動して値決めされるので、銅の高騰がそのまま効いています。指数は2026年9月に過去最高（2020年の3倍超）。電気設備の見積りは有効期限を短めにしておくと安心です。'
    },
    {
      id: 'alsash', cat: 'nonferrous', kind: 'buy',
      name: 'アルミサッシ', spec: '住宅・ビル用', keywords: ['サッシ', 'アルミ', '窓'],
      trend: { code: 'PRCG20_2201150003', label: 'アルミニウムサッシ' },
      memo: 'アルミ地金や副資材・物流費の上昇を受けて、サッシメーカーが2022年以降たびたび値上げ。2020年比+4割で過去最高圏です。'
    },
    {
      id: 'cu_pika', cat: 'nonferrous', kind: 'sell',
      name: '銅スクラップ（ピカ線）', spec: '1号銅線（被覆をむいた光った銅線）', keywords: ['銅', 'ピカ線', '1号銅線', 'スクラップ'],
      trend: { code: 'PRCG20_2202350003', label: '銅・アルミニウム屑' },
      memo: '銅スクラップの値段は銅相場とほぼ連動します。指数（銅・アルミ屑）は2026年6月に過去最高をつけたあと、夏にかけて1割ほど下げました。\nピカ線は銅スクラップの中で一番高く売れます。'
    },
    {
      id: 'cu_komi', cat: 'nonferrous', kind: 'sell',
      name: '銅スクラップ（込銅・並銅）', spec: '付着物のある銅くず・銅管など', keywords: ['銅', '込銅', '並銅', '上銅', '銅管'],
      trend: { code: 'PRCG20_2202350003', label: '銅・アルミニウム屑' },
      memo: '油・塗装・ハンダなどが付いた銅くずや銅管。ピカ線より安くなりますが、値動きは銅相場と同じです。'
    },
    {
      id: 'brass', cat: 'nonferrous', kind: 'sell',
      name: '真鍮スクラップ', spec: '黄銅（水栓金具・バルブなど）', keywords: ['真鍮', '黄銅', 'スクラップ'],
      trend: { code: 'PRCG20_2202350003', label: '銅・アルミニウム屑' },
      memo: '真鍮は銅と亜鉛の合金。銅相場に引っぱられて高値圏です。'
    },
    {
      id: 'zatsusen', cat: 'nonferrous', kind: 'sell',
      name: '被覆電線スクラップ', spec: '雑線・VVF・CVなど', keywords: ['雑線', '電線', 'VA線', 'スクラップ'],
      trend: { code: 'PRCG20_2202350003', label: '銅・アルミニウム屑' },
      memo: '被覆付きの電線は、中の銅の割合（銅率）で値段が決まります。一般に太い線ほど銅率が高く、高く売れます。'
    },
    {
      id: 'al_scrap', cat: 'nonferrous', kind: 'sell',
      name: 'アルミスクラップ', spec: 'サッシくずなど', keywords: ['アルミ', 'サッシ', 'スクラップ'],
      trend: { code: 'PRCG20_2201050003', proxy: true, label: 'アルミニウム合金・同二次合金地金' },
      memo: 'アルミサッシなどのくずは、再生アルミ（二次合金地金）の原料になります。指数は2026年7月に過去最高をつけました。'
    },

    /* ===== 木材・合板 ===== */
    {
      id: 'kouzou_gouhan', cat: 'wood', kind: 'buy',
      name: '構造用合板', spec: '針葉樹 特類2級 12mm 910×1820', keywords: ['合板', '針葉樹合板', 'ベニヤ', '構造用'],
      price: { low: 1540, high: 1700, unit: '円/枚', basis: '主要9都市の市況（東京1,540円）・経済調査会調べ', asOf: '2026-10', tax: '税抜' },
      history: [
        { label: '2020年', text: '平均 約1,250円/枚（針葉樹合板12mm・全国平均・税込、農水省。以下同じ）' },
        { label: '2022年7月', text: '約2,360円/枚（過去最高）' },
        { label: '2025年', text: '平均 約1,410円/枚' },
        { label: '2026年9月', text: '約1,820円/枚（1月の1,400円から約3割上昇）' }
      ],
      trend: { code: 'PRCG20_2200350005', label: '普通合板' },
      memo: 'ウッドショック後の2022年7月に過去最高をつけ、2024〜25年はほぼ元の水準まで下がりました。\n2026年は年初から約3割の急上昇。業界紙では、中東情勢による接着剤原料の不安などが理由に挙げられています。',
      sources: [
        { label: '経済調査会「積算資料」市況（けんせつPlaza）主要資材の市況・価格推移【東京】2026年10月上旬調べ', url: 'https://www.kensetsu-plaza.com/market/a3' },
        { label: '農林水産省「木材価格統計調査」統計表（e-Stat、2026年9月分）', url: 'https://www.e-stat.go.jp/stat-search/files/data?sinfid=000040386452&ext=xls' }
      ]
    },
    {
      id: 'konpane', cat: 'wood', kind: 'buy',
      name: 'コンパネ（型枠用合板）', spec: '無塗装ラワン 12mm 900×1800', keywords: ['コンパネ', '型枠', '合板', 'パネコート'],
      price: { low: 1870, high: 2000, unit: '円/枚', basis: '主要10都市の市況（東京1,870円）・経済調査会調べ', asOf: '2026-10', tax: '税抜' },
      history: [
        { label: '2025年11月', text: '東京 約1,760円/枚' },
        { label: '2026年7月', text: '東京 約1,870円/枚（その後は横ばい）' }
      ],
      trend: { code: 'PRCG20_2600450002', label: '合板（輸入物価）' },
      memo: 'コンパネの多くはマレーシアなどからの輸入品です。グラフは輸入合板の指数で、2022年7月に2020年の2.3倍まで急騰し、いまも2020年比+9割近い水準です。',
      sources: [
        { label: '経済調査会「積算資料」市況（けんせつPlaza）コンクリート型枠用合板【東京】2026年10月上旬調べ', url: 'https://www.kensetsu-plaza.com/market/a3/120' }
      ]
    },
    {
      id: 'sugi_kaku', cat: 'wood', kind: 'buy',
      name: '杉 正角（KD）', spec: '10.5cm角 3m 2級', keywords: ['杉', 'スギ', '柱', '角材', '乾燥材'],
      price: { low: 79800, high: 79800, unit: '円/m³', basis: '全国平均・木材市場や問屋の販売価格（1本あたり約2,640円）', asOf: '2026-10', tax: '税込' },
      history: [
        { label: '2020年', text: '平均 66,700円/m³' },
        { label: '2021年10月', text: '135,500円/m³（ウッドショックのピーク）' },
        { label: '2023年', text: '平均 94,600円/m³' },
        { label: '2025年', text: '平均 76,500円/m³（2025年から調査対象が変わり、厳密には前年以前とつながりません）' },
        { label: '参考', text: '東京の市況 75,000円/m³（特1等・税抜、経済調査会 2026年10月）' }
      ],
      trend: { code: 'PRCG20_2200350003', label: 'ひき角' },
      memo: 'ウッドショックで2021年10〜11月に2020年の約2倍まで上がりました。その後は落ち着き、2023年以降は2020年比+3割前後で推移しています。',
      sources: [
        { label: '農林水産省「木材価格（令和8年10月）」2026年11月5日公表（PDF）', url: 'https://www.maff.go.jp/j/tokei/kouhyou/mokuryu/kakaku/pdf/mokuzai_kakaku_2610.pdf' },
        { label: '農林水産省「木材価格統計調査」統計表（e-Stat、2026年10月分）', url: 'https://www.e-stat.go.jp/stat-search/files/data?sinfid=000040386453&ext=xls' }
      ]
    },
    {
      id: 'hinoki_kaku', cat: 'wood', kind: 'buy',
      name: '桧 正角（KD）', spec: '10.5cm角 3m 2級（土台など）', keywords: ['桧', 'ヒノキ', '土台', '角材', '乾燥材'],
      price: { low: 95600, high: 95600, unit: '円/m³', basis: '全国平均・木材市場や問屋の販売価格（1本あたり約3,160円）', asOf: '2026-10', tax: '税込' },
      history: [
        { label: '2020年', text: '平均 85,500円/m³' },
        { label: '2021年11月', text: '179,000円/m³（ウッドショックのピーク）' },
        { label: '2023年', text: '平均 110,700円/m³' },
        { label: '2025年', text: '平均 95,700円/m³' },
        { label: '4m材', text: '98,800円/m³（長さ3.65〜4.0m、2026年9月）' }
      ],
      trend: { code: 'PRCG20_2200350003', label: 'ひき角' },
      memo: '土台などに使うヒノキ。ウッドショック時は2021年11月に2020年の2倍超まで上がり、いまはほぼ2020年の1.1倍に戻っています。グラフは杉と同じ「ひき角」（国産の角材）の指数です。',
      sources: [
        { label: '農林水産省「木材価格（令和8年10月）」2026年11月5日公表（PDF）', url: 'https://www.maff.go.jp/j/tokei/kouhyou/mokuryu/kakaku/pdf/mokuzai_kakaku_2610.pdf' },
        { label: '農林水産省「木材価格統計調査」統計表（e-Stat、2026年10月分）', url: 'https://www.e-stat.go.jp/stat-search/files/data?sinfid=000040386453&ext=xls' }
      ]
    },
    {
      id: 'shuseki', cat: 'wood', kind: 'buy',
      name: '集成管柱', spec: 'ホワイトウッド 10.5cm角 3m', keywords: ['集成材', '管柱', 'ホワイトウッド', 'WW'],
      price: { low: 3300, high: 3300, unit: '円/本', basis: '全国平均・集成材工場の出荷価格（m³換算 約10万円）', asOf: '2026-10', tax: '税込' },
      history: [
        { label: '2020年', text: '平均 2,000円/本' },
        { label: '2022年1〜2月', text: '5,200円/本（過去最高）' },
        { label: '2023年', text: '平均 2,700円/本' },
        { label: '2025年', text: '平均 2,800円/本' }
      ],
      trend: { code: 'PRCG20_2200350007', label: '集成材' },
      memo: '輸入のラミナ（ホワイトウッドなど）を使う集成材はウッドショックの影響が一番大きく、指数は2021年11月に2020年の2.7倍。2023〜25年は2,700〜2,800円/本で落ち着いていましたが、2026年に入って3,300円/本まで上がっています。',
      sources: [
        { label: '農林水産省「木材価格統計調査」統計表（e-Stat、2026年10月分）', url: 'https://www.e-stat.go.jp/stat-search/files/data?sinfid=000040386453&ext=xls' },
        { label: '林野庁「モクレポ」2026年10月号（m³換算の参考）', url: 'https://www.rinya.maff.go.jp/j/kikaku/toukei/attach/pdf/monthlyreport-151.pdf' }
      ]
    },
    {
      id: 'mabashira', cat: 'wood', kind: 'buy',
      name: '間柱', spec: '杉KD 3.0×10.5cm 3m 特等', keywords: ['間柱', '垂木', '杉', 'ひき割', '乾燥材'],
      price: { low: 88600, high: 88600, unit: '円/m³', basis: '全国平均・木材市場や問屋の販売価格（1本あたり約840円）', asOf: '2026-10', tax: '税込' },
      history: [
        { label: '2020年', text: '平均 66,300円/m³' },
        { label: '2021年11月', text: '129,000円/m³（ウッドショックのピーク）' },
        { label: '2023年', text: '平均 92,600円/m³' },
        { label: '2025年', text: '平均 83,900円/m³' }
      ],
      trend: { code: 'PRCG20_2200350002', label: 'ひき割' },
      memo: '間柱・垂木などの「ひき割」は2021年10月がピーク。2023年以降は2020年比+5割前後で安定していて、2026年はじわじわ上向きです。',
      sources: [
        { label: '農林水産省「木材価格統計調査」統計表（e-Stat、2026年10月分）', url: 'https://www.e-stat.go.jp/stat-search/files/data?sinfid=000040386453&ext=xls' }
      ]
    },
    {
      id: 'beimatsu', cat: 'wood', kind: 'buy',
      name: '米松 平角（KD）', spec: '4m×10.5(12)×15〜24cm 特1等', keywords: ['米松', 'ベイマツ', '梁', '平角', '輸入材'],
      price: { low: 90000, high: 95000, unit: '円/m³', basis: '主要8都市の市況（東京90,000円）・経済調査会調べ', asOf: '2026-10', tax: '税抜' },
      history: [
        { label: '2020年', text: '平均 63,400円/m³（農水省・2級。規格・調べ方が違うので参考）' },
        { label: '2021年12月', text: '120,900円/m³（同上・ウッドショック期）' }
      ],
      trend: { code: 'PRCG20_2600450001', label: '製材（輸入物価）' },
      memo: '梁などに使う米松は輸入製材。グラフ（輸入製材の指数）は2021年10月に2020年の2.6倍まで急騰し、いまは2020年比+6割台です。',
      sources: [
        { label: '経済調査会「積算資料」市況（けんせつPlaza）米松平角材(KD)【東京】2026年10月上旬調べ', url: 'https://www.kensetsu-plaza.com/market/a3/150' }
      ]
    },
    {
      id: 'flooring', cat: 'wood', kind: 'buy',
      name: 'フローリング', spec: '複合フローリングなど', keywords: ['床材', 'フローリング'],
      priceNote: '品番ごとの差が大きいので価格は非掲載。2026年6〜7月に大手が15%前後の値上げ',
      trend: { code: 'PRCG20_2200350011', label: '床板' },
      memo: 'ウッドショックの影響は小さめでしたが、2022〜23年の値上げで2020年比+3割の水準に。\n2026年は中東情勢による原材料・エネルギー・物流費の上昇を理由に、DAIKEN・永大産業（15%）、朝日ウッドテック（15〜20%）などが6〜7月に値上げしています。',
      sources: [
        { label: 'DAIKEN「中東情勢影響に伴う当社製品の仕切価格改定について」2026年5月', url: 'https://www.daiken.jp/news/detail/20260522072512.html' },
        { label: '永大産業「カタログ掲載価格の改定のお知らせ」2026年5月', url: 'https://www.eidai.com/news/backnumber/news20260518.html' },
        { label: '朝日ウッドテック「全製品販売価格の改定を実施」', url: 'https://www.woodtec.co.jp/news/10913/' }
      ]
    },
    {
      id: 'd_wood', cat: 'wood', kind: 'dispose',
      name: '木くず', spec: '建設発生木材', keywords: ['木くず', '廃材', '処分費'],
      trend: { code: 'PRCS20_5202050003', label: '産業廃棄物処理（処分費全体）' },
      memo: 'チップにして燃料などに再利用されるため、処分費は混合廃棄物より安めです。グラフは処分費全体の指数です。'
    },

    /* ===== ウレタン・断熱 ===== */
    {
      id: 'urethane_board', cat: 'insulation', kind: 'buy',
      name: '硬質ウレタンフォーム断熱材', spec: 'ボード品', keywords: ['ウレタン', '断熱材', '発泡'],
      trend: { code: 'PRCG20_2200750011', label: '硬質プラスチック発泡製品' },
      memo: '硬質ウレタンやポリスチレンフォームなど「硬質プラスチック発泡製品」の指数です。2025年までは年5%前後の上昇でしたが、2026年は前年比+27%と急上昇しています。'
    },
    {
      id: 'urethane_spray', cat: 'insulation', kind: 'buy',
      name: '吹付け硬質ウレタン', spec: '現場発泡（材工）', keywords: ['ウレタン', '吹付', '断熱', '発泡'],
      trend: { code: 'PRCG20_2200550014', proxy: true, label: '酸化プロピレン・ポリプロピレングリコール' },
      memo: '吹付けウレタンの値段は、原料（ポリオールとイソシアネート）と施工費で決まります。グラフはポリオール原料の指数で、2026年5月に急騰したあと反落しました。'
    },
    {
      id: 'glasswool', cat: 'insulation', kind: 'buy',
      name: 'グラスウール断熱材', spec: '住宅用・ビル用', keywords: ['グラスウール', '断熱材'],
      trend: { code: 'PRCG20_2200850005', label: 'ガラス繊維・同製品' },
      memo: 'ガラスを溶かす燃料・電気の値上がりで、2022年以降メーカーの値上げが続きました。2020年比+4割の水準です。'
    },

    /* ===== プラスチック ===== */
    {
      id: 'enbi_kan', cat: 'plastic', kind: 'buy',
      name: '塩ビ管', spec: 'VP・VU', keywords: ['塩ビ', 'VP', 'VU', '排水管'],
      trend: { code: 'PRCG20_2200750002', label: 'プラスチック管' },
      memo: '塩ビ管は原料の塩ビ樹脂の値段で動きます。2022年に約3割上がり、2026年に入ってさらに上昇して過去最高（2020年比+8割）です。'
    },
    {
      id: 'enbi_tsugite', cat: 'plastic', kind: 'buy',
      name: '塩ビ継手', spec: 'DV・TS継手など', keywords: ['継手', 'エルボ', 'チーズ', '塩ビ'],
      trend: { code: 'PRCG20_2200750003', label: 'プラスチック継手' },
      memo: '継手も管と同じく塩ビ樹脂の値上がりで上昇。2026年5月に過去最高をつけています。'
    },
    {
      id: 'amadoi', cat: 'plastic', kind: 'buy',
      name: '雨どい', spec: '塩ビ製', keywords: ['雨樋', '雨どい', '軒どい'],
      trend: { code: 'PRCG20_2200750004', label: 'プラスチック雨どい' },
      memo: '2026年に入って急に上がり（前年比+17%）、過去最高です。'
    },
    {
      id: 'sheet', cat: 'plastic', kind: 'buy',
      name: 'ブルーシート・養生シート', spec: 'PEシート・養生フィルムなど', keywords: ['ブルーシート', '養生', 'シート', 'ビニール'],
      trend: { code: 'PRCG20_2200750005', label: 'プラスチックフィルム・シート' },
      memo: 'プラスチックフィルム・シートの指数です。2026年に入って急上昇（前年比+18%）しました。'
    },
    {
      id: 'yuka', cat: 'plastic', kind: 'buy',
      name: '塩ビ床材', spec: '長尺シート・塩ビタイル', keywords: ['長尺シート', 'Pタイル', 'フロアタイル', 'CF'],
      trend: { code: 'PRCG20_2200750006', label: 'プラスチック床材' },
      memo: '2026年夏以降に大きく上がり、3か月で+17%。過去最高です。'
    },
    {
      id: 'pvc_resin', cat: 'plastic', kind: 'buy',
      name: '塩ビ樹脂（原料）', spec: 'PVC', keywords: ['塩ビ', 'PVC', '樹脂'],
      trend: { code: 'PRCG20_2200550025', label: '塩化ビニル樹脂' },
      memo: '塩ビ管・雨どい・床材などの原料。2022年に大きく上がり、2026年7月に過去最高を更新しました。'
    },
    {
      id: 'naphtha', cat: 'plastic', kind: 'buy',
      name: 'ナフサ（プラの原料）', spec: '国産ナフサ', keywords: ['ナフサ', '原油', '石油化学'],
      trend: { code: 'PRCG20_2200650002', label: 'ナフサ' },
      memo: 'プラスチック・塩ビ・ウレタンなどの大もとの原料で、原油相場と円相場で動きます。2026年6月に過去最高をつけたあと急に下がりました（3か月で−21%）。\n原料の値動きは、数か月遅れて製品の価格に表れることが多いです。'
    },
    {
      id: 'd_plastic', cat: 'plastic', kind: 'dispose',
      name: '廃プラスチック', spec: '建設系（梱包材・端材など）', keywords: ['廃プラ', '処分費'],
      trend: { code: 'PRCS20_5202050003', label: '産業廃棄物処理（処分費全体）' },
      memo: '2017年末に中国が廃プラの輸入を止めてから国内処理が増え、受入単価が上がった品目です。グラフは処分費全体の指数です。'
    },

    /* ===== ガラス・内外装 ===== */
    {
      id: 'sekkou', cat: 'finish', kind: 'buy',
      name: '石膏ボード', spec: '12.5mm 3×6', keywords: ['PB', 'プラスターボード', 'ボード'],
      trend: { code: 'PRCG20_2200850021', link: 'PRCG15_2200850036', label: '石こうボード・粘土かわら' },
      memo: '原料・燃料の値上がりで2022年以降ほぼ毎年値上げ。指数は2026年9月に過去最高（2020年比+7割）です。※指数は粘土瓦と合わせたものです。'
    },
    {
      id: 'glass', cat: 'finish', kind: 'buy',
      name: '板ガラス', spec: 'フロート板ガラス', keywords: ['ガラス', 'FL'],
      trend: { code: 'PRCG20_2200850001', link: 'PRCG15_2200850001' },
      memo: '燃料費の高騰を受けて2022年以降ガラス各社が値上げ。2020年比+3割の水準です。'
    },
    {
      id: 'pair_glass', cat: 'finish', kind: 'buy',
      name: '複層ガラス', spec: 'ペアガラス', keywords: ['ペアガラス', 'Low-E', '断熱'],
      trend: { code: 'PRCG20_2200850004' },
      memo: '2023年に大きく上がり（前年比+23%）、その後も高い水準が続いています。'
    },
    {
      id: 'siding', cat: 'finish', kind: 'buy',
      name: '窯業系サイディング', spec: '外壁材', keywords: ['サイディング', '外壁'],
      trend: { code: 'PRCG20_2200850015', label: '窯業外装材' },
      memo: '外壁材のサイディングは上げ幅が小さめ（2020年比+2割）です。'
    },
    {
      id: 'toki', cat: 'finish', kind: 'buy',
      name: '衛生陶器', spec: '便器・洗面器など', keywords: ['トイレ', '便器', '洗面器'],
      trend: { code: 'PRCG20_2200850017' },
      memo: '2023年以降、年5〜7%ずつ値上がりしています。'
    },
    {
      id: 'paint', cat: 'finish', kind: 'buy',
      name: '塗料', spec: '合成樹脂塗料', keywords: ['ペンキ', '塗装', '塗料'],
      trend: { code: 'PRCG20_2200550042', label: '合成樹脂塗料' },
      memo: '樹脂や溶剤の値上がりで2022〜23年に上がり、2026年に入って再び上昇（前年比+10%）しています。'
    },
    {
      id: 'd_gypsum', cat: 'finish', kind: 'dispose',
      name: '廃石膏ボード', spec: '新築端材・解体材', keywords: ['石膏ボード', 'PB', '処分費'],
      trend: { code: 'PRCS20_5202050003', label: '産業廃棄物処理（処分費全体）' },
      memo: '廃石膏ボードは安定型処分場に埋められず、管理型での処分が必要なため処分費は高めです。新築端材はリサイクル（再生石膏）に回すルートも増えています。'
    },

    /* ===== アスファルト・燃料 ===== */
    {
      id: 'asphalt', cat: 'fuel', kind: 'buy',
      name: 'アスファルト', spec: 'ストレートアスファルト', keywords: ['アスファルト', 'ストアス', '舗装', '合材'],
      trend: { code: 'PRCG20_2200650009' },
      memo: '道路舗装に使うアスファルトは原油価格に連動。2022年に急騰し、2026年5月に過去最高をつけたあと少し下がっています。'
    },
    {
      id: 'keiyu', cat: 'fuel', kind: 'buy',
      name: '軽油', spec: '重機・ダンプの燃料', keywords: ['軽油', '燃料', 'ディーゼル'],
      trend: { code: 'PRCG20_2200650005' },
      memo: '原油と円相場で動きます。指数（企業間の取引価格）は2026年6月に過去最高をつけました。'
    },
    {
      id: 'd_as', cat: 'fuel', kind: 'dispose',
      name: 'アスファルトがら', spec: 'アスコン塊', keywords: ['アスガラ', 'がれき類', '処分費'],
      trend: { code: 'PRCS20_5202050003', label: '産業廃棄物処理（処分費全体）' },
      memo: '再生アスファルト合材の原料になるため、処分費は比較的安めです。グラフは処分費全体の指数です。'
    },

    /* ===== 混合・その他 ===== */
    {
      id: 'd_mixed', cat: 'misc', kind: 'dispose',
      name: '建設混合廃棄物', spec: '分別していない廃棄物', keywords: ['混廃', '混合', '処分費'],
      trend: { code: 'PRCS20_5202050003', label: '産業廃棄物処理（処分費全体）' },
      memo: '分別されていない混合廃棄物は処分費がいちばん高くなります。現場で分別するほど処分費は下がります。'
    },
    {
      id: 'koshi', cat: 'misc', kind: 'sell',
      name: '段ボール（古紙）', spec: '梱包材の段ボール', keywords: ['段ボール', '古紙'],
      trend: { code: 'PRCG20_2202350001', label: '古紙' },
      memo: '指数は2020年比+2割でほぼ横ばいです。現場で出た段ボールは、古紙回収業者に無料か少額の買取で引き取ってもらえることが多いです。'
    }
  ]
};
