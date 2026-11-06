/*
 * 建材相場ボード（souba.html）の広告・計測の設定
 *
 * ■ AdSense
 *   - konylog.com と同じサイト運営者IDを使います。広告と計測は allowHosts のドメイン（とサブドメイン）でだけ読み込みます
 *     （konylog.vercel.app などのプレビューでは広告を出しません）
 *   - autoAds: AdSense 側で自動広告をオンにしていれば、Google が自動で広告を置きます
 *   - slots: AdSense の管理画面で「ディスプレイ広告」ユニットを作り、表示された data-ad-slot の数字を入れると
 *     その場所に広告が出ます。空のままなら、house（自社PR）があればそれを出し、なければ何も出しません
 *
 * ■ PR枠（詳細画面の「相場目安」のすぐ下）
 *   - 上から順に、品目に合う最初の1件を出します（kinds: 購入/買取/処分、cats: 素材、items: 品目ID で絞れる）
 *   - url が空のものは出しません。ASP（A8.net・もしも・バリューコマースなど）の広告リンクを url に貼れば有効になります
 *   - title / text の {name} は品目名に置き換わります
 *
 * ■ 位置の確認
 *   - URL の最後に ?adpreview=1 を付けると、広告枠の位置をダミーで表示します
 *
 * ※ AdSense の規約で、誤クリックを誘う置き方（ボタンの近く、メニューや記事と見分けにくい形など）は禁止されています。
 *   ここの枠はどれも「広告」「PR」と表示し、操作ボタンから離して置いています。
 */
window.KONYLOG_SOUBA_ADS = {
  allowHosts: ['konylog.com'],
  googleTag: 'GT-TXX3B3WJ', // konylog.com と同じ Google タグ（アクセス・クリック計測）
  adsense: {
    client: 'ca-pub-8996027971502616',
    autoAds: true,
    slots: {
      afterSummary: '', // 「いまの全体感」の下（ページ上部。いちばん見られる場所）
      afterBoard: '',   // 品目カードの一覧の下
      afterRanking: ''  // ランキングの下
    }
  },

  // AdSense のユニットIDが空のときに出す自社PR
  house: {
    afterSummary: 'mitsumoreal_banner'
  },

  pr: [
    /* --- ASP の広告リンクを url に貼ると有効になる枠（上にあるものが優先） --- */
    {
      id: 'scrap_kaitori', kinds: ['sell'],
      title: '{name}、まとめて出すならいくらになる？',
      text: '金属スクラップ・電線・機械の出張買取。現場や解体で出た分の見積もりを取ってみる。',
      cta: '買取の見積もりを見る',
      url: '' // 例: 金属スクラップ買取・出張買取の広告リンク
    },
    {
      id: 'sanpai', kinds: ['dispose'],
      title: '{name}の処分、見積もりを取ってみる',
      text: '産業廃棄物・残土・不用品の回収業者を探して、処分費を比べられます。',
      cta: '回収業者を探す',
      url: '' // 例: 産廃・不用品回収の一括見積もりの広告リンク
    },
    {
      id: 'tsuhan', kinds: ['buy'],
      title: '{name}を通販でチェック',
      text: '資材・副資材・工具を現場に直送。急ぎの手配や少量の買い足しに。',
      cta: '通販の価格を見る',
      url: '' // 例: 工具・資材通販の広告リンク
    },
    {
      id: 'career',
      title: '施工管理の年収、相場より低くない？',
      text: '資材の相場と同じで、施工管理の給料にも相場があります。求人を見て比べてみる。',
      cta: '施工管理の求人を見る',
      url: '' // 例: 施工管理の転職・求人の広告リンク（全品目に出ます）
    },

    /* --- 運営者のサイト（ミツモリアル）。上の枠が空のときに出る --- */
    {
      id: 'mitsumoreal_buy', kinds: ['buy'], own: true,
      title: '{name}を使う工事、その見積もりは適正？',
      text: '塗装・外構・解体・水回りなど、実際の見積もりを投稿して「高い？安い？」をみんなでチェックできるサイトです。',
      cta: 'ミツモリアルで見積もり事例を見る',
      url: 'https://mitsumoreal.com/?utm_source=konylog&utm_medium=referral&utm_campaign=souba'
    },
    {
      id: 'mitsumoreal_kaitai', kinds: ['sell', 'dispose'], own: true,
      title: '解体・撤去の見積もり、処分費やスクラップ分は適正？',
      text: '解体・外構などの実際の見積もりを投稿して「高い？安い？」をみんなでチェックできるサイトです。',
      cta: 'ミツモリアルで見積もり事例を見る',
      url: 'https://mitsumoreal.com/?utm_source=konylog&utm_medium=referral&utm_campaign=souba'
    }
  ],

  // ページ内バナー（house で指定）
  banners: {
    mitsumoreal_banner: {
      own: true,
      eyebrow: '運営者のもうひとつのサイト',
      title: 'その見積もり、高い？安い？',
      text: 'リフォーム・外構・解体などの見積もりを投稿して、適正価格かどうかをみんなでレビューする「ミツモリアル」。相場を見たら、実際の見積もりとも比べてみてください。',
      cta: 'ミツモリアルを見る',
      url: 'https://mitsumoreal.com/?utm_source=konylog&utm_medium=referral&utm_campaign=souba_banner'
    }
  }
};
