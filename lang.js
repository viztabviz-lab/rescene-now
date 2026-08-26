/* 「리센느, 지금」 세 나라말 사전 — 한국어 · English · 日本語
 *
 * 규칙
 *  1. **화면 껍데기와 설명글만 옮긴다.** 영상 제목·검색어·이모티콘 문구·쇼츠 카드 제목은
 *     실제 한국어 원문이라 그대로 둔다. 옮기면 없는 자료를 지어내는 것이 된다.
 *     대신 그런 목록 밑에 「원문 그대로」라는 단서를 붙인다.
 *  2. 사람·그룹 이름은 표기만 바꾼다(이름표). 뜻을 옮기지 않는다.
 *  3. 값이 들어가는 문장은 함수로 적는다. 인자 순서는 세 나라말이 같아야 한다.
 *  4. 없는 열쇠는 한국어로 떨어진다 — 빠뜨려도 화면이 비지 않는다.
 *
 * 열쇠 이름은 화면 순서대로: hdr / s0 / s1 / s2(트렌드) / s3(순위) / s4(MV) /
 *   sv(영상 랭킹) / s10(라이브) / s11(이모티콘) / s5(평판) / s6(클럽) / s7(검색어) /
 *   s8(아카이브) / s9(출처) / ft(꼬리) / u(단위·공통)
 */

/* ── 이름표 — 뜻이 아니라 표기를 바꾼다 ───────────────────────────────── */
const 이름표 = {
  // 리센느 멤버
  "원이": {en:"Wony", ja:"ウォニ"},
  "제나": {en:"Zena", ja:"ゼナ"},
  "미나미": {en:"Minami", ja:"ミナミ"},
  "리브": {en:"Liv", ja:"リヴ"},
  "메이": {en:"May", ja:"メイ"},
  // 그룹
  "리센느": {en:"RESCENE", ja:"RESCENE"},
  // 채널의 정식 이름은 「안녕하세요원이입니다잘부탁드립니다」다. 줄임말 「안원잘부」로 오는 값도 여기서 편다.
  "안원잘부": {ko:"안녕하세요원이입니다잘부탁드립니다", en:"Annyeonghaseyo Wony-imnida Jalbutakdeurimnida", ja:"アンニョンハセヨ ウォニイムニダ チャルブタットゥリムニダ"},
  "안녕하세요원이입니다잘부탁드립니다": {en:"Annyeonghaseyo Wony-imnida Jalbutakdeurimnida", ja:"アンニョンハセヨ ウォニイムニダ チャルブタットゥリムニダ"},
  "아이브": {en:"IVE", ja:"IVE"},
  "블랙핑크": {en:"BLACKPINK", ja:"BLACKPINK"},
  "에스파": {en:"aespa", ja:"aespa"},
  "르세라핌": {en:"LE SSERAFIM", ja:"LE SSERAFIM"},
  "뉴진스": {en:"NewJeans", ja:"NewJeans"},
  "소녀시대": {en:"Girls' Generation", ja:"少女時代"},
  "여자아이들": {en:"i-dle", ja:"i-dle"},
  "트와이스": {en:"TWICE", ja:"TWICE"},
  // 사람 (브랜드평판 TOP10 에 나오는 다른 그룹 멤버)
  "장원영": {en:"Jang Won-young", ja:"チャン・ウォニョン"},
  "제니": {en:"Jennie", ja:"ジェニー"},
  "카리나": {en:"Karina", ja:"カリナ"},
  "안유진": {en:"An Yu-jin", ja:"アン・ユジン"},
  "로제": {en:"Rosé", ja:"ロゼ"},
  "리사": {en:"Lisa", ja:"リサ"},
  "지수": {en:"Jisoo", ja:"ジス"},
  "윈터": {en:"Winter", ja:"ウィンター"},
  "가을": {en:"Giselle", ja:"ジゼル"},
  "하니": {en:"Hanni", ja:"ハニ"},
  "민지": {en:"Minji", ja:"ミンジ"},
  "설윤": {en:"Sullyoon", ja:"ソリュン"},
  "미연": {en:"Miyeon", ja:"ミヨン"},
  "우기": {en:"Yuqi", ja:"ウギ"},
  "전소연": {en:"Jeon So-yeon", ja:"チョン・ソヨン"},
  "김채원": {en:"Kim Chae-won", ja:"キム・チェウォン"},
  "사쿠라": {en:"Sakura", ja:"サクラ"},
  "츠키": {en:"Tsuki", ja:"ツキ"},
};

/* 목록 안의 형식·주기·탭 같은 짧은 낱말 */
const 낱말 = {
  "영상": {en:"Videos", ja:"動画"},
  "쇼츠": {en:"Shorts", ja:"ショート"},
  "라이브": {en:"Live", ja:"ライブ"},
  "전체": {en:"All", ja:"すべて"},
  "조회수": {en:"Views", ja:"再生数"},
  "좋아요": {en:"Likes", ja:"高評価"},
  "매일": {en:"daily", ja:"毎日"},
  "주 1회": {en:"weekly", ja:"週1回"},
  "월 1회": {en:"monthly", ja:"月1回"},
  "수동": {en:"manual", ja:"手動"},
  "10대": {en:"Teens", ja:"10代"},
  "20대": {en:"20s", ja:"20代"},
  "30대": {en:"30s", ja:"30代"},
  "40대": {en:"40s", ja:"40代"},
  "50대 이상": {en:"50+", ja:"50代以上"},
  "월": {en:"Mon", ja:"月"},
  "화": {en:"Tue", ja:"火"},
  "수": {en:"Wed", ja:"水"},
  "목": {en:"Thu", ja:"木"},
  "금": {en:"Fri", ja:"金"},
  "토": {en:"Sat", ja:"土"},
  "일": {en:"Sun", ja:"日"},
};

/* 출처표의 항목 이름 — status.json 의 「키」로 찾는다 (한국어가 바뀌어도 안 깨진다) */
const 출처이름 = {
  live:       {ko:"구독자 · MV 조회수", en:"Subscribers · MV views", ja:"登録者・MV再生数"},
  videos:     {ko:"채널별 영상 조회수·좋아요", en:"Per-video views & likes", ja:"動画別の再生数・高評価"},
  streams:    {ko:"라이브 아카이브", en:"Live archive", ja:"ライブアーカイブ"},
  trends:     {ko:"구글 트렌드", en:"Google Trends", ja:"Googleトレンド"},
  rank:       {ko:"한국·전세계 구독자 순위", en:"KR / world subscriber rank", ja:"韓国・世界の登録者順位"},
  club:       {ko:"걸그룹 100만 클럽", en:"Girl-group 1M club", ja:"ガールグループ100万クラブ"},
  reputation: {ko:"개인 브랜드평판 TOP 10", en:"Member brand reputation TOP 10", ja:"個人ブランド評判TOP10"},
  searches:   {ko:"급상승 관련검색어", en:"Rising related searches", ja:"急上昇の関連検索"},
  archive:    {ko:"쇼츠 카드", en:"Shorts cards", ja:"ショートカード"},
  emoticon:   {ko:"카카오 이모티콘 인기 순위", en:"KakaoTalk emoticon ranking", ja:"カカオ絵文字の人気順位"},
  milestone:  {ko:"100만 돌파일", en:"1M milestone date", ja:"100万到達日"},
  status:     {ko:"수집 상태", en:"Collection status", ja:"収集状況"},
};

