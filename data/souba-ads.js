/*
 * 建材相場ボード（souba.html）の広告・計測の設定
 *
 * ■ AdSense
 *   - konylog.com と同じサイト運営者IDを使います。広告と計測は allowHosts のドメイン（とサブドメイン）でだけ読み込みます
 *     （konylog.vercel.app などのプレビューでは広告を出しません）
 *   - autoAds: AdSense 側で自動広告をオンにしていれば、Google が自動で広告を置きます
 *   - slots: AdSense の管理画面で「ディスプレイ広告」ユニットを作り、表示された data-ad-slot の数字を入れると
 *     その場所に広告が出ます。空のままなら、house のバナーがあればそれを出し、なければ何も出しません
 *
 * ■ A8.net などの ASP 広告
 *   - konylog.com の記事に貼っている A8.net の広告リンクを流用しています
 *     （url = 広告リンク、pixel = 表示回数を数える 1×1 の画像。A8 の広告コードに入っている2つの URL です）
 *   - ASP の広告は aspHosts のドメイン（とサブドメイン）で開いたときだけ出します。自社PR（own: true）はどこでも出します
 *   - A8.net は登録したサイトにしか広告を貼れず、サブドメインも「副サイト登録」が必要です。
 *     A8 の管理画面で souba.konylog.com を副サイトに登録してから公開してください
 *
 * ■ PR枠（詳細画面の「相場目安」のすぐ下）
 *   - 上から順に、品目に合う最初の1件を出します（kinds: 購入/買取/処分、cats: 素材、items: 品目ID で絞れる）
 *   - リンクは url（＋cta・pixel）に1つ、または links に2つまで書けます。url が空のものは出しません
 *   - title / text の {name} は品目名に置き換わります
 *
 * ■ 位置の確認
 *   - URL の最後に ?adpreview=1 を付けると、広告枠の位置と、そこに出る中身を表示します（リンクと計測はオフ）
 *
 * ※ AdSense の規約で、誤クリックを誘う置き方（ボタンの近く、メニューや記事と見分けにくい形など）は禁止されています。
 *   ここの枠はどれも「広告」「PR」と表示し、操作ボタンから離して置いています。
 */
