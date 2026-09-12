/* ═══════════════════════════════════════════════════════════════════════
   개편 미리보기 — 다섯 탭(홈 · 유튜브 · 음원 · 광고 · 화제)과 광고 구역.
   scripts/개편미리보기.py 가 index.html 에 얹어 preview.html 을 만든다.

   위 스크립트의 것을 그대로 쓴다 — $ · el · 날 · D · 상태 · 전환 · t · 이름 · 낱 · 만 · 콤마.
   여기서 다시 정의하면 이름이 겹쳐 페이지가 죽는다.
   ═══════════════════════════════════════════════════════════════════════ */
const 탭목록 = ["home", "youtube", "music", "ad", "buzz"];
const 광고멤버들 = ["원이", "리브", "미나미", "메이", "제나"];
let 지금탭 = "home", 광고 = null, 광고멤버 = "전체";

/* ── 주소 ── 탭과 채널을 한 해시에 담는다. 옛 #rescene · #anwonjalbu 도 그대로 받는다 */
function 탭해시(){
  return 지금탭 === "youtube" ? "#youtube/" + (상태.채널 === "리센느" ? "res" : "anw") : "#" + 지금탭;
}
function 해시쓰기(){ history.replaceState(null, "", 탭해시()); }
function 해시읽기(){
  const h = location.hash;
  if(h === "#rescene")    return {탭:"youtube", 채널:"리센느"};
  if(h === "#anwonjalbu") return {탭:"youtube", 채널:"안원잘부"};
  const 쪽 = h.replace(/^#/, "").split("/");
  return {탭: 탭목록.includes(쪽[0]) ? 쪽[0] : "home",
          채널: 쪽[1] === "res" ? "리센느" : (쪽[1] === "anw" ? "안원잘부" : null)};
}

/* 구역 번호는 지금 열린 탭 안에서만 센다 — 탭마다 화면 수가 다르다 */
function 번호매기기(){
  let 번 = 0;
  document.querySelectorAll(".tabpane:not([hidden]) section").forEach(n=>{
    if(n.hidden || n.id === "s0") return;
    const b = n.querySelector(".eyebrow b");
    if(b) b.textContent = String(++번).padStart(2, "0");
  });
}

function 탭보이기(키){
  지금탭 = 탭목록.includes(키) ? 키 : "home";
  document.querySelectorAll(".tabpane").forEach(p=>{ p.hidden = p.dataset.tab !== 지금탭; });
  document.querySelectorAll(".tab").forEach(b=>{
    const 켬 = b.dataset.tab === 지금탭;
    b.setAttribute("aria-selected", String(켬));
    b.tabIndex = 켬 ? 0 : -1;
  });
  번호매기기();
  해시쓰기();
}

function 탭으로(키){
  탭보이기(키);
  const 줄 = $("#tabs");
  if(줄) window.scrollTo({top: Math.max(0, 줄.offsetTop - 4)});
}

/* ── 광고 ───────────────────────────────────────────────────────────── */
const 썸 = id => "https://i.ytimg.com/vi/" + id + "/mqdefault.jpg";
const 유튜브주소 = (id, 쇼츠) =>
  "https://www.youtube.com/" + (쇼츠 ? "shorts/" + id : "watch?v=" + id);
const 전원인가 = a => a.모델.some(m => /전원/.test(m)) || 광고멤버들.every(m => a.모델.includes(m));
const 멤버미확인 = a => a.모델.some(m => /확인/.test(m));

function 바깥고리(부모, 주소, 반){
  const a = el("a", 반 || null);
  a.href = 주소; a.target = "_blank"; a.rel = "noopener";
  부모.append(a);
  return a;
}

function 광고카드(a){
  const 카 = el("article", "ad");
  const 주 = a.영상[0];
  if(주){
    const 링 = 바깥고리(카, 유튜브주소(주.id, 주.쇼츠), "adthumb");
    링.setAttribute("aria-label", t("ad.thumb.aria", 이름(a.브랜드), 1));
    const im = el("img"); im.src = 썸(주.id); im.alt = ""; im.loading = "lazy";
    링.append(im, el("span", "pl", a.영상.length > 1 ? t("ad.vids", a.영상.length) : t("ad.vid1")));
    if(a.영상.length > 1){
      const 더 = el("div", "more");
      a.영상.slice(1, 5).forEach((v, i)=>{
        const l = 바깥고리(더, 유튜브주소(v.id, v.쇼츠));
        l.setAttribute("aria-label", t("ad.thumb.aria", 이름(a.브랜드), i + 2));
        const g = el("img"); g.src = 썸(v.id); g.alt = ""; g.loading = "lazy";
        l.append(g);
      });
      카.append(더);
    }
  }else{
    카.append(el("div", "adthumb noimg", 이름(a.브랜드)));
  }

  const 몸 = el("div", "bd");
  const 줄 = el("div", "nmrow");
  줄.append(el("b", null, 이름(a.브랜드)));
  줄.append(el("span", null, [낱(a.분야), a.시작 ? t("ad.since", a.시작.replace("-", ".")) : null]
                            .filter(Boolean).join(" · ")));
  몸.append(줄);

  const 멤 = el("div", "mem");
  // 기사에 그룹 이름만 있는 곳은 멤버를 추측하지 않는다 — 멤버 딱지처럼 보이면 안 된다
  if(멤버미확인(a))      멤.append(el("i", "unk", t("ad.mem.unk")));
  else if(전원인가(a))   멤.append(el("i", "all", t("ad.mem.all")));
  else a.모델.forEach(m => 멤.append(el("i", null, 이름(m))));
  몸.append(멤);

  const 고리 = el("div", "lk");
  if(a.채널 && a.채널.url){
    바깥고리(고리, a.채널.url, "yt").append(t("ad.ch"));
  }else{
    고리.append(el("span", "off", t("ad.ch.none")));
  }
  // 단추 글자는 종류(기획전·상품·캠페인…)로 — 상품 이름은 한국어 원문이라 툴팁에 둔다
  (a.링크 || []).slice(0, 2).forEach(p=>{
    const l = 바깥고리(고리, p.url, "shop");
    l.append(낱(p.종류)); l.title = p.이름;
  });
  몸.append(고리);
  카.append(몸);
  return 카;
}

function 그리기_ads(){
  const 통 = $("#nad-ads");
  if(!통) return;
  if(!광고){ 통.innerHTML = ""; return; }
  const 전부 = 광고.브랜드;
  const 보임 = 전부.filter(a => 광고멤버 === "전체" || 전원인가(a) || a.모델.includes(광고멤버));
  const 영상수 = 전부.reduce((n, a) => n + a.영상.length, 0);

  $("#nad-h").textContent = 광고멤버 === "전체"
    ? t("ad.h", 전부.length) : t("ad.h.mem", 이름(광고멤버), 보임.length);
  $("#nad-sub").textContent = t("ad.sub", 영상수);
  $("#nad-foot").textContent = t("ad.foot", 날(광고.기준));

  const 고르기 = $("#nad-seg"); 고르기.innerHTML = "";
  [["전체", t("ad.all")]].concat(광고멤버들.map(m => [m, 이름(m)])).forEach(짝=>{
    const b = el("button", null, 짝[1]);
    b.type = "button"; b.dataset.m = 짝[0];
    b.setAttribute("aria-pressed", String(짝[0] === 광고멤버));
    고르기.append(b);
  });

  통.innerHTML = "";
  보임.forEach(a => 통.append(광고카드(a)));
}

/* ── 홈 ─────────────────────────────────────────────────────────────── */
function 요약칸(탭, 이름글, 값, 설명){
  const b = el("button", "dg");
  b.type = "button"; b.dataset.go = 탭;
  b.append(el("span", "t", 이름글), el("span", "v", 값), el("span", "d", 설명),
           el("span", "w", t("home.dg.go", 이름글)));
  return b;
}

function 그리기_digest(){
  const d = D, 통 = $("#nh-digest");
  if(!d || !통) return;
  const 주 = d.rank.주간, 끝 = 주[주.length - 1], 첫 = 주[0];
  const mv = d.live.MV, 지 = d.region.구간[d.region.구간.length - 1];
  통.innerHTML = "";
  통.append(
    요약칸("youtube", t("tab.youtube"), t("home.dg.v.rank", 콤마(끝.한국)),
          t("home.dg.youtube", 주.length, 콤마(첫.한국))),
    요약칸("music", t("tab.music"), 만(mv.합계), t("home.dg.music", mv.목록.length)),
    요약칸("ad", t("tab.ad"),
          광고 ? t("home.dg.v.brands", 광고.브랜드.length) : "—",
          광고 ? t("home.dg.ad", 광고.브랜드.reduce((n, a) => n + a.영상.length, 0)) : ""),
    요약칸("buzz", t("tab.buzz"), 이름표옮김(지.지역[0].지역), t("home.dg.buzz", 기간표(지.이름))));
}

function 그리기_feed(){
  const d = D, 통 = $("#nh-feed");
  if(!d || !통) return;
  const 줄 = [];
  if(광고) 광고.브랜드.forEach(a=>{
    const 날짜 = a.영상.length ? a.영상[0].공개일 : null;
    if(!날짜) return;
    줄.push({날짜: 날짜, 탭: "ad",
            글: t("home.feed.ad", 이름(a.브랜드), a.영상.filter(v => v.공개일 === 날짜).length)});
  });
  const 돌 = (d.milestone && d.milestone.돌파) || {};
  Object.keys(돌).forEach(채널=>{
    Object.keys(돌[채널]).forEach(눈금=>{
      줄.push({날짜: 돌[채널][눈금], 탭: "youtube", 글: t("home.feed.ms", 이름(채널), 만(+눈금))});
    });
  });
  줄.sort((a, b) => a.날짜 < b.날짜 ? 1 : -1);
  통.innerHTML = "";
  줄.slice(0, 6).forEach(x=>{
    const li = el("li");
    li.append(el("span", "dt", 날(x.날짜)), el("span", "tx", x.글));
    const 탭이름 = t(x.탭 === "ad" ? "tab.ad" : "tab.youtube");
    const g = el("button", "go", t("home.dg.go", 탭이름));
    g.type = "button"; g.dataset.go = x.탭;
    li.append(g);
    통.append(li);
  });
}

/* 아카이브는 카드가 여든 장이 넘는다 — 홈 첫 화면이 길어지지 않게 열두 장만 펴 둔다 */
const 아카이브펼침 = 12;
function 접기_아카이브(){
  const 통 = $("#s8-cards");
  if(!통) return;
  const 전부 = 통.children.length;
  let 단추 = $("#s8-more");
  if(전부 <= 아카이브펼침){ if(단추) 단추.hidden = true; return; }
  통.classList.add("fold");
  if(!단추){
    단추 = el("button", "morecards");
    단추.type = "button"; 단추.id = "s8-more";
    단추.addEventListener("click", ()=>{ 통.classList.remove("fold"); 단추.hidden = true; });
    통.after(단추);
  }
  단추.hidden = false;
  단추.textContent = t("s8.more", 전부 - 아카이브펼침);
}

function 그리기_개편(){
  그리기_ads();
  그리기_digest();
  그리기_feed();
  접기_아카이브();
  번호매기기();
}

/* ── 붙이기 ─────────────────────────────────────────────────────────── */
(function 개편시작(){
  const 처음 = 해시읽기();
  지금탭 = 처음.탭;

  document.addEventListener("click", e=>{
    const 탭 = e.target.closest(".tab");
    if(탭){ 탭으로(탭.dataset.tab); return; }
    const 감 = e.target.closest("[data-go]");
    if(감){ 탭으로(감.dataset.go); return; }
    const 멤 = e.target.closest("#nad-seg button");
    if(멤){ 광고멤버 = 멤.dataset.m; 그리기_ads(); }
  });

  // 탭 줄에서 좌우 화살표로 옮긴다
  document.addEventListener("keydown", e=>{
    if(!e.target.closest || !e.target.closest("#tabs")) return;
    const 방향 = e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0;
    if(!방향) return;
    e.preventDefault();
    const 다음 = 탭목록[(탭목록.indexOf(지금탭) + 방향 + 탭목록.length) % 탭목록.length];
    탭보이기(다음);
    const b = document.querySelector(".tab[data-tab=" + JSON.stringify(다음) + "]");
    if(b) b.focus();
  });

  addEventListener("hashchange", ()=>{
    const 새 = 해시읽기();
    if(새.채널 && 새.채널 !== 상태.채널 && typeof 전환 === "function") 전환(새.채널);
    if(새.탭 !== 지금탭) 탭보이기(새.탭);
  });

  탭보이기(처음.탭);

  /* 광고는 따로 받는다 — 이 파일이 없거나 늦어도 나머지 화면은 그대로 뜬다 */
  fetch("data/ads.json", {cache:"no-cache"})
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(j => { 광고 = j; 그리기_ads(); 그리기_digest(); 그리기_feed(); 번호매기기(); })
    .catch(()=>{ 광고 = null; 그리기_ads(); });
})();

/* 나라말을 바꾸면 값이 든 문장은 전부 다시 만든다 — 새 화면도 그 줄에 끼운다 */
모두그리기 = (function(옛){
  return function(){ 옛(); 그리기_개편(); };
})(모두그리기);