/* ── 문장 ─────────────────────────────────────────────────────────────── */
const STR = {

/* 머리 · 공통 */
"doc.title":   {ko:"리센느, 지금", en:"RESCENE, Now", ja:"RESCENE、いま"},
"doc.desc":    {ko:"리센느(RESCENE) 유튜브 채널 분석 페이지입니다.",
                en:"A data page about RESCENE's YouTube channels.",
                ja:"RESCENE のYouTubeチャンネルをデータで見るページです。"},
"hdr.title1":  {ko:"리센느, ", en:"RESCENE, ", ja:"RESCENE、"},
"hdr.title2":  {ko:"지금", en:"Now", ja:"いま"},
"hdr.tagline": {ko:"리마인 야호!", en:"Rimine, yaho!", ja:"リマイン やっほー！"},
"hdr.langlabel":{ko:"언어 고르기", en:"Choose language", ja:"言語を選ぶ"},

"tab.group":   {ko:"채널 고르기", en:"Choose a channel", ja:"チャンネルを選ぶ"},
"tab.anw":     {ko:"안녕하세요원이입니다잘부탁드립니다", en:"Annyeonghaseyo Wony-imnida Jalbutakdeurimnida", ja:"アンニョンハセヨ ウォニイムニダ チャルブタットゥリムニダ"},
"tab.anw.sub": {ko:"원이 웹예능 · 솔파스튜디오", en:"Wony's web show · Solfa Studio", ja:"ウォニのウェブ番組・Solfa Studio"},
"tab.res":     {ko:"RESCENE", en:"RESCENE", ja:"RESCENE"},
"tab.res.sub": {ko:"리센느 공식 채널 · THE MUZE", en:"Official channel · THE MUZE", ja:"公式チャンネル・THE MUZE"},
"tab.goto":    {ko:k=>`${k} 채널로 넘어가기`, en:k=>`Switch to ${k}`, ja:k=>`${k} チャンネルに切り替える`},

"split":       {ko:"두 채널 공통 · 리센느라는 그룹",
                en:"Common to both channels · RESCENE the group",
                ja:"両チャンネル共通・グループとしてのRESCENE"},

/* 00 게이지 카드 */
"s0.anw":      {ko:"안녕하세요원이입니다잘부탁드립니다", en:"Annyeonghaseyo Wony-imnida Jalbutakdeurimnida", ja:"アンニョンハセヨ ウォニイムニダ チャルブタットゥリムニダ"},
"s0.anw.sub":  {ko:"원이 웹예능", en:"Wony's web show", ja:"ウォニのウェブ番組"},
"s0.res":      {ko:"리센느 공식 채널", en:"RESCENE official", ja:"RESCENE 公式"},
"s0.res.sub":  {ko:"THE MUZE", en:"THE MUZE", ja:"THE MUZE"},
"s0.done":     {ko:(d,g)=>`${d} ${g} 돌파 · 걸그룹 클럽 안으로`,
                en:(d,g)=>`Passed ${g} on ${d} · into the girl-group club`,
                ja:(d,g)=>`${d} に ${g} 突破・ガールグループクラブ入り`},
"s0.left":     {ko:(g,r)=>`${g}까지 남은 ${r} 명`,
                en:(g,r)=>`${r} to go until ${g}`,
                ja:(g,r)=>`${g} まであと ${r} 人`},
"s0.passed":   {ko:g=>`${g} 넘었다`, en:g=>`Past ${g}`, ja:g=>`${g} を超えた`},
"s0.pct":      {ko:p=>`${p}% 왔다`, en:p=>`${p}% there`, ja:p=>`${p}% 到達`},
"s0.asof":     {ko:"기준 ", en:"as of ", ja:"基準 "},

/* 01 네 개의 숫자 */
"s1.eye":      {ko:c=>`${c} 채널, 지금`, en:c=>`${c} channel, right now`, ja:c=>`${c} チャンネル、いま`},
"s1.h":        {ko:"네 개의 숫자", en:"Four numbers", ja:"四つの数字"},
"s1.subs":     {ko:"구독자", en:"Subscribers", ja:"登録者"},
"s1.views":    {ko:"누적 조회수", en:"Total views", ja:"累計再生数"},
"s1.likes":    {ko:"누적 좋아요", en:"Total likes", ja:"累計高評価"},
"s1.count":    {ko:"올린 편수", en:"Uploads", ja:"投稿数"},
"s1.subs.done":{ko:d=>`${d} 100만 돌파`, en:d=>`Passed 1M on ${d}`, ja:d=>`${d} に100万突破`},
"s1.subs.left":{ko:n=>`100만까지 ${n}`, en:n=>`${n} to go until 1M`, ja:n=>`100万まで ${n}`},
"s1.subs.mul": {ko:m=>`리센느 공식의 ${m}배`, en:m=>`${m}× the official channel`, ja:m=>`公式チャンネルの ${m}倍`},
"s1.views.d":  {ko:n=>`올린 ${n}편 전부`, en:n=>`all ${n} uploads`, ja:n=>`投稿 ${n}本すべて`},
"s1.likes.hid":{ko:n=>`좋아요 숨긴 ${n}편은 빠졌다`, en:n=>`${n} with likes hidden are excluded`, ja:n=>`高評価を隠した ${n}本は除く`},
"s1.likes.non":{ko:"숨긴 편 없다", en:"none hidden", ja:"隠している動画はない"},
"s1.foot":     {ko:(d,n)=>`구독자가 <b>1만 단위로 뛰는 건 사실 그대로다</b> — 유튜브가 공개하는 구독자 수는 유효숫자 3자리 반올림이다. 조회수·좋아요는 <b>${d}</b> 에 이 채널의 영상 ${n}편을 하나씩 다시 재서 더한 값이다.`,
                en:(d,n)=>`The subscriber count <b>really does jump in steps</b> — YouTube publishes it rounded to three significant digits. Views and likes were re-measured on <b>${d}</b>, one by one across all ${n} uploads, and summed.`,
                ja:(d,n)=>`登録者数が<b>とびとびに動くのは事実そのまま</b>です — YouTubeの公開値は有効数字3桁に丸められています。再生数・高評価は <b>${d}</b> に全 ${n}本を1本ずつ測り直して合計した値です。`},

/* 02 구글 검색 관심도 */
"s2.eye":      {ko:"구글 검색 관심도", en:"Google search interest", ja:"Google検索の関心度"},
"s2.h":        {ko:"110주 동안 곡선은 바닥에 있었다",
                en:"The curve sat on the floor for 110 weeks",
                ja:"110週のあいだ、曲線は底に張りついていた"},
"s2.sub":      {ko:(a,b)=>`데뷔 후 ${a}주 중 ${b}주가 4 이하였다. 그 사이 앨범이 6장 나왔지만 곡선은 움직이지 않았다.`,
                en:(a,b)=>`Of the ${a} weeks since debut, ${b} sat at 4 or below. Six albums came out in that stretch and the curve did not move.`,
                ja:(a,b)=>`デビュー後の ${a}週のうち ${b}週が 4以下でした。その間にアルバムが6枚出ましたが、曲線は動きませんでした。`},
"s2.scale":    {ko:"가장 높은 주가 100이다.", en:"The highest week is 100.", ja:"最も高い週を100としています。"},
"s2.lg.line":  {ko:"검색 관심도", en:"Search interest", ja:"検索の関心度"},
"s2.lg.rel":   {ko:"앨범 발매", en:"Album release", ja:"アルバム発売"},
"s2.lg.up":    {ko:"안녕하세요원이입니다잘부탁드립니다 업로드", en:"Annyeonghaseyo Wony-imnida Jalbutakdeurimnida upload", ja:"アンニョンハセヨ ウォニイムニダ チャルブタットゥリムニダ 投稿"},
"s2.lg.up2":   {ko:"(높을수록 많이 본 편)", en:"(taller = more views)", ja:"（高いほど再生数が多い）"},
"s2.aria":     {ko:(n,v)=>`구글 검색 관심도 주간 곡선 ${n}주. 최근 값 ${v}, 최고 100.`,
                en:(n,v)=>`Weekly Google search interest, ${n} weeks. Latest ${v}, peak 100.`,
                ja:(n,v)=>`Google検索関心度の週次曲線 ${n}週。直近 ${v}、最高100。`},
"s2.recent":   {ko:n=>`최근 ${n}주`, en:n=>`last ${n} weeks`, ja:n=>`直近 ${n}週`},
"s2.lane":     {ko:n=>`안녕하세요원이입니다잘부탁드립니다 업로드 ${n}편`, en:n=>`${n} uploads`, ja:n=>`投稿 ${n}本`},
"s2.tip":      {ko:(d,v,r)=>`${d} 주<br><b>${v}</b>${r?` · ${r} 발매`:""}`,
                en:(d,v,r)=>`week of ${d}<br><b>${v}</b>${r?` · ${r} released`:""}`,
                ja:(d,v,r)=>`${d} の週<br><b>${v}</b>${r?` · ${r} 発売`:""}`},
"s2.foot":     {ko:(d,v,seg,a,b,note)=>`유일한 예외는 ${d} 한 주(${v})인데 앨범이 아니라 다른 일 때문이었고 다음 주 4로 돌아왔다. <b>${seg}</b> 90일 동안 발매가 하나도 없었지만 값은 ${a}에서 ${b}으로 올랐다. 다만 ${note}`,
                en:(d,v,seg,a,b,note)=>`The one exception is the week of ${d} (${v}) — not an album but something else, and it fell back to 4 the next week. Across <b>${seg}</b>, 90 days with no release at all, the value still climbed from ${a} to ${b}. That said, ${note}`,
                ja:(d,v,seg,a,b,note)=>`唯一の例外は ${d} の週（${v}）で、アルバムではなく別の出来事が理由でした。翌週には4に戻っています。<b>${seg}</b> の90日間は発売が一つもありませんでしたが、値は ${a} から ${b} に上がりました。ただし ${note}`},
"s2.table":    {ko:"숫자로 보기 — 주간 값 표", en:"See the numbers — weekly table", ja:"数字で見る — 週次の表"},
"s2.meaning":  {ko:null,
                en:"A relative index, not a count of searches.",
                ja:"検索件数ではなく、相対的な指数です。"},
"s2.caution":  {ko:null,
                en:"the trend rise and the uploads are two facts in the same period — we do not claim causation.",
                ja:"トレンドの上昇と動画投稿は同じ時期に起きた二つの事実です — 因果は断定しません。"},

/* 03 안원잘부 구독자 순위 */
"s3.eye":      {ko:"안녕하세요원이입니다잘부탁드립니다 구독자 순위", en:"Annyeonghaseyo Wony-imnida Jalbutakdeurimnida — subscriber rank", ja:"アンニョンハセヨ ウォニイムニダ チャルブタットゥリムニダ の登録者順位"},
"s3.h":        {ko:"27주 동안 한 번도 내려가지 않았다",
                en:"27 weeks without a single step back",
                ja:"27週のあいだ、一度も下がらなかった"},
"s3.scalenote":{ko:"세로축은 한국 구독자 순위다. 위로 갈수록 높은 순위이고, 눈금은 로그다 — 아래쪽 한 칸이 위쪽 한 칸보다 훨씬 많은 순위를 담는다.",
                en:"The vertical axis is Korean subscriber rank. Higher is better, and the scale is logarithmic — one step near the bottom covers far more ranks than one step near the top.",
                ja:"縦軸は韓国内の登録者順位です。上ほど高順位で、目盛りは対数です — 下の1目盛りは上の1目盛りよりずっと多くの順位を含みます。"},
"s3.sub":      {ko:(seg,a,b,c)=>`${seg} 사이 한국 구독자 순위가 ${a}위에서 ${b}위로 올랐다. 내려간 주는 ${c}이다.`,
                en:(seg,a,b,c)=>`Between ${seg}, the Korean subscriber rank climbed from #${a} to #${b}. Weeks it went down: ${c}.`,
                ja:(seg,a,b,c)=>`${seg} のあいだに韓国の登録者順位が ${a}位から ${b}位へ上がりました。下がった週は ${c}です。`},
"s3.aria":     {ko:(a,b)=>`안녕하세요원이입니다잘부탁드립니다 한국 구독자 순위 계단. ${a}위에서 ${b}위로.`,
                en:(a,b)=>`Annyeonghaseyo Wony-imnida Jalbutakdeurimnida — Korean subscriber rank, step chart. From #${a} to #${b}.`,
                ja:(a,b)=>`アンニョンハセヨ ウォニイムニダ チャルブタットゥリムニダ の韓国登録者順位。${a}位から ${b}位へ。`},
"s3.rank":     {ko:v=>`${v}위`, en:v=>`#${v}`, ja:v=>`${v}位`},
"s3.flag1":    {ko:"구독 100만", en:"1M subscribers", ja:"登録100万"},
"s3.flag2":    {ko:"1,000위 진입", en:"into the top 1,000", ja:"1,000位に到達"},
"s3.tip":      {ko:(d,r,s)=>`${d}<br>한국 <b>${r}위</b> · 구독 ${s}`,
                en:(d,r,s)=>`${d}<br>Korea <b>#${r}</b> · ${s} subscribers`,
                ja:(d,r,s)=>`${d}<br>韓国 <b>${r}位</b> · 登録 ${s}`},
"s3.foot":     {ko:(d,st,avg,src)=>`가장 크게 오른 주는 ${d} 이후 ${st}계단을 오르는 동안의 한 주였다. 일별 평균 증가는 ${avg}명이다. 출처는 ${src}이고 공개 API 가 없어 페이지를 읽는 방식이라 <b>수집이 가장 잘 깨지는 항목</b>이다.`,
                en:(d,st,avg,src)=>`The biggest single week came during the ${st}-rank climb that started ${d}. Average daily gain is ${avg}. Source: ${src}; there is no public API, so we read the page — <b>this is the most fragile item we collect</b>.`,
                ja:(d,st,avg,src)=>`最も大きく上がった週は、${d} 以降の ${st}段の上昇のなかの一週でした。1日平均の増加は ${avg}人です。出典は ${src} で、公開APIが無くページを読む方式のため<b>最も壊れやすい項目</b>です。`},

/* 04 뮤직비디오 */
"s4.eye":      {ko:"뮤직비디오", en:"Music videos", ja:"ミュージックビデオ"},
"s4.h":        {ko:"11편 중 절반이 최근 1년에 나왔다",
                en:"Half of the 11 came out in the last year",
                ja:"11本のうち半分が直近1年に出た"},
"s4.lg.new":   {ko:"최근 1년", en:"last 12 months", ja:"直近1年"},
"s4.lg.old":   {ko:"그 이전", en:"before that", ja:"それ以前"},
"s4.sub":      {ko:(n,t,c,p)=>`본편 ${n}편 누적 ${t}. 최근 1년에 올라온 ${c}편이 ${p}%를 가져갔다.`,
                en:(n,t,c,p)=>`${n} main videos, ${t} views in total. The ${c} released in the last year took ${p}% of that.`,
                ja:(n,t,c,p)=>`本編 ${n}本で累計 ${t}。直近1年の ${c}本が ${p}%を占めています。`},
"s4.aria":     {ko:(s,v,d)=>`${s} ${v}회, ${d} 공개`, en:(s,v,d)=>`${s}, ${v} views, released ${d}`, ja:(s,v,d)=>`${s} ${v}回、${d} 公開`},
"s4.foot":     {ko:n=>`티저 · Performance ver. · 일본어판 · Special Video 를 뺀 <b>본편 ${n}편</b>이다. 줄을 누르면 유튜브로 간다. 썸네일은 유튜브에서 그대로 불러온다.`,
                en:n=>`<b>${n} main videos</b>, excluding teasers, performance versions, Japanese editions and special videos. Tap a row to open YouTube. Thumbnails are loaded from YouTube.`,
                ja:n=>`ティーザー・Performance ver.・日本語版・Special Video を除いた<b>本編 ${n}本</b>です。行を押すとYouTubeへ移動します。サムネイルはYouTubeから読み込んでいます。`},

/* 03 영상 랭킹 */
"sv.eye":      {ko:"영상 랭킹", en:"Video ranking", ja:"動画ランキング"},
"sv.metric":   {ko:"무엇으로 줄 세울까", en:"Sort by", ja:"並べ替えの基準"},
"sv.kind":     {ko:"형식", en:"Format", ja:"形式"},
"sv.howmany":  {ko:"몇 편까지", en:"How many", ja:"何本まで"},
"sv.h":        {ko:(m,n)=>`${m} 상위 ${n}편`, en:(m,n)=>`Top ${n} by ${m.toLowerCase()}`, ja:(m,n)=>`${m} 上位 ${n}本`},
"sv.sub":      {ko:(ch,kind,n,m,top,unit)=>`${ch} 채널의 ${kind}${n}편을 ${m}로 줄 세운 것이다. ${top}`,
                en:(ch,kind,n,m,top,unit)=>`All ${n} ${kind}uploads on the ${ch} channel, sorted by ${m.toLowerCase()}. ${top}`,
                ja:(ch,kind,n,m,top,unit)=>`${ch} チャンネルの ${kind}${n}本を ${m} で並べたものです。${top}`},
"sv.sub.top":  {ko:(v,unit)=>`1위 한 편이 ${v}${unit}다.`,
                en:(v,unit)=>`The top one has ${v} ${unit}.`,
                ja:(v,unit)=>`1位の1本が ${v}${unit}です。`},
"sv.sub.hid":  {ko:n=>`좋아요를 숨긴 ${n}편은 여기에 못 들어온다.`,
                en:n=>`${n} uploads with likes hidden cannot appear here.`,
                ja:n=>`高評価を隠した ${n}本はここに入りません。`},
"sv.unit.view":{ko:"회", en:"views", ja:"回"},
"sv.unit.like":{ko:"개", en:"likes", ja:"件"},
"sv.ch.res":   {ko:"RESCENE 공식", en:"RESCENE official", ja:"RESCENE 公式"},
"sv.ch.anw":   {ko:"안녕하세요원이입니다잘부탁드립니다", en:"Annyeonghaseyo Wony-imnida Jalbutakdeurimnida", ja:"アンニョンハセヨ ウォニイムニダ チャルブタットゥリムニダ"},
"sv.empty":    {ko:"이 형식에는 남긴 영상이 없다.", en:"No videos kept for this format.", ja:"この形式で残している動画はありません。"},
"sv.aria":     {ko:(i,t,m,v)=>`${i}위 ${t}, ${m} ${v}`, en:(i,t,m,v)=>`#${i} ${t}, ${m} ${v}`, ja:(i,t,m,v)=>`${i}位 ${t}、${m} ${v}`},
"sv.likehid":  {ko:"숨김", en:"hidden", ja:"非表示"},
"sv.meta.like":{ko:v=>`  ·  좋아요 ${v}`, en:v=>`  ·  ${v} likes`, ja:v=>`  ·  高評価 ${v}`},
"sv.meta.view":{ko:v=>`  ·  조회 ${v}`, en:v=>`  ·  ${v} views`, ja:v=>`  ·  再生 ${v}`},
"sv.foot":     {ko:(d,how,all,keep,perkind,miss)=>`줄을 누르면 유튜브로 간다. 썸네일은 유튜브에서 그대로 불러온다. <b>${d}</b> 에 ${how} 으로 이 채널 전편(${all}편)을 재고, 저장소에는 조회수·좋아요 상위 ${keep}편(형식마다 ${perkind}편)만 남긴다 — 위 타일의 누적값은 남긴 편이 아니라 <b>전편</b>을 더한 값이다.${miss}`,
                en:(d,how,all,keep,perkind,miss)=>`Tap a row to open YouTube. Thumbnails are loaded from YouTube. On <b>${d}</b> we measured every upload on this channel (${all} of them) via ${how}, and keep only the top ${keep} by views and likes (${perkind} per format) in the repository — the totals in the tiles above are the sum of <b>all</b> uploads, not just the kept ones.${miss}`,
                ja:(d,how,all,keep,perkind,miss)=>`行を押すとYouTubeへ移動します。サムネイルはYouTubeから読み込んでいます。<b>${d}</b> に ${how} でこのチャンネルの全 ${all}本を測り、保存庫には再生数・高評価の上位 ${keep}本（形式ごとに ${perkind}本）だけを残しています — 上のタイルの累計は残した分ではなく<b>全本</b>の合計です。${miss}`},
"sv.foot.miss":{ko:n=>` 이번 수집에서 ${n}편은 조회에 실패해 빠졌다.`,
                en:n=>` ${n} uploads failed to fetch in this run and are missing.`,
                ja:n=>` 今回の収集で ${n}本は取得に失敗し、抜けています。`},
"sv.titlenote":{ko:null,
                en:"Video titles are shown in the original Korean.",
                ja:"動画タイトルは元の韓国語のまま表示しています。"},
"u.hour":      {ko:(h,m)=>`${h}시간 ${m}분`, en:(h,m)=>`${h}h ${m}m`, ja:(h,m)=>`${h}時間${m}分`},
"u.min":       {ko:(m,s)=>`${m}분 ${s}초`, en:(m,s)=>`${m}m ${s}s`, ja:(m,s)=>`${m}分${s}秒`},
"u.sec":       {ko:s=>`${s}초`, en:s=>`${s}s`, ja:s=>`${s}秒`},

/* 04 라이브 아카이브 */
"s10.eye":     {ko:"라이브 아카이브", en:"Live archive", ja:"ライブアーカイブ"},
/* 편수는 매일 는다 — 문구에 박아 두면 하루 만에 거짓이 된다. 그리기_streams 가 다시 쓴다. */
"s10.h":       {ko:(y,m,n)=>`${y}년${m ? " " + m + "개월" : ""}, ${n}번의 라이브`,
                en:(y,m,n)=>`${y} year${y===1?"":"s"}${m ? ` ${m} month${m===1?"":"s"}` : ""}, ${n} live streams`,
                ja:(y,m,n)=>`${y}年${m ? m + "か月" : ""}、${n}回のライブ`},
"s10.sub":     {ko:(n,m)=>`공식 채널 라이브 탭 ${n}편을 전부 받아 방송 간격·길이·썸네일 얼굴·조회수를 세었다. 사흘에 한 번꼴로 켰고, 한 번 켜면 평균 ${m}분이다.`,
                en:(n,m)=>`We pulled all ${n} streams from the official channel's Live tab and measured the gaps, lengths, faces in thumbnails and views. Roughly one every three days, averaging ${m} minutes each.`,
                ja:(n,m)=>`公式チャンネルのライブタブから全 ${n}本を取得し、間隔・長さ・サムネイルの顔・再生数を数えました。3日に1回ほどの頻度で、1回あたり平均 ${m}分です。`},
"s10.t1":      {ko:"라이브 편수", en:"Streams", ja:"ライブ本数"},
"s10.t1d":     {ko:d=>`${d} 첫 방송부터`, en:d=>`since the first on ${d}`, ja:d=>`${d} の初回から`},
"s10.t2":      {ko:"방송 간격", en:"Gap between streams", ja:"配信の間隔"},
"s10.t2v":     {ko:d=>`${d}일`, en:d=>`${d} days`, ja:d=>`${d}日`},
"s10.t2d":     {ko:a=>`중앙값 · 평균 ${a}일`, en:a=>`median · mean ${a} days`, ja:a=>`中央値・平均 ${a}日`},
"s10.t3":      {ko:"평균 길이", en:"Average length", ja:"平均の長さ"},
"s10.t3v":     {ko:m=>`${m}분`, en:m=>`${m} min`, ja:m=>`${m}分`},
"s10.t3d":     {ko:p=>`한 시간 넘는 편이 ${p}%`, en:p=>`${p}% run over an hour`, ja:p=>`1時間超が ${p}%`},
"s10.t4":      {ko:"누적 방송시간", en:"Total airtime", ja:"累計配信時間"},
"s10.t4v":     {ko:h=>`${h}시간`, en:h=>`${h} h`, ja:h=>`${h}時間`},
"s10.t4d":     {ko:"다 보려면 12일 넘게 걸린다", en:"over 12 days to watch it all", ja:"全部見るには12日以上かかる"},
"s10.monthnote":{ko:(a,b,c)=>`월별 편수다. 2024년 ${a}편 → 2025년 ${b}편 → 2026년 ${c}편(8월까지). <b>뜸해졌지만 한 편이 받는 조회수는 자릿수가 달라졌다</b> — 아래 월별 평균 조회수를 같이 볼 것.`,
                en:(a,b,c)=>`Streams per month. ${a} in 2024 → ${b} in 2025 → ${c} in 2026 (through August). <b>They got rarer, but the views one stream pulls changed by an order of magnitude</b> — read it together with the monthly average below.`,
                ja:(a,b,c)=>`月別の本数です。2024年 ${a}本 → 2025年 ${b}本 → 2026年 ${c}本（8月まで）。<b>本数は減りましたが、1本あたりの再生数は桁が変わりました</b> — 下の月別平均再生数と併せて見てください。`},
"s10.month.aria":{ko:"월별 라이브 편수", en:"Streams per month", ja:"月別のライブ本数"},
"s10.month.tip":{ko:(ym,v,m,av)=>`<b>${ym}</b> · ${v}편<br>평균 ${m}분 · 평균 ${av}회`,
                en:(ym,v,m,av)=>`<b>${ym}</b> · ${v} streams<br>avg ${m} min · avg ${av} views`,
                ja:(ym,v,m,av)=>`<b>${ym}</b> · ${v}本<br>平均 ${m}分・平均 ${av}回`},
"s10.hour.h":  {ko:"시작 시각 (KST)", en:"Start time (KST)", ja:"開始時刻（KST）"},
"s10.hour.cap":{ko:(a,b)=>`밤 10시가 가장 많다. ${a}편이 22시대에 시작했고, 자정을 넘겨 시작한 편도 ${b}편이다.`,
                en:(a,b)=>`10 pm is the most common. ${a} started in the 10 pm hour, and ${b} started after midnight.`,
                ja:(a,b)=>`夜10時台が最も多いです。${a}本が22時台に始まり、日付をまたいで始まった回も ${b}本あります。`},
"s10.hour.aria":{ko:"시작 시각별 편수", en:"Streams by start hour", ja:"開始時刻別の本数"},
"s10.hour.tip":{ko:(h,v)=>`<b>${h}시대</b> · ${v}편`, en:(h,v)=>`<b>${h}:00–${h}:59</b> · ${v} streams`, ja:(h,v)=>`<b>${h}時台</b> · ${v}本`},
"s10.dow.h":   {ko:"요일", en:"Day of week", ja:"曜日"},
"s10.dow.cap": {ko:"수·토가 조금 많지만 요일 쏠림은 거의 없다.",
                en:"Wednesday and Saturday lead slightly, but there is almost no weekday bias.",
                ja:"水曜・土曜がやや多いものの、曜日の偏りはほとんどありません。"},
"s10.dow.aria":{ko:"요일별 편수", en:"Streams by day of week", ja:"曜日別の本数"},
"s10.dow.tip": {ko:(d,v)=>`<b>${d}요일</b> · ${v}편`, en:(d,v)=>`<b>${d}</b> · ${v} streams`, ja:(d,v)=>`<b>${d}曜日</b> · ${v}本`},
"s10.durnote": {ko:m=>`러닝타임 분포다(분). 네 편 중 세 편이 한 시간을 넘고, 다섯 편 중 한 편은 두 시간을 넘긴다. 가장 긴 편은 <b>${m}분</b>짜리 「어디까엉???」이다.`,
                en:m=>`Runtime distribution (minutes). Three in four run over an hour; one in five runs over two. The longest is <b>${m} minutes</b> — 「어디까엉???」.`,
                ja:m=>`配信時間の分布（分）です。4本に3本が1時間を超え、5本に1本は2時間を超えます。最長は <b>${m}分</b> の「어디까엉???」です。`},
"s10.dur.aria":{ko:"러닝타임 구간별 편수", en:"Streams by runtime band", ja:"配信時間帯別の本数"},
"s10.dur.tip": {ko:(k,v)=>`<b>${k}분</b> · ${v}편`, en:(k,v)=>`<b>${k} min</b> · ${v} streams`, ja:(k,v)=>`<b>${k}分</b> · ${v}本`},
"s10.mem.h":   {ko:"누가 나오나", en:"Who shows up", ja:"誰が出るか"},
"s10.mem.solo":{ko:"혼자 켠 방송", en:"solo streams", ja:"一人での配信"},
"s10.mem.with":{ko:"둘 이상 함께", en:"two or more together", ja:"2人以上で"},
"s10.mem.sub": {ko:(all,ided,top,topn,s1,s1n)=>`썸네일 얼굴을 다섯 명으로 가르고 제목의 별명(메라디오·원쨩·까엉 등)을 합쳐 출연을 추정했다. ${all}편 중 ${ided}편에서 최소 한 명을 특정했다. ${top}가 ${topn}편으로 가장 많이 얼굴을 비쳤고, 혼자 켠 방송은 ${s1}가 ${s1n}편으로 가장 많다.`,
                en:(all,ided,top,topn,s1,s1n)=>`We sorted thumbnail faces into the five members and folded in nicknames from titles (Meradio, Wonjjang, Kkaeong…). In ${ided} of ${all} streams at least one member was identified. ${top} appears most often at ${topn}, and ${s1} has the most solo streams at ${s1n}.`,
                ja:(all,ided,top,topn,s1,s1n)=>`サムネイルの顔を5人に分け、タイトルの愛称（メラジオ・ウォンちゃん・ッカオンなど）も合わせて出演を推定しました。全 ${all}本のうち ${ided}本で少なくとも1人を特定しています。最も多く顔を出したのは ${top} の ${topn}本、一人での配信は ${s1} の ${s1n}本が最多です。`},
"s10.mem.stale":{ko:(d,n)=>`얼굴 판별은 ${d} 에 돌린 것이고, 그 뒤 늘어난 ${n}편은 위의 편수·시간에만 들어간다.`,
                en:(d,n)=>`The face pass was run on ${d}; the ${n} streams added since count only toward the totals above.`,
                ja:(d,n)=>`顔の判別は ${d} 時点のものです。その後に増えた ${n}本は上の本数・時間にのみ含まれます。`},
"s10.mem.row": {ko:(a,b,h)=>`혼자 ${a}편  ·  함께 ${b}편  ·  얼굴이 잡힌 총 시간 ${h}시간`,
                en:(a,b,h)=>`${a} solo  ·  ${b} with others  ·  ${h} h on camera`,
                ja:(a,b,h)=>`一人 ${a}本  ·  一緒 ${b}本  ·  顔が映った合計 ${h}時間`},
"s10.mem.val": {ko:n=>`${n}편`, en:n=>`${n}`, ja:n=>`${n}本`},
"s10.mem.foot":{ko:(a,b)=>`<b>판별 방법과 한계.</b> ${a} ${b}`,
                en:(a,b)=>`<b>How it was identified, and the limits.</b> ${a} ${b}`,
                ja:(a,b)=>`<b>判別の方法と限界。</b> ${a} ${b}`},
"s10.combo.h": {ko:"자주 붙는 조합", en:"Common line-ups", ja:"よくある組み合わせ"},
"s10.combo.th1":{ko:"출연 (추정)", en:"Line-up (estimated)", ja:"出演（推定）"},
"s10.combo.th2":{ko:"편수", en:"Streams", ja:"本数"},
"s10.combo.th3":{ko:"평균 조회수", en:"Avg views", ja:"平均再生数"},
"s10.combo.sub":{ko:(a,b,c)=>`혼자 켠 방송이 ${a}편, 둘이 ${b}편이다. 다섯 명이 다 잡힌 건 ${c}편뿐인데 쇼케이스·기념일처럼 다 모이는 자리였다.`,
                en:(a,b,c)=>`${a} were solo and ${b} had two. All five appear in only ${c} — showcases, anniversaries, the occasions where everyone gathers.`,
                ja:(a,b,c)=>`一人での配信が ${a}本、2人が ${b}本です。5人全員が映ったのは ${c}本だけで、ショーケースや記念日など全員が集まる場でした。`},
"s10.combo.all":{ko:"다섯 명 전원", en:"all five", ja:"5人全員"},
"s10.combo.solo":{ko:n=>`${n} 혼자`, en:n=>`${n} alone`, ja:n=>`${n} 一人`},
"s10.view.h":  {ko:"월별 평균 조회수", en:"Average views by month", ja:"月別の平均再生数"},
"s10.view.note":{ko:"라이브 한 편이 받는 평균 조회수다. 편수가 아니라 <b>한 편당</b> 값이라 채널이 커진 만큼 그대로 올라간다.",
                en:"Average views a single stream gets. This is <b>per stream</b>, not a count, so it rises as the channel grows.",
                ja:"ライブ1本あたりの平均再生数です。本数ではなく<b>1本あたり</b>の値なので、チャンネルが大きくなった分そのまま上がります。"},
"s10.view.sub":{ko:(v,l,med)=>`라이브 다시보기 누적 ${v}회, 좋아요 ${l}개. 편당 중앙값은 ${med}회다. 2026년 3월부터 자릿수가 바뀐다.`,
                en:(v,l,med)=>`${v} total views on the replays, ${l} likes. The median per stream is ${med}. From March 2026 the order of magnitude changes.`,
                ja:(v,l,med)=>`ライブ再視聴の累計 ${v}回、高評価 ${l}件。1本あたりの中央値は ${med}回です。2026年3月から桁が変わります。`},
"s10.view.aria":{ko:"월별 평균 조회수", en:"Average views by month", ja:"月別の平均再生数"},
"s10.view.tip":{ko:(ym,v,n,r)=>`<b>${ym}</b> · 평균 ${v}회<br>${n}편 · 좋아요율 ${r}%`,
                en:(ym,v,n,r)=>`<b>${ym}</b> · avg ${v} views<br>${n} streams · like rate ${r}%`,
                ja:(ym,v,n,r)=>`<b>${ym}</b> · 平均 ${v}回<br>${n}本・高評価率 ${r}%`},
"s10.foot":    {ko:(a,b)=>`<b>멤버별 조회수를 그대로 비교하면 안 된다.</b> 채널이 커지는 동안 조회수가 통째로 올라, 최근에 방송을 많이 한 멤버가 유리하다. 같은 달 라이브 평균 대비 배수로 보정하면 다섯 명의 중앙값이 ${a}~${b}로 사실상 같다. 멤버 간 차이는 인기 차이라기보다 <b>방송 시점 차이</b>다. 한 편씩의 조회수·좋아요 순위는 위 <b>영상 랭킹</b>에서 형식을 「라이브」로 고르면 나온다 — 그쪽이 매주 갱신되는 값이다.`,
                en:(a,b)=>`<b>Do not compare per-member views as they are.</b> Views rose across the board as the channel grew, which favours whoever streamed more recently. Normalised against the same month's average, the five members' medians land at ${a}–${b} — effectively the same. The differences say more about <b>when</b> they streamed than about popularity. For per-stream view and like rankings, pick "live" in the <b>Video ranking</b> above — that one refreshes weekly.`,
                ja:(a,b)=>`<b>メンバー別の再生数をそのまま比べてはいけません。</b> チャンネルが大きくなる間に再生数が全体的に上がったため、最近多く配信したメンバーが有利になります。同じ月のライブ平均に対する倍率で補正すると、5人の中央値は ${a}〜${b} でほぼ同じです。差は人気の差というより<b>配信した時期の差</b>です。1本ごとの再生数・高評価の順位は上の<b>動画ランキング</b>で形式を「ライブ」にすると出ます — そちらは毎週更新されます。`},

/* 04 카카오 이모티콘 */
"s11.eye":     {ko:"카카오 이모티콘", en:"KakaoTalk emoticons", ja:"カカオ絵文字"},
"s11.h.all":   {ko:n=>`${n} 탭이 전부 같은 1위`, en:n=>`#1 in all ${n} tabs`, ja:n=>`${n}つのタブすべてで1位`},
"s11.h.some":  {ko:(n,k)=>`${n} 탭 중 ${k} 곳에서 1위`, en:(n,k)=>`#1 in ${k} of ${n} tabs`, ja:(n,k)=>`${n}タブ中 ${k}か所で1位`},
"s11.h.best":  {ko:r=>`연령 탭 최고 ${r}위`, en:r=>`Best age-tab rank: #${r}`, ja:r=>`年齢タブ最高 ${r}位`},
"s11.h.out":   {ko:"인기 50위 밖", en:"Outside the top 50", ja:"人気50位圏外"},
"s11.sub":     {ko:(name,kinds,tail)=>`카카오 이모티콘 「${name}」은 안녕하세요원이입니다잘부탁드립니다 장면 ${kinds}종으로 만들어졌다. 인기 순위는 나이대별로 탭이 갈리는데, ${tail}`,
                en:(name,kinds,tail)=>`The KakaoTalk emoticon set 「${name}」 is built from ${kinds} scenes out of Annyeonghaseyo Wony-imnida Jalbutakdeurimnida. The popularity chart splits into tabs by age group, and ${tail}`,
                ja:(name,kinds,tail)=>`カカオ絵文字「${name}」はアンニョンハセヨ ウォニイムニダ チャルブタットゥリムニダ の場面 ${kinds}種で作られています。人気順位は年代別にタブが分かれていて、${tail}`},
"s11.sub.all": {ko:(n,k)=>`${n} 탭 전부에서 1위다.`,
                en:(n,k)=>`it is #1 in all ${n} tabs.`,
                ja:(n,k)=>`${n}タブすべてで1位です。`},
"s11.sub.some":{ko:s=>`지금은 ${s}다.`, en:s=>`right now it is ${s}.`, ja:s=>`いまは ${s} です。`},
"s11.t1":      {ko:"이모티콘", en:"Emoticons", ja:"絵文字"},
"s11.t1v":     {ko:n=>`${n}종`, en:n=>`${n}`, ja:n=>`${n}種`},
"s11.t1d":     {ko:d=>`${d} 출시`, en:d=>`released ${d}`, ja:d=>`${d} 発売`},
"s11.t2.all":  {ko:"모든 탭에서", en:"In every tab", ja:"すべてのタブで"},
"s11.t2.best": {ko:"가장 높은 자리", en:"Best position", ja:"最も高い順位"},
"s11.t2v":     {ko:r=>`${r}위`, en:r=>`#${r}`, ja:r=>`${r}位`},
"s11.t2d":     {ko:n=>`${n} 연령 탭 기준`, en:n=>`across ${n} age tabs`, ja:n=>`${n}つの年齢タブで`},
"s11.t3":      {ko:"1위는", en:"Tops the tab", ja:"1位は"},
"s11.t3v":     {ko:n=>`${n}종류`, en:n=>`${n} sets`, ja:n=>`${n}種類`},
"s11.t3d":     {ko:n=>n === 1 ? "모든 탭이 같은 1위" : "탭마다 다른 이모티콘",
                en:n=>n === 1 ? "the same set tops every tab" : "a different set in each tab",
                ja:n=>n === 1 ? "すべてのタブで同じ1位" : "タブごとに違う絵文字"},
"s11.t4":      {ko:"가격", en:"Price", ja:"価格"},
"s11.t4v":     {ko:p=>`${p}원`, en:p=>`₩${p}`, ja:p=>`${p}ウォン`},
"s11.t4d":     {ko:(p,s)=>`정가 ${p}원 · ${s}`, en:(p,s)=>`list ₩${p} · ${s}`, ja:(p,s)=>`定価 ${p}ウォン・${s}`},
"s11.t4d0":    {ko:"정가", en:"list price", ja:"定価"},
"s11.rank.h":  {ko:"연령 탭마다 1위와 2위", en:"#1 and #2 in each age tab", ja:"年齢タブごとの1位と2位"},
"s11.rank.th1":{ko:"탭", en:"Tab", ja:"タブ"},
"s11.rank.th3":{ko:"그 탭 1위", en:"#1 in that tab", ja:"そのタブの1位"},
"s11.rank.sub":{ko:t=>`${t} 기준. 순위는 실시간으로 바뀌므로 이 화면은 잰 시각을 같이 적는다.`,
                en:t=>`As of ${t}. The ranking moves in real time, so we print the time it was read.`,
                ja:t=>`${t} 時点。順位はリアルタイムで変わるため、測った時刻も一緒に記しています。`},
"s11.rank.out":{ko:"50위 밖", en:"outside top 50", ja:"50位圏外"},
"s11.rank.foot":{ko:(src,d)=>`출처 <b>${src}</b>. 인기 순위는 카카오가 매기는 값이고 판매량 그 자체가 아니다. 가격·할인은 <b>${d}</b> 기준이며 할인은 한시적일 수 있다.`,
                en:(src,d)=>`Source: <b>${src}</b>. The popularity rank is Kakao's own metric, not sales volume. Price and discount are as of <b>${d}</b>; the discount may be temporary.`,
                ja:(src,d)=>`出典 <b>${src}</b>。人気順位はカカオが付ける値であり、販売数そのものではありません。価格・割引は <b>${d}</b> 時点で、割引は期間限定の場合があります。`},
"s11.src.h":   {ko:n=>`${n}종은 어느 편에서 나왔나`, en:n=>`Which episodes the ${n} came from`, ja:n=>`${n}種はどの回から出たか`},
"s11.src.sub": {ko:(k,n,t)=>`${k}종이 안녕하세요원이입니다잘부탁드립니다 ${n}편에서 나왔다. 상위 네 편이 ${t}종을 차지한다.`,
                en:(k,n,t)=>`The ${k} come from ${n} episodes of the channel. The top four account for ${t} of them.`,
                ja:(k,n,t)=>`${k}種がチャンネルの ${n}回から出ています。上位4回で ${t}種を占めます。`},
"s11.src.val": {ko:n=>`${n}종`, en:n=>`${n}`, ja:n=>`${n}種`},
"s11.list.sum":{ko:n=>`${n}종 전부 보기 — 문구 · 편 · 그 장면으로 바로 가기`,
                en:n=>`See all ${n} — line, episode, jump to the scene`,
                ja:n=>`${n}種すべて見る — セリフ・回・その場面へ`},
"s11.list.th2":{ko:"문구", en:"Line", ja:"セリフ"},
"s11.list.th3":{ko:"편", en:"Episode", ja:"回"},
"s11.list.th4":{ko:"장면", en:"Scene", ja:"場面"},
"s11.foot":    {ko:how=>`장면은 ${how} <b>카카오가 자막을 다시 쓴 것이 있다</b> — 거제 1편의 「마떼루용~」은 원본 화면자막이 「기다린다구~」이고, 첫TVCF 의 「와 이리 자주 봅니까?」는 원본이 「와 이래 많이 봅니까? 우리」다. 그래서 대사 검색으로는 못 찾고 프레임이 최종 근거다. 시각을 누르면 그 장면부터 재생된다. `,
                en:how=>`For the scenes: ${how} <b>Kakao rewrote some of the captions</b> — in Geoje part 1, 「마떼루용~」 appears on screen as 「기다린다구~」, and in the first TV-CF episode 「와 이리 자주 봅니까?」 is originally 「와 이래 많이 봅니까? 우리」. Searching the dialogue therefore fails; the frame itself is the final evidence. Tap a timestamp to start playback there. `,
                ja:how=>`場面については ${how} <b>カカオが字幕を書き直したものがあります</b> — 巨済1話の「마떼루용~」は元の画面字幕が「기다린다구~」、初TVCF回の「와 이리 자주 봅니까?」は元が「와 이래 많이 봅니까? 우리」です。そのためセリフ検索では見つからず、フレームが最終的な根拠になります。時刻を押すとその場面から再生されます。 `},
"s11.foot.link":{ko:"이모티콘 보러 가기", en:"Open the emoticon page", ja:"絵文字ページを見る"},
"s11.kornote": {ko:null,
                en:"Emoticon lines and episode titles are shown in the original Korean.",
                ja:"絵文字のセリフと回のタイトルは元の韓国語のまま表示しています。"},

/* 05 개인 브랜드평판 */
"s5.eye":      {ko:"개인 브랜드평판", en:"Member brand reputation", ja:"個人ブランド評判"},
"s5.h":        {ko:"TOP 10에 리센느가 다섯", en:"Five of the TOP 10 are RESCENE", ja:"TOP10のうち5人がRESCENE"},
"s5.lg.res":   {ko:"리센느", en:"RESCENE", ja:"RESCENE"},
"s5.lg.other": {ko:"그 외", en:"others", ja:"その他"},
"s5.sub":      {ko:(base,idx,n)=>`${base} ${idx}. 리센느는 5인조이니 TOP 10 안의 리센느 ${n}명이 곧 멤버 전원이다.`,
                en:(base,idx,n)=>`${base}, ${idx}. RESCENE is a five-piece, so the ${n} RESCENE members in the TOP 10 are the whole group.`,
                ja:(base,idx,n)=>`${base} ${idx}。RESCENEは5人組なので、TOP10に入る ${n}人はメンバー全員ということになります。`},
"s5.index":    {ko:null, en:"member brand reputation index", ja:"個人ブランド評判指数"},
"s5.foot":     {ko:(note,idx,man,org)=>`<b>${note}</b> 지수 ${idx}를 「언급 ${man} 건」으로 읽으면 안 된다. ${org} 발표이고 원표는 brikorea 에 있다. 매월 초 발표라 자동으로 갱신되지 않는다.`,
                en:(note,idx,man,org)=>`<b>${note}</b> An index of ${idx} must not be read as "${man} mentions". Published by ${org}; the source table lives at brikorea. It is released early each month and does not update automatically.`,
                ja:(note,idx,man,org)=>`<b>${note}</b> 指数 ${idx} を「言及 ${man}件」と読んではいけません。${org} の発表で、原表は brikorea にあります。毎月初の発表のため自動更新はされません。`},
"s5.clue":     {ko:null,
                en:"An index built from mentions and reactions. It is not a popularity vote and it has no unit.",
                ja:"言及と反応の量を集計した指数です。人気投票ではなく、単位もありません。"},

/* 06 걸그룹 100만 클럽 */
"s6.eye":      {ko:"걸그룹 100만 클럽", en:"Girl-group 1M club", ja:"ガールグループ100万クラブ"},
"s6.h.in":     {ko:(n,r)=>`${n}팀, 리센느가 ${r}번째`, en:(n,r)=>`${n} groups — RESCENE is #${r}`, ja:(n,r)=>`${n}組、RESCENEは ${r}番目`},
"s6.h.out":    {ko:(n,r)=>`${n}팀, 리센느는 ${r}번째`, en:(n,r)=>`${n} groups — RESCENE would be #${r}`, ja:(n,r)=>`${n}組、RESCENEは ${r}番目`},
"s6.sub":      {ko:(t,l,r,x)=>`걸그룹 유튜브 공식 채널 중 구독자 100만 이상. 1위 ${t}과 ${r}위 ${l}은 ${x}배 차이라 같은 축의 막대로 그리지 않는다.`,
                en:(t,l,r,x)=>`Girl-group official YouTube channels with a million or more subscribers. #1 at ${t} and #${r} at ${l} are ${x}× apart, so we do not draw them as bars on one axis.`,
                ja:(t,l,r,x)=>`登録者100万人以上のガールグループ公式YouTubeチャンネルです。1位の ${t} と ${r}位の ${l} は ${x}倍差なので、同じ軸の棒では描いていません。`},
"s6.threshold":{ko:"100만", en:"1M", ja:"100万"},
"s6.foot":     {ko:(d,anw,up,down,pos,ex)=>`<b>${d}</b> 기준 구독자다. 유튜브 공개 구독자는 유효숫자 3자리 반올림이라 끝자리를 단정할 수 없다. 참고로 <b>안녕하세요원이입니다잘부탁드립니다 ${anw}</b>을 이 표에 넣으면 ${up}와 ${down} 사이 ${pos}번째다 — 다만 그룹 공식 채널이 아니라 제작사 채널이라 표에는 넣지 않았다. ${ex}`,
                en:(d,anw,up,down,pos,ex)=>`Subscriber counts as of <b>${d}</b>. YouTube publishes them rounded to three significant digits, so the last digits cannot be pinned down. For reference, dropping <b>Annyeonghaseyo Wony-imnida Jalbutakdeurimnida at ${anw}</b> into this table would place it #${pos}, between ${up} and ${down} — but it is a production company's channel rather than a group's official one, so it is not included. ${ex}`,
                ja:(d,anw,up,down,pos,ex)=>`<b>${d}</b> 時点の登録者数です。YouTubeの公開値は有効数字3桁に丸められているため、末尾は断定できません。参考までに <b>アンニョンハセヨ ウォニイムニダ チャルブタットゥリムニダ ${anw}</b> をこの表に入れると ${up} と ${down} の間の ${pos}番目になります — ただしグループ公式ではなく制作会社のチャンネルのため表には入れていません。${ex}`},
"s6.exclude":  {ko:null,
                en:"Groups counted here follow the K-pop system even when the members are not Korean; a mixed-gender group is excluded.",
                ja:"メンバーが韓国籍でなくてもK-popの体系で制作されたグループは含め、混成グループは除いています。"},

/* 07 함께 검색된 말 */
"s7.eye":      {ko:"함께 검색된 말", en:"Searched alongside", ja:"一緒に検索された言葉"},
"s7.h":        {ko:"2년 동안 없던 말이 생겼다", en:"Words that were not there for two years", ja:"2年間なかった言葉が生まれた"},
"s7.left.h":   {ko:"데뷔 후 2년", en:"First two years", ja:"デビュー後2年"},
"s7.right.h":  {ko:"최근 16주 급상승", en:"Rising, last 16 weeks", ja:"直近16週の急上昇"},
"s7.tally":    {ko:n=>`팬이 되어야 나오는 검색 <b>${n}개</b>`,
                en:n=>`<b>${n}</b> searches only a fan would make`,
                ja:n=>`ファンでなければ出ない検索が <b>${n}件</b>`},
"s7.tally2":   {ko:(n,예)=>`팬이 되어야 나오는 검색 <b>${n}개</b>${예 ? ` — ${예}` : ""}`,
                en:(n,예)=>`<b>${n}</b> searches only a fan would make${예 ? ` — ${예}` : ""}`,
                ja:(n,예)=>`ファンでなければ出ない検索が <b>${n}件</b>${예 ? ` — ${예}` : ""}`},
"s7.meaning":  {ko:null,
                en:"\"Rising\" means the biggest increase in this period — not the highest number of searches.",
                ja:"「急上昇」はこの期間で最も伸びた順であり、検索件数が多い順ではありません。"},
/* 오타가 0 인 달이 있다. 「오타 0개도 그대로 두었다」는 말이 안 되므로 그 절을 통째로 뺀다. */
"s7.foot":     {ko:(ex,typo)=>`${ex}${typo ? ` 이름 오타 ${typo}개도 목록에 그대로 두었다 — 새로 알게 된 사람이 늘었다는 증거다.` : ""} 왼쪽은 값이 큰 순서, 오른쪽은 <b>늘어난 크기 순서</b>라 두 목록의 눈금이 다르다.`,
                en:(ex,typo)=>`${ex}${typo ? ` We also left ${typo} misspellings of the name in the list — evidence that more people are hearing it for the first time.` : ""} The left list is ordered by size, the right by <b>how much it grew</b>, so the two use different scales.`,
                ja:(ex,typo)=>`${ex}${typo ? ` 名前の誤字 ${typo}件もそのまま残しています — 新しく知った人が増えた証拠です。` : ""} 左は値の大きい順、右は<b>伸びた大きさの順</b>なので、二つのリストは目盛りが違います。`},
"s7.kornote":  {ko:null,
                en:"Search terms are shown as people actually typed them, in Korean.",
                ja:"検索語は実際に入力されたままの韓国語で表示しています。"},

/* 08 아카이브 */
"s8.eye":      {ko:"아카이브", en:"Archive", ja:"アーカイブ"},
"s8.h":        {ko:"우리가 세어 본 것들", en:"Things we have counted", ja:"数えてみたもの"},
"s8.desc":     {ko:null,
                en:"One-off counts that do not refresh are collected here. One card is one Shorts video.",
                ja:"更新されない一度きりの集計はすべてここにまとめています。カード1枚がショート1本です。"},
"s8.soon":     {ko:"공개 예정", en:"coming soon", ja:"公開予定"},
"s8.noimg":    {ko:"아직 안 올린 편", en:"not published yet", ja:"まだ公開していない回"},
"s8.kornote":  {ko:null,
                en:"Card titles are the actual Korean video titles.",
                ja:"カードのタイトルは実際の韓国語の動画タイトルです。"},

/* 09 출처 */
"s9.eye":      {ko:"출처", en:"Sources", ja:"出典"},
"s9.h":        {ko:"어디서 가져왔고 언제 잰 값인가", en:"Where it came from and when it was measured", ja:"どこから取り、いつ測った値か"},
"s9.sub":      {ko:"수집이 실패하면 화면에는 직전 값이 그대로 보이고, 이 표에 실패로 남는다.",
                en:"If a collection fails, the page keeps showing the previous value and the failure is recorded in this table.",
                ja:"収集に失敗した場合、画面には直前の値がそのまま表示され、この表に失敗として残ります。"},
"s9.th":       {ko:["항목","출처","기준","주기","결과"],
                en:["Item","Source","As of","Cadence","Result"],
                ja:["項目","出典","基準","頻度","結果"]},
"s9.ok":       {ko:"정상", en:"OK", ja:"正常"},
"s9.bad":      {ko:"실패", en:"failed", ja:"失敗"},

/* 꼬리 */
"ft.when":     {ko:(d,memo)=>`마지막 갱신 <b>${d}</b>. ${memo}`,
                en:(d,memo)=>`Last updated <b>${d}</b>. ${memo}`,
                ja:(d,memo)=>`最終更新 <b>${d}</b>。${memo}`},
"ft.memo":     {ko:null,
                en:"When a collection fails we do not overwrite the JSON — the failure is recorded here and the page keeps the previous value.",
                ja:"収集に失敗したときはJSONを上書きせず、ここに失敗として記録します。画面には直前の値がそのまま出ます。"},
"ft.unit":     {ko:"구글 트렌드 값과 브랜드평판 지수는 <b>단위 없는 상대 지표</b>다. 개수나 건수로 읽으면 안 된다. 유튜브가 공개하는 구독자 수는 유효숫자 3자리 반올림이라 1만 단위로 뛴다.",
                en:"Google Trends values and the brand reputation index are <b>relative indices with no unit</b>. They must not be read as counts. YouTube's public subscriber number is rounded to three significant digits, so it moves in steps.",
                ja:"Googleトレンドの値とブランド評判指数は<b>単位のない相対指標</b>です。件数として読んではいけません。YouTubeが公開する登録者数は有効数字3桁に丸められているため、とびとびに動きます。"},
"ft.same":     {ko:d=>`두 채널 구독자는 <b>${d}</b> 같은 시각에 쟀다.`,
                en:d=>`Both channels' subscriber counts were read at the same time on <b>${d}</b>.`,
                ja:d=>`両チャンネルの登録者数は <b>${d}</b> の同じ時刻に測りました。`},
"ft.gap":      {ko:(a,b,m)=>`리센느 공식은 <b>${a}</b>, 안녕하세요원이입니다잘부탁드립니다 는 <b>${b}</b> 기준이라 이틀 차이가 난다 — ${m}배라는 값도 그만큼 어림이다. 자동 갱신이 붙으면 같은 시각으로 맞춰진다.`,
                en:(a,b,m)=>`The official channel is as of <b>${a}</b> and the other as of <b>${b}</b> — two days apart, so the ${m}× figure is that approximate. Once automatic collection covers both they will line up.`,
                ja:(a,b,m)=>`RESCENE公式は <b>${a}</b>、もう一方は <b>${b}</b> 基準で2日ずれています — ${m}倍という値もその分だけ概算です。自動更新が付けば同じ時刻に揃います。`},
"ft.made":     {ko:"만든 곳 · ", en:"Made by · ", ja:"制作 · "},
"ft.madelink": {ko:"유튜브 @data-viz", en:"YouTube @data-viz", ja:"YouTube @data-viz"},
"ft.disc":     {ko:" · 리센느와 소속사·제작사와 아무 관계가 없는 팬 제작 페이지다.",
                en:" · A fan-made page with no connection to RESCENE, their agency or the production company.",
                ja:" · RESCENE および所属事務所・制作会社とは一切関係のないファン制作ページです。"},

/* 오류 */
"err.h":       {ko:"데이터를 불러오지 못했다.", en:"Could not load the data.", ja:"データを読み込めませんでした。"},
"err.help":    {ko:"파일을 직접 열면 브라우저가 <code>data/*.json</code> 읽기를 막는다. 폴더에서 <code>python -m http.server 8000</code> 을 돌리고 <code>http://localhost:8000</code> 으로 열 것.",
                en:"Opening the file directly makes the browser block <code>data/*.json</code>. Run <code>python -m http.server 8000</code> in the folder and open <code>http://localhost:8000</code>.",
                ja:"ファイルを直接開くとブラウザが <code>data/*.json</code> の読み込みを止めます。フォルダで <code>python -m http.server 8000</code> を実行し、<code>http://localhost:8000</code> で開いてください。"},
};