window.KONYLOG_SOUBA_ADS = {
  allowHosts: ['konylog.com'],
  aspHosts: ['souba.konylog.com'], // A8.net に副サイト登録したドメインだけを書く
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

  // AdSense のユニットIDが空のときに出すバナー（banners の名前）
  house: {
    afterSummary: 'mitsumoreal_banner',
    afterBoard: 'a8_gaiheki_banner',
    afterRanking: 'a8_sekokan_banner'
  },

  pr: [
    /* --- A8.net（konylog.com の記事で使っている広告）。品目にぴったり合うものを先に置く --- */
    {
      id: 'a8_gaiheki', items: ['paint', 'siding'],
      title: '外壁塗装、比べる見積もりはありますか？',
      text: '塗料や外壁材の値上げで、外壁塗装の見積もりも上がりやすくなっています。1社分だけでは高いか安いか決めきれないので、同じ条件で2〜3社から取るのが確実です。どちらも無料で、見積もりを取っても契約する必要はありません。',
      links: [
        {
          cta: '外壁塗装の窓口で最大4社の見積もりを取る',
          url: 'https://px.a8.net/svt/ejp?a8mat=4BEFL8+32QOUA+4V8C+5YJRM',
          pixel: 'https://www14.a8.net/0.gif?a8mat=4BEFL8+32QOUA+4V8C+5YJRM'
        },
        {
          cta: 'ヌリカエで外壁塗装の相場をチェックする',
          url: 'https://px.a8.net/svt/ejp?a8mat=4BEFL8+2KVOOY+410U+60OXE',
          pixel: 'https://www14.a8.net/0.gif?a8mat=4BEFL8+2KVOOY+410U+60OXE'
        }
      ]
    },
    {
      id: 'a8_bousui', items: ['urethane_bousui'],
      title: 'ベランダ・屋上の防水、見積もりを比べるなら',
      text: '防水材は2026年に大手メーカーが1〜3割ほど値上げしました。防水のやり直しは、下地の状態を見ないと材料も金額も決まりません。業者に見てもらって、見積もりを比べるのが確実です。どちらも見積もりは無料です。',
      links: [
        {
          cta: '防水工事セレクトナビで一括見積もりを取る',
          url: 'https://px.a8.net/svt/ejp?a8mat=4BEFL8+2IHY9U+46CI+NTRMQ',
          pixel: 'https://www18.a8.net/0.gif?a8mat=4BEFL8+2IHY9U+46CI+NTRMQ'
        },
        {
          cta: '街角雨漏り相談所で雨漏り修理の見積もりを取る',
          url: 'https://px.a8.net/svt/ejp?a8mat=4BEFL8+2LH4AQ+5BYA+NTJWY',
          pixel: 'https://www14.a8.net/0.gif?a8mat=4BEFL8+2LH4AQ+5BYA+NTJWY'
        }
      ]
    },
    {
      id: 'a8_amamori', items: ['alsash', 'amadoi'],
      title: '窓まわりや外壁から雨漏りしているなら',
      text: '雨漏りは、シーリングの切れだけでなく、水切りや外壁の取合い、雨どいの詰まりが原因のこともあります。打ち直しても止まらないことがあるので、自宅で雨漏りが起きているなら、原因を調べてくれる業者に一度見てもらうのが近道です。見積もりは無料です。',
      cta: '街角雨漏り相談所で雨漏り修理の見積もりを取る',
      url: 'https://px.a8.net/svt/ejp?a8mat=4BEFL8+2LH4AQ+5BYA+NTJWY',
      pixel: 'https://www14.a8.net/0.gif?a8mat=4BEFL8+2LH4AQ+5BYA+NTJWY'
    },
    {
      id: 'a8_sumidashi', items: ['konpane', 'sekkou'],
      title: '自分用の墨出し器を1台持つなら',
      text: '型枠や内装の墨、職人さんが来る前の確認だけなら、会社の機械を借りに行くより手元に1台あるほうが早く動けます。グリーンレーザーの5ラインで手頃な価格帯のものもあります。ラインの見えやすさ・精度の表記・三脚との相性は、買う前に確かめておきましょう。',
      cta: 'VOICE 5ライン グリーンレーザー墨出し器を見る',
      url: 'https://px.a8.net/svt/ejp?a8mat=4BEFL8+K8SW2+3TN0+5YRHE',
      pixel: 'https://www17.a8.net/0.gif?a8mat=4BEFL8+K8SW2+3TN0+5YRHE'
    },

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
    },
    a8_gaiheki_banner: {
      eyebrow: '広告',
      title: '外壁塗装の見積もり、比べていますか？',
      text: '塗料・外壁材・防水材は2026年も値上げが続いています。外壁塗装を考えているなら、同じ条件で2〜3社の見積もりを比べるのが確実です。どちらも無料で、見積もりを取っても契約する必要はありません。',
      links: [
        {
          cta: '外壁塗装の窓口で最大4社の見積もりを取る',
          url: 'https://px.a8.net/svt/ejp?a8mat=4BEFL8+32QOUA+4V8C+5YJRM',
          pixel: 'https://www14.a8.net/0.gif?a8mat=4BEFL8+32QOUA+4V8C+5YJRM'
        },
        {
          cta: 'ヌリカエで外壁塗装の相場をチェックする',
          url: 'https://px.a8.net/svt/ejp?a8mat=4BEFL8+2KVOOY+410U+60OXE',
          pixel: 'https://www14.a8.net/0.gif?a8mat=4BEFL8+2KVOOY+410U+60OXE'
        }
      ]
    },
    a8_sekokan_banner: {
      eyebrow: '広告｜施工管理技士の通信講座',
      title: '1級建築施工管理技士を目指すなら',
      text: '一次は過去問、二次は答案の添削で決まります。二次の答案だけ見てほしいなら独学サポート事務局、動画で一次から進めたいなら能セン。添削の回数と受講期間を、公式サイトで確かめてから選んでください。',
      links: [
        {
          cta: '独学サポート事務局の講座を見る',
          url: 'https://px.a8.net/svt/ejp?a8mat=35HR03+FXXXHE+4ASS+64RJ6',
          pixel: 'https://www10.a8.net/0.gif?a8mat=35HR03+FXXXHE+4ASS+64RJ6'
        },
        {
          cta: '能センの講座を見る',
          url: 'https://px.a8.net/svt/ejp?a8mat=4BEFL8+32598I+5TS8+5YJRM',
          pixel: 'https://www15.a8.net/0.gif?a8mat=4BEFL8+32598I+5TS8+5YJRM'
        }
      ]
    }
  }
};
