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
      name: 'コンクリートがら', spec: '無筋・有筋（中間処理施設への持込）', keywords: ['コンガラ', 'がれき類', '処分費', 'コン塊'],
      price: { low: 1200, high: 5250, unit: '円/t', basis: '5府県（青森・秋田・広島・兵庫・大阪）が公表する施設ごとの受入単価。運搬費は別', asOf: '2026-11-01' },
      history: [
        { label: '無筋', text: '府県ごとの中央値 1,500〜3,000円/t（広島県 1,700円/t）' },
        { label: '有筋', text: '府県ごとの中央値 2,000〜4,000円/t' },
        { label: '横浜市', text: '市発注工事の指定単価 無筋 9,400円/m³・有筋 12,500円/m³' },
        { label: '値上がり', text: '兵庫県では2025年4月→2026年11月に87施設中38施設が値上げ（値下げは0）' }
      ],
      trend: { code: 'PRCS20_5202050003', label: '産業廃棄物処理（処分費全体）' },
      memo: '再生砕石の原料になるので、処分費は建設廃棄物の中では安い部類です。ただし地域差が大きく、大塊・二次製品・夜間休日は割増になるのが一般的です。\nグラフは処分費全体（産業廃棄物処理）の指数で、2005年からずっと上がり続け、2023年以降は上げ幅が大きくなっています。',
      sources: [ { label: '兵庫県「建設副産物の処理ならびに受入価格」2026年11月1日適用（PDF）', url: 'https://web.pref.hyogo.lg.jp/ks04/documents/fukusanbutsu081101.pdf' }, { label: '広島県「再資源化施設一覧表（コンクリート塊・アスファルトコンクリート塊）」2026年7月一部改定（PDF）', url: 'https://chotatsu.pref.hiroshima.lg.jp/estimate/k20/k20hukusann/coas202607hiru.pdf' }, { label: '青森県「建設廃棄物再資源化施設受入料金」2026年10月1日以降適用（PDF）', url: 'https://www.pref.aomori.lg.jp/soshiki/kendo/seibikikaku/files/04_R081001syobun.pdf' }, { label: '大阪府「建設廃棄物等受入価格 調査報告書」2026年2月1日適用（PDF）', url: 'https://www.pref.osaka.lg.jp/documents/106060/r7simohankikensetuhakibutu.pdf' }, { label: '横浜市「土木工事資材等単価表」2026年11月版（PDF）', url: 'https://www.city.yokohama.lg.jp/business/bunyabetsu/doro-kasen/doro/kanri/hyojunzu/tanka.files/0169_20261026.pdf' } ]
    },

    /* ===== 鉄・鋼材 ===== */
    {
      id: 'tekkin', cat: 'steel', kind: 'buy',
      name: '異形棒鋼（鉄筋）', spec: 'SD295 D16〜D25 ベース', keywords: ['鉄筋', 'D13', 'D16', 'SD345', '異形'],
      price: { low: 114000, high: 117000, unit: '円/t', basis: '東京の問屋相場・現場直送（業界紙2紙）', asOf: '2026-11-05' },
      history: [
        { label: '2020年1月', text: '約68,000円/t（東京、日刊産業新聞）' },
        { label: '2022〜23年', text: '約120,000円/t（2022年5月〜2023年7月の高値）' },
        { label: '2025年10月', text: '約104,000円/t' },
        { label: 'メーカー', text: '東京製鐵の11月販売価格 96,000円/t（D13〜D25、前月比+3,000円）' }
      ],
      trend: { code: 'PRCG20_2200950003', label: '小形棒鋼' },
      memo: '電炉で鉄スクラップから作るので、スクラップ価格と電気代の影響を強く受けます。2022〜23年に高値をつけ、2025年は需要の弱さで下がりましたが、2026年はスクラップ高を受けて再び上向きです。\n店の在庫から買う「店売り」は直送より2割ほど高め（東京で134,000〜138,000円/t）です。',
      sources: [ { label: '日刊鉄鋼新聞「最新市場価格」（東京・問屋仲間相場）', url: 'https://www.japanmetaldaily.com/list/market/details' }, { label: '日刊産業新聞「鉄鋼市場価格」（東京）', url: 'https://www.japanmetal.com/iron-steel-price' }, { label: '東京製鐵「2026年11月 販売価格表（建材）」10月19日発表（PDF）', url: 'https://www.tokyosteel.co.jp/assets/docs/salesprice/kenzai.pdf' } ]
    },
    {
      id: 'h_kou', cat: 'steel', kind: 'buy',
      name: 'H形鋼', spec: '細幅 200×100 ベース', keywords: ['H鋼', '形鋼', '鉄骨', 'SS400'],
      price: { low: 120000, high: 123000, unit: '円/t', basis: '東京の問屋相場・置き場渡し（業界紙2紙）', asOf: '2026-11-05' },
      history: [
        { label: '2020年1月', text: '約81,000〜83,000円/t' },
        { label: '2023年7月', text: '約126,000円/t（高値）' },
        { label: '2025年10月', text: '約114,000円/t' },
        { label: 'メーカー', text: '東京製鐵の11月販売価格 119,000円/t（SS400ベース）' }
      ],
      trend: { code: 'PRCG20_2200950002', label: '形鋼' },
      memo: '2021〜2022年に急上昇し、指数は2024年5月にピーク。2025年にいったん下がり、2026年は持ち直して「上値を試す展開」と報じられています。',
      sources: [ { label: '日刊鉄鋼新聞「最新市場価格」（東京・問屋仲間相場）', url: 'https://www.japanmetaldaily.com/list/market/details' }, { label: '日刊産業新聞「鉄鋼市場価格」（東京）', url: 'https://www.japanmetal.com/iron-steel-price' }, { label: '東京製鐵「2026年11月 販売価格表（建材）」10月19日発表（PDF）', url: 'https://www.tokyosteel.co.jp/assets/docs/salesprice/kenzai.pdf' } ]
    },
    {
      id: 'atsuita', cat: 'steel', kind: 'buy',
      name: '厚板', spec: '16〜25mm 5×10', keywords: ['鋼板', 'プレート', 'PL', '厚板'],
      price: { low: 134000, high: 137000, unit: '円/t', basis: '東京の問屋相場・置き場渡し（業界紙2紙）', asOf: '2026-11-05' },
      history: [
        { label: '2020年1月', text: '約88,000円/t' },
        { label: '2022年8月', text: '約146,000円/t（高値）' },
        { label: 'メーカー', text: '東京製鐵の11月販売価格 113,000円/t（SS400、9〜40mm）' }
      ],
      trend: { code: 'PRCG20_2200950005', label: '厚中板' },
      memo: '鉄鉱石・原料炭の高騰と円安で2022年にピーク（指数は2020年の1.8倍）。その後は下がりましたが、まだ2020年比+6割の水準です。',
      sources: [ { label: '日刊鉄鋼新聞「最新市場価格」（東京・問屋仲間相場）', url: 'https://www.japanmetaldaily.com/list/market/details' }, { label: '日刊産業新聞「鉄鋼市場価格」（東京）', url: 'https://www.japanmetal.com/iron-steel-price' }, { label: '東京製鐵「2026年11月 販売価格表（建材）」10月19日発表（PDF）', url: 'https://www.tokyosteel.co.jp/assets/docs/salesprice/kenzai.pdf' } ]
    },
    {
      id: 'netsuen', cat: 'steel', kind: 'buy',
      name: '熱延鋼板', spec: '黒皮 1.6mm 4×8', keywords: ['薄板', 'コイル', 'SPHC', '黒皮'],
      price: { low: 107000, high: 110000, unit: '円/t', basis: '東京の問屋相場・置き場渡し（日刊鉄鋼新聞）', asOf: '2026-11-05' },
      history: [
        { label: '2020年1月', text: '約72,000〜74,000円/t' },
        { label: '2022年8月', text: '約134,000円/t（高値）' },
        { label: '2025年10月', text: '約101,000円/t' },
        { label: 'メーカー', text: '東京製鐵の11月販売価格 111,000〜113,000円/t（板厚1.6〜6.0mm）' }
      ],
      trend: { code: 'PRCG20_2200950006', label: '熱延広幅帯鋼' },
      memo: '指数は2022年10月がピーク。その後はアジアの鋼材市況の軟化で下がり、2026年は2020年比+4割前後で横ばいです。',
      sources: [ { label: '日刊鉄鋼新聞「最新市場価格」（東京・問屋仲間相場）', url: 'https://www.japanmetaldaily.com/list/market/details' }, { label: '日刊産業新聞「鉄鋼市場価格」（東京）', url: 'https://www.japanmetal.com/iron-steel-price' }, { label: '東京製鐵「2026年11月 販売価格表（鋼板）」（PDF）', url: 'https://www.tokyosteel.co.jp/assets/docs/salesprice/kouhan.pdf' } ]
    },
    {
      id: 'aen_mekki', cat: 'steel', kind: 'buy',
      name: '亜鉛めっき鋼板', spec: '溶融亜鉛めっき Z18 0.27mm 平板 3×6', keywords: ['ガルバ', 'トタン', 'カラー鋼板', '板金', '亜鉛鉄板'],
      price: { low: 240000, high: 242000, unit: '円/t', basis: '東京の問屋相場・置き場渡し（日刊鉄鋼新聞）。薄い板ほどトン単価は高くなります', asOf: '2026-11-05' },
      history: [
        { label: 'カラー鋼板', text: '小コイル0.35mm 334,000〜339,000円/t（2026年10月、東京）' },
        { label: 'メーカー', text: '東京製鐵のめっきコイル 141,000〜151,000円/t（11月、板厚別）' },
        { label: '同・推移', text: '2020年1月 96,000 → 2022年5月 158,000 → 2025年10月 127,000円/t（東京製鐵 T-ジンク 0.4〜0.6mm）' }
      ],
      trend: { code: 'PRCG20_2200950019', link: 'PRCG15_2200950014' },
      memo: '屋根・外壁の板金やデッキプレートの材料。指数は2022年10月をピークに少し下がり、いまは2020年比+5割前後。カラー鋼板は2026年秋に「一段高」と報じられています。',
      sources: [ { label: '日刊鉄鋼新聞「最新市場価格」（東京・問屋仲間相場）', url: 'https://www.japanmetaldaily.com/list/market/details' }, { label: '日刊鉄鋼新聞「東京／カラー鋼板／上昇基調、一段高へ」', url: 'https://www.japanmetaldaily.com/articles/-/268297' }, { label: '東京製鐵「2026年11月 販売価格表（鋼板）」（PDF）', url: 'https://www.tokyosteel.co.jp/assets/docs/salesprice/kouhan.pdf' } ]
    },
    {
      id: 'keiryou', cat: 'steel', kind: 'buy',
      name: '軽量形鋼', spec: 'C形鋼 2.3×100×50×20', keywords: ['Cチャン', 'リップ溝形鋼', '胴縁', '母屋', '軽量C'],
      price: { low: 174000, high: 193000, unit: '円/t', basis: '東京の問屋相場（日刊産業新聞 174,000円、日刊鉄鋼新聞 カラー品 190,000〜193,000円）', asOf: '2026-10-29' },
      history: [
        { label: '2020年', text: '約95,000円/t（東京、日刊産業新聞）' },
        { label: '2021年11月〜', text: '約169,000円/t（2026年6月まで同水準）' },
        { label: 'めっき品', text: '215,000〜217,000円/t（日刊鉄鋼新聞）' }
      ],
      trend: { code: 'PRCG20_2200950015' },
      memo: '指数は2022年10月がピーク。その後もあまり下がらず、2020年比+6割台が続いています。2026年7月に問屋相場が一段上がりました。',
      sources: [ { label: '日刊鉄鋼新聞（東京・軽量C形鋼の市況、2026年10月29日）', url: 'https://www.japanmetaldaily.com/articles/-/269646' }, { label: '日刊産業新聞「鉄鋼市場価格」（東京）', url: 'https://www.japanmetal.com/iron-steel-price' } ]
    },
    {
      id: 'kakukan', cat: 'steel', kind: 'buy',
      name: '角形鋼管（コラム）', spec: '大径角形鋼管・切断開先などの一次加工込み', keywords: ['角パイプ', 'コラム', 'BCR', 'STKR', '鋼管'],
      price: { low: 186000, high: 197000, unit: '円/t', basis: '東京の問屋相場・置き場（BCR 186,000〜187,000円、STKR 196,000〜197,000円）', asOf: '2026-11-06' },
      history: [
        { label: '中径角パイプ', text: '黒皮 2.3×100×100 195,000〜197,000円/t（11月、東京）' },
        { label: 'メーカー', text: '東京製鐵 トウテツコラム 131,000円/t（11月、一次加工なし）' },
        { label: '今後', text: '日鉄建材がコラムの12月契約で5,000円/t値上げを表明' }
      ],
      trend: { code: 'PRCG20_2200950011', label: '普通鋼鋼管' },
      memo: '柱やフレームに使う角パイプ・鋼管。指数は2022年以降じわじわ上がり続け、2026年9月が過去最高。コラムは「先高観が強まる」と報じられています。',
      sources: [ { label: '日刊鉄鋼新聞「東京／コラム／先高観強まる」2026年11月6日', url: 'https://www.japanmetaldaily.com/articles/-/270140' }, { label: '日刊鉄鋼新聞「東京／中径角形鋼管／高値寄り商状」', url: 'https://www.japanmetaldaily.com/articles/-/270048' }, { label: '東京製鐵「2026年11月 販売価格表（建材）」10月19日発表（PDF）', url: 'https://www.tokyosteel.co.jp/assets/docs/salesprice/kenzai.pdf' } ]
    },
    {
      id: 'sus304', cat: 'steel', kind: 'buy',
      name: 'ステンレス鋼板', spec: 'SUS304 冷延 2.0mm', keywords: ['ステンレス', 'SUS', '18-8'],
      price: { low: 620000, high: 630000, unit: '円/t', basis: '東京の問屋相場（業界紙2紙）。kgあたり620〜630円', asOf: '2026-11-05' },
      history: [
        { label: '2020年12月', text: '約37万円/t' },
        { label: '2022年9月', text: '約68万円/t（高値）' },
        { label: '2025年11月', text: '約56万円/t' }
      ],
      trend: { code: 'PRCG20_2200950016', label: 'ステンレス冷延鋼板' },
      memo: 'ステンレスはニッケルの相場と円相場で大きく動きます。2022年秋がピークで、2025年に下がったあと2026年は再び上昇。メーカーは8〜10月契約で店売り価格を引き下げていますが、問屋相場は62万円前後で強含みです。',
      sources: [ { label: '日刊鉄鋼新聞「最新市場価格」（東京・問屋仲間相場）', url: 'https://www.japanmetaldaily.com/list/market/details' }, { label: '日刊産業新聞「鉄鋼市場価格」（東京）', url: 'https://www.japanmetal.com/iron-steel-price' }, { label: '日刊鉄鋼新聞「東京／SUS304冷薄／強含み、需要堅調」', url: 'https://www.japanmetaldaily.com/articles/-/267835' } ]
    },
    {
      id: 'mesh', cat: 'steel', kind: 'buy',
      name: '溶接金網', spec: 'ワイヤーメッシュ', keywords: ['メッシュ', '金網', '土間'],
      priceNote: '規格の差が大きく公開の相場が見当たらないため非掲載。2026年5月出荷分から1万円/t以上の値上げ（ノブハラ）',
      trend: { code: 'PRCG20_2201150022', label: '金網' },
      memo: '土間コンの補強などに使うメッシュ。原料の線材の値上がりで2022年に急騰し、指数は2026年8月に過去最高を更新しました。',
      sources: [ { label: '日刊産業新聞「ノブハラ 溶接金網販価 1万円以上上げ 5月出荷から」', url: 'https://www.japanmetal.com/news-t20260402148324.html' } ]
    },
    {
      id: 'fe_h2', cat: 'steel', kind: 'sell',
      name: '鉄スクラップ（H2）', spec: '厚さ3〜6mm未満の重量くず', keywords: ['鉄くず', 'スクラップ', 'H2', 'ヘビー', '特級'],
      price: { low: 38500, high: 41000, unit: '円/t', basis: '東京の問屋ヤード持込の相場（業界紙2紙）。kgあたり38.5〜41円', asOf: '2026-11-05' },
      history: [
        { label: '電炉の買値', text: '東京製鐵 特級（H2相当）51,000〜52,500円/t（10月22日〜）。新断は52,500〜55,500円/t' },
        { label: '輸出入札', text: '関東鉄源協同組合 52,077円/t（10月、H2・船側渡し）' },
        { label: '小口持込', text: '業者の公開買取価格 35〜53円/kg（中心は47円/kg前後）' },
        { label: '2020年1月', text: 'ヤード持込 約13,500〜14,500円/t' },
        { label: '2022年4〜5月', text: 'ヤード持込 最高54,000円/t' }
      ],
      trend: { code: 'PRCG20_2202350002', label: '鉄屑' },
      memo: '鉄スクラップは建材の中でも値動きが激しい品目です。2008年（リーマン・ショック前）と2022年に大きな山があり、2026年は5月に高値をつけたあと夏に下げ、10月に再び上がりました。\n現場や解体で出る鉄くずは、問屋のヤードに持ち込む値段（上の数字）が現実的な目安。電炉メーカーの買値はそれより1万円/tほど高い水準です。',
      sources: [ { label: '日刊産業新聞「鉄鋼市場価格」（東京）', url: 'https://www.japanmetal.com/iron-steel-price' }, { label: '日刊鉄鋼新聞「最新市場価格」（東京・問屋仲間相場）', url: 'https://www.japanmetaldaily.com/list/market/details' }, { label: '東京製鐵「国内鉄スクラップ購入価格表」2026年10月22日適用（PDF）', url: 'https://www.tokyosteel.co.jp/assets/docs/scrapprice/price/2026/2026.10.22.pdf' }, { label: '日刊鉄鋼新聞「関東の鉄スクラップ輸出入札／5万2077円で2万トン落札」', url: 'https://www.japanmetaldaily.com/articles/-/268700' } ]
    },
    {
      id: 'sus_scrap', cat: 'steel', kind: 'sell',
      name: 'ステンレスくず', spec: 'SUS304（18-8）付物なし', keywords: ['ステンレス', 'SUS', 'スクラップ', '18-8'],
      price: { low: 185, high: 220, unit: '円/kg', basis: '業者の持込買取価格（公開価格表）', asOf: '2026-11-06', tax: '税込' },
      history: [
        { label: '400系', text: 'SUS430など（磁石につくもの）は30〜46円/kgと大幅に安い' }
      ],
      trend: { code: 'PRCG20_2600350017', proxy: true, label: 'ニッケル地金（輸入物価）' },
      memo: 'ステンレスくずの値段は、含まれるニッケルの相場（と円相場）でほぼ決まります。ニッケルを含まない400系は鉄くずに近い値段です。',
      sources: [
        { label: '大畑商事 買取価格一覧表（大阪・千葉・群馬）', url: 'https://www.ohata.org/kakaku_hyou.html' },
        { label: 'ヒラノヤ（大阪・堺）ステンレススクラップ', url: 'https://hiranoyasan.com/all-items/' },
        { label: 'スクラップ価格.com（神戸）', url: 'https://super-recycle.com/price_list/' }
      ]
    },

    /* ===== 銅・アルミ・電線 ===== */
    {
      id: 'copper', cat: 'nonferrous', kind: 'buy',
      name: '電気銅（銅建値）', spec: '国内の銅地金の基準価格', keywords: ['銅', '建値', 'LME'],
      price: { low: 2280000, high: 2280000, unit: '円/t', basis: 'JX金属の国内建値（11月6日改定。kgあたり2,280円）', asOf: '2026-11-06', approx: false },
      history: [
        { label: '2020年', text: '平均 約70万円/t（JX金属の月平均から計算）' },
        { label: '2022年4月', text: '月平均 約134万円/t（当時の高値）' },
        { label: '2025年', text: '平均 約154万円/t（同じく計算値）' },
        { label: '2026年10月', text: '月平均 約238万円/t。10月13日に過去最高の244万円' }
      ],
      trend: { code: 'PRCG20_2201050001', label: '銅' },
      memo: '2020年春の底から上がり続け、2026年10月13日に建値244万円/tの過去最高（2020年平均の約3.5倍）。11月6日は228万円まで下がっています。\n電線・配管・設備機器の価格にそのまま響く、いま一番注意したい品目です。',
      sources: [
        { label: 'JX金属「銅建値」（改定履歴・月間平均推移）', url: 'https://www.jx-nmm.com/cuprice/' }
      ]
    },
    {
      id: 'densen', cat: 'nonferrous', kind: 'buy',
      name: '電線・ケーブル', spec: 'VVF 1.6mm×2C 100m巻', keywords: ['電線', 'ケーブル', 'VVF', 'CV', 'IV', 'Fケーブル'],
      price: { low: 15980, high: 21980, unit: '円/巻', basis: '通販価格（モノタロウ、メーカー5社のVVF1.6×2C 100m巻）', asOf: '2026-11-06', tax: '税抜' },
      history: [
        { label: '3芯', text: 'VVF1.6×3C 100m巻は 32,980〜39,980円（同じく通販・税抜）' },
        { label: '2026年', text: '電線各社が加工費などを値上げ（矢崎 平均8%・5月〜、フジクラ・ダイヤ 4〜7%・6月〜、SFCC 平均4〜8%・7月〜）' }
      ],
      trend: { code: 'PRCG20_2201050008', label: 'プラスチック被覆銅線' },
      memo: '電線は銅の値段に連動して値決めされるので、銅の高騰がそのまま効いています。指数は2026年9月に過去最高（2020年の3倍超）。\nさらに2026年は電線各社が加工費などの値上げも実施。電気設備の見積りは有効期限を短めにしておくと安心です。',
      sources: [
        { label: 'モノタロウ VVFケーブル（弥栄電線・協和電線工業・住電HST・矢崎・愛知電線の各ページ）', url: 'https://www.monotaro.com/g/04641370/' },
        { label: '矢崎エナジーシステム「電線・ケーブルの価格改定のお願い」2026年4月14日（PDF）', url: 'https://www.yazaki-group.com/file/%E9%9B%BB%E7%B7%9A%E3%83%BB%E3%82%B1%E3%83%BC%E3%83%96%E3%83%AB%E3%81%AE%E4%BE%A1%E6%A0%BC%E6%94%B9%E5%AE%9A%E3%81%AE%E3%81%8A%E9%A1%98%E3%81%84_20260414.pdf' }
      ]
    },
    {
      id: 'alsash', cat: 'nonferrous', kind: 'buy',
      name: 'アルミサッシ', spec: '住宅用サッシ・ドア', keywords: ['サッシ', 'アルミ', '窓', 'YKK', 'LIXIL'],
      priceNote: '商品・サイズで大きく違うので価格は非掲載。2026年10月受注分から主要3社が10〜20%値上げ',
      history: [
        { label: 'YKK AP', text: '住宅用 10〜15%（2026年10月・11月の2段階）' },
        { label: 'LIXIL', text: '平均13%（2026年10月〜）' },
        { label: '三協アルミ', text: 'アルミサッシ 20%（2026年10月〜、建材問屋の案内による）' }
      ],
      trend: { code: 'PRCG20_2201150003', label: 'アルミニウムサッシ' },
      memo: 'アルミ地金や副資材・物流費の上昇を受けて、サッシメーカーは2022年以降たびたび値上げ。2026年秋も主要3社がほぼ同時に10〜20%の値上げをしました。指数は過去最高圏です。',
      sources: [
        { label: 'LIXIL「建材・設備機器のメーカー希望小売価格の一部改定について」2026年5月18日', url: 'https://newsroom.lixil.com/ja/2026051801' },
        { label: 'リフォーム産業新聞「YKK AP、住宅用商品などを10月から順次値上げ」2026年6月30日', url: 'https://www.reform-online.jp/news/manufacturer/68984.php' },
        { label: 'SYAA（建材問屋）「三協アルミも2026年秋の価格改定を発表」', url: 'http://esuwai.net/news/1120/' }
      ]
    },
    {
      id: 'cu_pika', cat: 'nonferrous', kind: 'sell',
      name: '銅スクラップ（ピカ線）', spec: '1号銅線（被覆をむいた光った銅線）', keywords: ['銅', 'ピカ線', '1号銅線', '特号', 'スクラップ'],
      price: { low: 2200, high: 2350, unit: '円/kg', basis: '業者の持込買取価格（大阪・名古屋・神戸・埼玉などの公開価格表）', asOf: '2026-11-06', tax: '税込（一部表記なし）' },
      history: [
        { label: '目安', text: '銅建値（kgあたり2,280円）の94〜103%くらいで買い取られています' }
      ],
      trend: { code: 'PRCG20_2202350003', label: '銅・アルミニウム屑' },
      memo: '銅スクラップの値段は銅建値（銅相場）とほぼ連動します。指数（銅・アルミ屑）は2026年6月に過去最高をつけたあと、夏にかけて1割ほど下げました。\nピカ線は銅スクラップの中で一番高く売れます。11月6日に建値が1kgあたり60円下がったので、買取価格も下がる可能性があります。',
      sources: [
        { label: '大畑商事 買取価格一覧表（大阪・千葉・群馬）', url: 'https://www.ohata.org/kakaku_hyou.html' },
        { label: 'ヒラノヤ（大阪・堺）買取価格表', url: 'https://hiranoyasan.com/all-items/' },
        { label: 'スクラップ価格.com（神戸）', url: 'https://super-recycle.com/price_list/' },
        { label: '森本商店（名古屋）本日の買取価格', url: 'https://morimoto-nagoya.com/item-86/' },
        { label: '土金（大阪）スクラップ買取価格', url: 'https://www.dokindokin.com/scrap_type/copper/' }
      ]
    },
    {
      id: 'cu_komi', cat: 'nonferrous', kind: 'sell',
      name: '銅スクラップ（込銅・並銅）', spec: '付着物のある銅くず・細い銅線・銅管など', keywords: ['銅', '込銅', '並銅', '上銅', '銅管', '2号銅'],
      price: { low: 2100, high: 2250, unit: '円/kg', basis: '業者の持込買取価格（公開価格表）', asOf: '2026-11-06', tax: '税込' },
      history: [
        { label: '上銅', text: '2,240〜2,350円/kg' },
        { label: '下銅', text: '1,920〜2,000円/kg' }
      ],
      trend: { code: 'PRCG20_2202350003', label: '銅・アルミニウム屑' },
      memo: '油・塗装・ハンダなどが付いた銅くずや銅管。ピカ線より安くなりますが、値動きは銅相場と同じです。付着物を外してきれいにするほど高く売れます。',
      sources: [
        { label: '大畑商事 買取価格一覧表（大阪・千葉・群馬）', url: 'https://www.ohata.org/kakaku_hyou.html' },
        { label: 'ヒラノヤ（大阪・堺）買取価格表', url: 'https://hiranoyasan.com/all-items/' },
        { label: 'スクラップ価格.com（神戸）', url: 'https://super-recycle.com/price_list/' },
        { label: '森本商店（名古屋）本日の買取価格', url: 'https://morimoto-nagoya.com/item-86/' },
        { label: '土金（大阪）スクラップ買取価格', url: 'https://www.dokindokin.com/scrap_type/copper/' }
      ]
    },
    {
      id: 'brass', cat: 'nonferrous', kind: 'sell',
      name: '真鍮スクラップ', spec: '黄銅（水栓金具・バルブなど）', keywords: ['真鍮', '黄銅', 'スクラップ', '蛇口'],
      price: { low: 1380, high: 1550, unit: '円/kg', basis: '業者の持込買取価格（公開価格表、付物なし〜込真鍮）', asOf: '2026-11-06', tax: '税込（一部表記なし）' },
      history: [
        { label: '付物が多いもの', text: '真鍮（下）は780円/kg前後まで下がる例も' }
      ],
      trend: { code: 'PRCG20_2202350003', label: '銅・アルミニウム屑' },
      memo: '真鍮は銅と亜鉛の合金。銅相場に引っぱられて高値圏です。ゴムパッキンや鉄ネジなどの付物は外すほど高くなります。',
      sources: [
        { label: '大畑商事 買取価格一覧表（大阪・千葉・群馬）', url: 'https://www.ohata.org/kakaku_hyou.html' },
        { label: 'スクラップ価格.com（神戸）', url: 'https://super-recycle.com/price_list/' },
        { label: '土金（大阪）真鍮スクラップ買取価格', url: 'https://www.dokindokin.com/scrap_type/brass/' }
      ]
    },
    {
      id: 'zatsusen', cat: 'nonferrous', kind: 'sell',
      name: '被覆電線スクラップ', spec: 'VVF（VA線・Fケーブル）', keywords: ['雑線', '電線', 'VA線', 'VVF', 'CV', 'IV', 'スクラップ'],
      price: { low: 900, high: 1020, unit: '円/kg', basis: '業者の持込買取価格（銅率40%前後のVVF）', asOf: '2026-11-06', tax: '税込' },
      history: [
        { label: '銅率80%', text: 'IV・CVの太い単線など 1,720〜1,830円/kg' },
        { label: '銅率60〜65%', text: 'CV・3本線など 1,220〜1,280円/kg' },
        { label: '家電線・雑線', text: '630〜780円/kg' }
      ],
      trend: { code: 'PRCG20_2202350003', label: '銅・アルミニウム屑' },
      memo: '被覆付きの電線は、中の銅の割合（銅率）で値段が決まります。太い線ほど銅率が高く、高く売れます。端子やコネクタなどの付物は外しておくと減額されません。',
      sources: [
        { label: '大畑商事 買取価格一覧表（大阪・千葉・群馬）', url: 'https://www.ohata.org/kakaku_hyou.html' },
        { label: 'ヒラノヤ（大阪・堺）電線スクラップ', url: 'https://hiranoyasan.com/all-items/' },
        { label: '土金（大阪）電線スクラップ', url: 'https://www.dokindokin.com/scrap_type/electrical-wire/' },
        { label: '宝源（埼玉・越谷）持ち込み買取価格', url: 'https://hougen.co.jp/' }
      ]
    },
    {
      id: 'al_scrap', cat: 'nonferrous', kind: 'sell',
      name: 'アルミスクラップ', spec: 'サッシくず', keywords: ['アルミ', 'サッシ', 'スクラップ'],
      price: { low: 325, high: 470, unit: '円/kg', basis: '業者の持込買取価格（ビスなし360〜470円・ビス付き325〜405円）', asOf: '2026-11-06', tax: '税込（一部表記なし）' },
      history: [
        { label: '参考', text: 'アルミ地金（国内）603円/kg（11月2日）。2026年5月の月平均711円/kgがピーク' }
      ],
      trend: { code: 'PRCG20_2201050003', proxy: true, label: 'アルミニウム合金・同二次合金地金' },
      memo: 'アルミサッシなどのくずは、再生アルミ（二次合金地金）の原料になります。値段は銅ではなくアルミ地金の相場で動きます。ビスやゴム・樹脂の付物を外すほど高く売れます。',
      sources: [
        { label: '大畑商事 買取価格一覧表（大阪・千葉・群馬）', url: 'https://www.ohata.org/kakaku_hyou.html' },
        { label: 'ヒラノヤ（大阪・堺）アルミサッシスクラップ', url: 'https://hiranoyasan.com/all-items/aluminum_scrap/aluminum-sash-a/' },
        { label: '白銅「地金価格情報」（アルミ地金の日経デイリー値）', url: 'https://www.hakudo.co.jp/product/metal/' }
      ]
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
      name: '木くず', spec: '建設発生木材・解体材（異物なし）', keywords: ['木くず', '廃材', '処分費', '解体材'],
      price: { low: 10000, high: 35000, unit: '円/t', basis: '府県の公表受入単価（東北は中央値2.7万円/t、兵庫・大阪は1.2〜1.5万円/t）。運搬費は別', asOf: '2026-11-01' },
      history: [
        { label: 'm³建て', text: '広島県の解体材 中央値5,500円/m³、首都圏の民間 5,000円/m³前後' },
        { label: '注意', text: '生木（枝葉・根）や異物の付いた木くずは割高' }
      ],
      trend: { code: 'PRCS20_5202050003', label: '産業廃棄物処理（処分費全体）' },
      memo: 'チップにして燃料などに再利用されるため、処分費は混合廃棄物より安めです。地域差が大きい品目です。グラフは処分費全体の指数です。',
      sources: [ { label: '青森県「建設廃棄物再資源化施設受入料金」2026年10月1日以降適用（PDF）', url: 'https://www.pref.aomori.lg.jp/soshiki/kendo/seibikikaku/files/04_R081001syobun.pdf' }, { label: '兵庫県「建設副産物の処理ならびに受入価格」2026年11月1日適用（PDF）', url: 'https://web.pref.hyogo.lg.jp/ks04/documents/fukusanbutsu081101.pdf' }, { label: '大阪府「建設廃棄物等受入価格 調査報告書」2026年2月1日適用（PDF）', url: 'https://www.pref.osaka.lg.jp/documents/106060/r7simohankikensetuhakibutu.pdf' }, { label: '広島市「建設発生土及び建設廃棄物処分費一覧表」2026年10月（PDF）', url: 'https://www.city.hiroshima.lg.jp/_res/projects/default_project/_page_/001/052/389/syobun_r810.pdf' } ]
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
    {
      id: 'd_foam', cat: 'insulation', kind: 'dispose',
      name: '廃ウレタン・発泡スチロール', spec: '断熱材の端材・梱包材（単品）', keywords: ['ウレタン', '発泡スチロール', 'スタイロ', '処分費'],
      price: { low: 4000, high: 11000, unit: '円/m³', basis: '民間の処理業者の公表料金（横浜：発泡スチロール4,000円・ウレタン/スタイロ11,000円、仙台：10,000円〜）', asOf: '2026-04-27', tax: '税抜' },
      history: [
        { label: 't建て', text: '重さで払うと12万〜30万円/tとかなり高い（軽くてかさばるため）' },
        { label: 'グラスウール', text: '10,000〜13,000円/m³（同じく民間料金表）' }
      ],
      trend: { code: 'PRCS20_5202050003', label: '産業廃棄物処理（処分費全体）' },
      memo: '発泡系は軽くてかさばるので容積（m³）建ての料金が一般的です。発泡スチロールは単品でまとめるとリサイクルに回せて安く、ウレタンやスタイロは割高になりがちです。公開料金は少ないので目安の確度は低めです。',
      sources: [ { label: 'ミライズ（横浜）産業廃棄物処理単価表 2026年4月27日改定（PDF）', url: 'https://miraiz-yokohama.com/wp-content/uploads/2026/04/%E3%83%9F%E3%83%A9%E3%82%A4%E3%82%BA_%E5%8D%98%E4%BE%A1%E8%A1%A8_price.2026.4.27.pdf' }, { label: '仙台環境開発 処理料金表 2025年8月6日現在（PDF）', url: 'http://www.sendaikankyo.co.jp/pdf/fineness/authorization/11.pdf' } ]
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
      name: '廃プラスチック', spec: '梱包材・シート・塩ビ管など（単品分別）', keywords: ['廃プラ', '処分費', 'ビニール'],
      price: { low: 7000, high: 16000, unit: '円/m³', basis: '広島市が公表する13施設の受入単価（中央値10,000円/m³）。首都圏・仙台・京都の民間料金も同じくらい', asOf: '2026-10-01' },
      history: [
        { label: '民間料金', text: '首都圏・仙台・京都 9,000〜15,000円/m³' },
        { label: 't建て', text: '重さで払う場合は 5万〜20万円/t と高くつく（青森県の中間処理 中央値7.25万円/t）' }
      ],
      trend: { code: 'PRCS20_5202050003', label: '産業廃棄物処理（処分費全体）' },
      memo: '2017年末に中国が廃プラの輸入を止めてから国内処理が増え、受入単価が上がった品目です。かさばるので容積（m³）建てが多く、つぶして容積を減らすと安くなります。グラフは処分費全体の指数です。',
      sources: [ { label: '広島市「建設発生土及び建設廃棄物処分費一覧表」2026年10月（PDF）', url: 'https://www.city.hiroshima.lg.jp/_res/projects/default_project/_page_/001/052/389/syobun_r810.pdf' }, { label: 'ミライズ（横浜）産業廃棄物処理単価表 2026年4月27日改定（PDF）', url: 'https://miraiz-yokohama.com/wp-content/uploads/2026/04/%E3%83%9F%E3%83%A9%E3%82%A4%E3%82%BA_%E5%8D%98%E4%BE%A1%E8%A1%A8_price.2026.4.27.pdf' }, { label: '仙台環境開発 処理料金表 2025年8月6日現在（PDF）', url: 'http://www.sendaikankyo.co.jp/pdf/fineness/authorization/11.pdf' }, { label: 'カンテク（京都・宇治）料金表', url: 'https://kanteku.co.jp/fee/' } ]
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
      name: '廃石膏ボード', spec: 'リサイクルできる端材（新築系）', keywords: ['石膏ボード', 'PB', '処分費'],
      price: { low: 30000, high: 65000, unit: '円/t', basis: '中間処理施設の公表料金（京都の民間 新築30円/kg〜、青森県の中央値56,300円/t など）。運搬費は別', asOf: '2026-10-01', tax: '税抜' },
      history: [
        { label: 'm³建て', text: '広島市 10,000〜20,000円/m³、横浜の民間 13,000円/m³（リサイクル不可は25,000円/m³）' },
        { label: '解体材', text: '水濡れ・クロス付き・解体系は1.2〜3倍になることが多い' }
      ],
      trend: { code: 'PRCS20_5202050003', label: '産業廃棄物処理（処分費全体）' },
      memo: '廃石膏ボードは安定型処分場に埋められず、管理型での処分が必要なため処分費は高め。濡らさず、新築端材だけで分けて出すとリサイクル（再生石膏）に回せて安くなります。グラフは処分費全体の指数です。',
      sources: [ { label: 'カンテク（京都・宇治）料金表', url: 'https://kanteku.co.jp/fee/' }, { label: '青森県「建設廃棄物再資源化施設受入料金」2026年10月1日以降適用（PDF）', url: 'https://www.pref.aomori.lg.jp/soshiki/kendo/seibikikaku/files/04_R081001syobun.pdf' }, { label: '広島市「建設発生土及び建設廃棄物処分費一覧表」2026年10月（PDF）', url: 'https://www.city.hiroshima.lg.jp/_res/projects/default_project/_page_/001/052/389/syobun_r810.pdf' }, { label: 'ミライズ（横浜）産業廃棄物処理単価表 2026年4月27日改定（PDF）', url: 'https://miraiz-yokohama.com/wp-content/uploads/2026/04/%E3%83%9F%E3%83%A9%E3%82%A4%E3%82%BA_%E5%8D%98%E4%BE%A1%E8%A1%A8_price.2026.4.27.pdf' } ]
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
      name: 'アスファルトがら', spec: 'アスコン塊・切削材（中間処理施設への持込）', keywords: ['アスガラ', 'がれき類', '処分費', 'As塊'],
      price: { low: 1000, high: 4500, unit: '円/t', basis: '5府県（青森・秋田・広島・兵庫・大阪）が公表する施設ごとの受入単価。運搬費は別', asOf: '2026-11-01' },
      history: [
        { label: '中央値', text: '府県ごとに 1,500〜3,000円/t（広島県 2,000円/t）' },
        { label: '横浜市', text: '市発注工事の指定単価 アスファルト殻 7,050円/m³' },
        { label: '値上がり', text: '兵庫県では2025年4月→2026年11月に83施設中31施設が値上げ（値下げは0）' }
      ],
      trend: { code: 'PRCS20_5202050003', label: '産業廃棄物処理（処分費全体）' },
      memo: '再生アスファルト合材の原料になるため、処分費は比較的安めです。グラフは処分費全体の指数です。',
      sources: [ { label: '兵庫県「建設副産物の処理ならびに受入価格」2026年11月1日適用（PDF）', url: 'https://web.pref.hyogo.lg.jp/ks04/documents/fukusanbutsu081101.pdf' }, { label: '広島県「再資源化施設一覧表（コンクリート塊・アスファルトコンクリート塊）」2026年7月一部改定（PDF）', url: 'https://chotatsu.pref.hiroshima.lg.jp/estimate/k20/k20hukusann/coas202607hiru.pdf' }, { label: '青森県「建設廃棄物再資源化施設受入料金」2026年10月1日以降適用（PDF）', url: 'https://www.pref.aomori.lg.jp/soshiki/kendo/seibikikaku/files/04_R081001syobun.pdf' }, { label: '大阪府「建設廃棄物等受入価格 調査報告書」2026年2月1日適用（PDF）', url: 'https://www.pref.osaka.lg.jp/documents/106060/r7simohankikensetuhakibutu.pdf' }, { label: '横浜市「土木工事資材等単価表」2026年11月版（PDF）', url: 'https://www.city.yokohama.lg.jp/business/bunyabetsu/doro-kasen/doro/kanri/hyojunzu/tanka.files/0169_20261026.pdf' } ]
    },

    /* ===== 混合・その他 ===== */
    {
      id: 'd_mixed', cat: 'misc', kind: 'dispose',
      name: '建設混合廃棄物', spec: '分別していない廃棄物（中間処理で選別）', keywords: ['混廃', '混合', '処分費'],
      price: { low: 11000, high: 25000, unit: '円/m³', basis: '民間の処理業者の公表料金（横浜・京都・仙台など）。運搬費は別', asOf: '2026-04-27', tax: '税抜' },
      history: [
        { label: '軽いもの中心', text: '新築系（木くず・紙・廃プラなど）11,000〜15,000円/m³' },
        { label: '重いもの・石膏入り', text: '15,000〜25,000円/m³' },
        { label: '業界の動き', text: '処理業者の「契約単価」は2022年から値上げ超が続き、2026年4〜6月期は調査期間で最大の上げ超（全国産業資源循環連合会）' }
      ],
      trend: { code: 'PRCS20_5202050003', label: '産業廃棄物処理（処分費全体）' },
      memo: '分別されていない混合廃棄物は処分費がいちばん高くなります。木くず・コンがら・金属・段ボールを現場で分けるほど、混合で出す量が減って安くなります。',
      sources: [ { label: 'ミライズ（横浜）産業廃棄物処理単価表 2026年4月27日改定（PDF）', url: 'https://miraiz-yokohama.com/wp-content/uploads/2026/04/%E3%83%9F%E3%83%A9%E3%82%A4%E3%82%BA_%E5%8D%98%E4%BE%A1%E8%A1%A8_price.2026.4.27.pdf' }, { label: 'カンテク（京都・宇治）料金表', url: 'https://kanteku.co.jp/fee/' }, { label: '仙台環境開発 処理料金表 2025年8月6日現在（PDF）', url: 'http://www.sendaikankyo.co.jp/pdf/fineness/authorization/11.pdf' }, { label: '全国産業資源循環連合会「産業廃棄物処理業景況動向調査」2026年4-6月期（PDF）', url: 'https://www.zensanpairen.or.jp/wp/wp-content/themes/sanpai/assets/pdf/activities/report_keikyou2604_06.pdf' } ]
    }
  ]
};