/* ── 실행부 ───────────────────────────────────────────────────────────── */
let LANG = "ko";
const 로케일 = {ko:"ko-KR", en:"en-US", ja:"ja-JP"};

/* 없는 열쇠·없는 나라말은 한국어로 떨어진다 */
function t(k, ...a){
  const e = STR[k];
  if(!e) return k;
  let v = e[LANG];
  if(v === undefined || v === null) v = e.ko;
  return typeof v === "function" ? v(...a) : v;
}
/* JSON 안에 든 한국어 설명글. 한국어면 원문, 아니면 사전에 적어 둔 번역 */
function tj(k, 원문){
  const e = STR[k];
  if(LANG === "ko" || !e || e[LANG] == null) return 원문;
  return e[LANG];
}
/* 이름표 · 낱말.
   한국어에도 적어 둔 값이 있으면 그것을 쓴다 — 데이터가 줄임말(「안원잘부」)로 와도
   화면에는 정식 이름이 나가야 하기 때문이다. 적어 두지 않았으면 원문 그대로. */
function 옮김(사전, s){
  if(s == null) return s;
  const e = 사전[s];
  return e && e[LANG] ? e[LANG] : s;
}
const 이름 = s => 옮김(이름표, s);
const 낱 = s => 옮김(낱말, s);

