// 화면 점검 — 탭 5개 × 나라말 3개, 콘솔 오류와 폭 넘침을 같이 본다.
//   python -m http.server 8765  를 띄워 두고
//   node scripts/화면점검.js
const puppeteer = require("puppeteer-core");
const fs = require("fs");
const path = require("path");

const 주소 = process.env.PV_URL || "http://127.0.0.1:8765/index.html";
const 저장 = process.env.PV_OUT || path.join(require("os").tmpdir(), "개편캡처");
const 크롬 = ["C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"].find(p => fs.existsSync(p));

(async () => {
  fs.mkdirSync(저장, { recursive: true });
  const b = await puppeteer.launch({ executablePath: 크롬, headless: "new" });
  const p = await b.newPage();
  const 오류 = [];
  p.on("pageerror", e => 오류.push("pageerror: " + e.message));
  p.on("console", m => { if (m.type() === "error") 오류.push("console: " + m.text()); });
  p.on("requestfailed", r => {
    const u = r.url();
    if (!u.startsWith("data:") && !u.includes("goatcounter")) 오류.push("요청실패: " + u);
  });

  const 탭 = ["home", "youtube", "music", "ad", "buzz"];
  const 말 = ["ko", "en", "ja"];
  const 결과 = [];

  for (const 나라 of 말) {
    for (const 키 of 탭) {
      await p.setViewport({ width: 1100, height: 900 });
      await p.goto(주소 + "#" + 키, { waitUntil: "networkidle0" });
      await p.evaluate(l => { if (l !== "ko") 나라말바꾸기(l, 모두그리기); }, 나라);
      await new Promise(r => setTimeout(r, 400));
      const 잼 = await p.evaluate(() => {
        const 넘침 = document.documentElement.scrollWidth > window.innerWidth + 1;
        const 보이는탭 = [...document.querySelectorAll(".tabpane")].filter(x => !x.hidden).map(x => x.dataset.tab);
        const 구역 = [...document.querySelectorAll(".tabpane:not([hidden]) section")].filter(s => !s.hidden).map(s => s.id);
        const 광고수 = document.querySelectorAll("#nad-ads .ad").length;
        const 빈제목 = [...document.querySelectorAll(".tabpane:not([hidden]) h2")].filter(h => !h.textContent.trim()).length;
        return { 넘침, 보이는탭, 구역, 광고수, 빈제목, 해시: location.hash, 제목: document.title };
      });
      결과.push(Object.assign({ 나라, 탭: 키 }, 잼));
      if (나라 === "ko") await p.screenshot({ path: path.join(저장, "pv_" + 키 + ".png"), fullPage: true });
      if (키 === "ad" || 키 === "home") await p.screenshot({ path: path.join(저장, "pv_" + 나라 + "_" + 키 + ".png"), fullPage: true });
    }
  }

  // 폰 폭에서도 한 번
  await p.setViewport({ width: 400, height: 900 });
  await p.goto(주소 + "#ad", { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 300));
  const 폰넘침 = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  await p.screenshot({ path: path.join(저장, "pv_phone_ad.png"), fullPage: true });

  // 옛 링크 — 개편 전 주소로 들어와도 같은 자리로 열려야 한다
  const 옛링크 = [];
  await p.setViewport({ width: 1100, height: 900 });
  for (const h of ["#rescene", "#anwonjalbu", "#없는탭"]) {
    await p.goto(주소 + h, { waitUntil: "networkidle0" });
    await new Promise(r => setTimeout(r, 300));
    옛링크.push(await p.evaluate(들어온것 => ({
      들어온것: 들어온것,
      탭: [...document.querySelectorAll(".tabpane")].filter(t => !t.hidden).map(t => t.dataset.tab)[0],
      해시: location.hash,
      라이브보임: !document.querySelector("#s10").hidden
    }), h));
  }

  // 광고 카드 — 같은 줄의 브랜드 이름이 같은 높이에 있나 (영상 수가 달라도 맞아야 한다)
  await p.setViewport({ width: 1100, height: 900 });
  await p.goto(주소 + "#ad", { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 500));
  const 이름줄 = await p.evaluate(() => {
    const 칸 = [...document.querySelectorAll("#nad-ads .nmrow b")].map(b => {
      const r = b.getBoundingClientRect();
      return { x: Math.round(r.left), y: Math.round(r.top + window.scrollY), 글: b.textContent };
    });
    const 열 = {};
    칸.forEach(c => { (열[c.x] = 열[c.x] || []).push(c); });
    const 열들 = Object.values(열);
    const 줄수 = 열들.length ? Math.max(...열들.map(v => v.length)) : 0;
    const 결과 = [];
    for (let i = 0; i < 줄수; i++) {
      const 줄칸 = 열들.map(v => v[i]).filter(Boolean);
      if (줄칸.length < 2) continue;
      const ys = 줄칸.map(c => c.y);
      결과.push({ 줄: i + 1, 편차: Math.max(...ys) - Math.min(...ys), 브랜드: 줄칸.map(c => c.글) });
    }
    return 결과;
  });

  console.log(JSON.stringify({ 저장, 폰넘침, 옛링크, 이름줄, 오류: [...new Set(오류)], 결과 }, null, 1));
  await b.close();
})();