/* 큰 수 — 나라말마다 자리 이름이 다르다 */
function 만(n){
  if(n == null || isNaN(n)) return "—";
  if(LANG === "en"){
    if(n >= 1e9) return +(n/1e9).toFixed(2) + "B";
    if(n >= 1e6) return +(n/1e6).toFixed(n >= 1e7 ? 1 : 2) + "M";
    if(n >= 1e3) return +(n/1e3).toFixed(n >= 1e5 ? 0 : 1) + "K";
    return n.toLocaleString("en-US");
  }
  const 억자 = LANG === "ja" ? "億" : "억";
  const 만자 = LANG === "ja" ? "万" : "만";
  if(n >= 1e8){
    const 억 = Math.floor(n/1e8), 남 = Math.round((n % 1e8)/1e4);
    return 남 ? `${억}${억자} ${남.toLocaleString(로케일[LANG])}${만자}` : `${억}${억자}`;
  }
  if(n >= 1e4){
    const v = n/1e4;
    return (v >= 100 ? Math.round(v).toLocaleString(로케일[LANG]) : String(+v.toFixed(1))) + 만자;
  }
  return n.toLocaleString(로케일[LANG]);
}
const 콤마 = n => (n == null ? "—" : n.toLocaleString(로케일[LANG]));

/* 나라말 정하기 — 저장한 값 > ?lang= > 브라우저 */
/* 사람이 적는 코드는 제각각이다 — jp·kr 처럼 나라 코드로 쓰는 쪽이 오히려 흔하다.
   주소로 들어오는 것은 다 받아 준다. 안쪽에서 쓰는 값은 표준 코드(ko·en·ja)로 고정한다 —
   <html lang> 이 그 값을 그대로 받으므로 스크린리더·검색엔진이 읽는 것도 이 값이다. */
function 코드정리(c){
  if(!c) return null;
  c = String(c).toLowerCase().replace("_", "-").split("-")[0];
  if(c === "jp" || c === "ja") return "ja";
  if(c === "kr" || c === "ko") return "ko";
  if(c === "en") return "en";
  return null;
}
function 첫나라말(){
  const q = 코드정리(new URLSearchParams(location.search).get("lang"));
  const s = 코드정리((()=>{ try{ return localStorage.getItem("lang"); }catch(e){ return null; } })());
  const b = 코드정리(navigator.language) ;
  return q || s || b || "en";
}

/* ── JSON 안에 든 설명글 — 한국어는 원문, 다른 말은 여기 적어 둔 번역 ─────── */
STR["s10.judge"] = {ko:null,
  en:"Faces were detected with YuNet, aligned on five points, embedded with SFace, and matched to cluster centres whose names were fixed using birthday streams. 48 thumbnails where the similarity was low or the top two were too close were left unassigned.",
  ja:"顔は YuNet で検出し、5点でアライメントして SFace で埋め込み、誕生日ライブで名前を確定したクラスタ中心に最も近いものへ割り当てました。類似度が低い、または1位と2位の差が小さい48件は割り当てていません。"};
STR["s10.limit"] = {ko:null,
  en:"A member missing from a thumbnail does not mean they were absent from that stream. Profiles and backlight remain weak. Measured against the 48 streams whose titles name exactly one member, 95.8% matched.",
  ja:"サムネイルに写っていないことは、その配信にいなかったことを意味しません。横顔や逆光には依然として弱いです。タイトルが1人だけを指す48本で測ったところ、95.8%が一致しました。"};
STR["s11.how"] = {ko:null,
  en:"found by downloading each episode at 360p, scanning it as a contact sheet and comparing candidate frames against the emoticon art; the timestamp is where that frame sits.",
  ja:"各回を360pで取得し、コンタクトシートで見渡したうえで候補区間のフレームを絵文字の絵と照合して特定しました。時刻はそのフレームの位置です。"};
/* 제외한 수는 달마다 바뀐다. 문장을 박아 두면 숫자가 조용히 틀린다 — 값에서 만든다. */
STR["s7.excl"] = {
  ko:(전, 신, 논, 남, 좌)=>`구글 급상승 ${전}개 중 개인 신체에 관한 ${신}건과 논란성 ${논}건을 뺀 ${남}개다. 왼쪽 목록에서도 논란성 ${좌}건을 뺐다.`,
  en:(전, 신, 논, 남, 좌)=>`Of ${전} rising Google searches we removed ${신} about a person's body and ${논} tied to a harassment controversy, leaving ${남}. ${좌} was removed from the left-hand list for the same reason.`,
  ja:(전, 신, 논, 남, 좌)=>`Googleの急上昇 ${전}件のうち、身体に関する ${신}件と、二次加害の論争に関わる ${논}件を除いた ${남}件です。左のリストからも同じ理由で ${좌}件を除いています。`};

/* ── 도우미 — 지역 변수에 가려지는 곳에서 쓰는 이름들 ───────────────────── */
const 이름표옮김 = s => 옮김(이름표, s);
function 출처이름옮김(키, 원문){
  const e = 출처이름[키];
  return (LANG !== "ko" && e && e[LANG]) ? e[LANG] : 원문;
}

/* ── 화면에 나라말 입히기 ─────────────────────────────────────────────── */
function 나라말칠하기(){
  document.documentElement.lang = LANG;
  document.title = t("doc.title");
  const md = document.querySelector('meta[name="description"]');
  if(md) md.setAttribute("content", t("doc.desc"));
  document.querySelectorAll("[data-i18n]").forEach(n=>{ n.textContent = t(n.dataset.i18n); });
  document.querySelectorAll("[data-i18n-html]").forEach(n=>{ n.innerHTML = t(n.dataset.i18nHtml); });
  document.querySelectorAll("[data-i18n-aria]").forEach(n=>{ n.setAttribute("aria-label", t(n.dataset.i18nAria)); });
  // 줄 세우기 단추처럼 값은 한국어(식별자)이고 글자만 바뀌는 것들
  document.querySelectorAll("button[data-word]").forEach(b=>{ b.textContent = 낱(b.dataset.v); });
  // 원문 그대로 두는 목록의 단서는 한국어 화면에서는 필요 없다
  document.querySelectorAll(".raw").forEach(p=>{ p.hidden = (LANG === "ko"); });
  document.querySelectorAll("#langs button").forEach(b=>{
    b.classList.toggle("on", b.dataset.lang === LANG);
    b.setAttribute("aria-pressed", String(b.dataset.lang === LANG));
  });
}

function 나라말바꾸기(코드, 다시그리기){
  코드 = 코드정리(코드);
  if(!코드 || 코드 === LANG) return;
  LANG = 코드;
  try{ localStorage.setItem("lang", 코드); }catch(e){}
  나라말칠하기();
  if(다시그리기) 다시그리기();
}

/* ── 새어 나가기 쉬운 라벨 셋 ─────────────────────────────────────────── */
STR["s11.sale"] = {ko:null, en:p=>`${p}% off everything`, ja:p=>`全商品${p}%オフ`};

/* 「180분+」처럼 한국어 단위가 박힌 구간 이름 — 다른 말에서는 단위를 뗀다 */
const 분구간 = k => (LANG === "ko" ? k : String(k).replace("분", ""));
/* 「2024-03-26 ~ 2026-04-26 (데뷔 후 2년)」 — 괄호 안은 제목이 이미 말하고 있다 */
const 기간표 = s => (LANG === "ko" || s == null ? s : String(s).replace(/\s*\(.*\)\s*$/, ""));

/* ── 출처 칸 · 기관 이름 — 한국어가 그대로 새어 나가던 자리 ─────────────── */
const 출처값 = {
  videos:     {en:"YouTube channel tab + Data API v3", ja:"YouTubeチャンネルタブ + Data API v3"},
  streams:    {en:"@RESCENE_official/streams · counts & views daily, face matching by hand",
               ja:"@RESCENE_official/streams・本数と再生数は毎日、顔の判別は手動"},
  trends:     {en:"trends/api, called directly", ja:"trends/api を直接呼び出し"},
  reputation: {en:"Korea Institute of Corporate Reputation · brikorea",
               ja:"韓国企業評判研究所・brikorea"},
  searches:   {en:"Google Trends", ja:"Googleトレンド"},
  archive:    {en:"YouTube @data-viz channel", ja:"YouTube @data-viz チャンネル"},
  emoticon:   {en:"e.kakao.com popularity ranking API", ja:"e.kakao.com 人気順位API"},
};
function 출처값옮김(키, 원문){
  const e = 출처값[키];
  return (LANG !== "ko" && e && e[LANG]) ? e[LANG] : 원문;
}
STR["s3.src"]  = {ko:null, en:"playboard.co channel report", ja:"playboard.co のチャンネルレポート"};
STR["s11.src"] = {ko:null, en:"KakaoTalk emoticon shop popularity ranking (e.kakao.com/popular)",
                  ja:"カカオ絵文字ショップの人気順位（e.kakao.com/popular）"};
STR["s5.org"]  = {ko:null, en:"the Korea Institute of Corporate Reputation", ja:"韓国企業評判研究所"};
STR["s5.base"] = {ko:null, en:m=>m.replace("년 ","-").replace("월",""), ja:m=>m};
