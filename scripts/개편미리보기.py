# -*- coding: utf-8 -*-
"""index.html → preview.html — 다섯 탭(홈·유튜브·음원·광고·화제)으로 다시 묶은 미리보기.

**index.html 을 손으로 고치지 않는다.** 이 스크립트가 얹는다 —
그래야 지금 쓰는 페이지가 계속 살아 있고, 데이터·차트·사전을 하나도 안 잃는다.
미리보기가 좋다고 판정되면 그때 이 결과를 index.html 로 옮긴다.

  python -X utf8 scripts/개편미리보기.py

하는 일
  1. 구역(section)을 탭 다섯 개로 다시 묶는다. 구역 안은 건드리지 않는다.
  2. 채널 고르기(.chtabs)를 유튜브 탭 안으로 옮긴다.
  3. 광고 구역(data/ads.json)을 새로 넣는다.
  4. 홈에 요약·최근·쇼츠 줄을 넣는다.
  5. 해시를 탭까지 담게 고친다. 옛 #rescene · #anwonjalbu 링크도 그대로 받는다.
"""
import io, os, re, sys

여기 = os.path.dirname(os.path.abspath(__file__))
뿌리 = os.path.dirname(여기)
들어오는것 = os.path.join(뿌리, "index.html")
나가는것 = os.path.join(뿌리, "preview.html")

원본 = io.open(들어오는것, encoding="utf-8").read()

# ── 새로 쓰는 클래스 이름이 기존 CSS 와 겹치면 조용히 화면이 깨진다 ──────────
새클래스 = ["tabs", "tabpane", "tab", "digest", "dg", "feed", "strip", "ads", "ad",
        "adthumb", "nmrow", "mem", "lk", "pvband", "morecards"]
겹침 = [c for c in 새클래스 if re.search(r"^\." + c + r"[\s,{:]", 원본, re.M)]
assert not 겹침, "기존 CSS 와 겹치는 클래스: %s" % 겹침
# .pane 은 라이브 화면의 두 칸 배치가 이미 쓰고 있다 — 탭 패널은 .tabpane 이다
assert re.search(r"^\.pane[\s,{]", 원본, re.M), "기존 .pane 이 사라졌다 — 이름 규칙을 다시 볼 것"

# ── 1. 구역을 꺼낸다 ────────────────────────────────────────────────────
머리, 본문, 꼬리 = re.split(r"(?=<main id=\"main\" hidden>)|(?<=</main>)", 원본, maxsplit=2)

구역 = {}
def 담기(m):
    구역[m.group(1)] = m.group(0)
    return ""
본문없는것 = re.sub(r"<section id=\"([\w-]+)\"[^>]*>.*?</section>\s*", 담기, 본문, flags=re.S)
채널탭 = re.search(r"<nav class=\"chtabs\".*?</nav>\s*", 본문없는것, re.S)
assert 채널탭, "채널 고르기(.chtabs)를 못 찾았다"
본문없는것 = 본문없는것.replace(채널탭.group(0), "")
본문없는것 = re.sub(r"<div class=\"split\".*?</div>\s*", "", 본문없는것, flags=re.S)   # 「두 채널 공통」 칸막이는 탭이 대신한다

빠진것 = [k for k in ("s0","s1","s2","s3","s4","sm","sv","s5","s6","s7","s8","s9","s10","s11","sr") if k not in 구역]
assert not 빠진것, "구역을 못 찾았다: %s" % 빠진것

# ── 2. 채널에 매인 구역 풀기 ────────────────────────────────────────────
# s4(MV)·sm(멜론)은 음원 탭으로, s11(이모티콘)은 화제 탭으로 간다 — 더는 채널을 안 탄다.
for k in ("s4", "sm", "s11"):
    구역[k] = re.sub(r'\s*data-ch="[^"]*"', "", 구역[k], count=1)

새구역 = io.open(os.path.join(여기, "개편_구역.html"), encoding="utf-8").read()
새CSS  = io.open(os.path.join(여기, "개편_스타일.css"), encoding="utf-8").read()
새JS   = io.open(os.path.join(여기, "개편_탭.js"), encoding="utf-8").read()
조각 = dict(re.findall(r"<!--\s*@(\w+)\s*-->(.*?)<!--\s*/@\1\s*-->", 새구역, re.S))
assert set(조각) >= {"홈요약", "광고", "탭줄", "미리보기띠"}, 조각.keys()

탭배치 = [
    ("home",    [구역["s0"], 구역["s1"], 조각["홈요약"], 구역["s8"]]),
    ("youtube", [채널탭.group(0), 구역["s3"], 구역["s10"], 구역["sv"], 구역["s6"]]),
    ("music",   [구역["s4"], 구역["sm"]]),
    ("ad",      [조각["광고"], 구역["s5"]]),
    ("buzz",    [구역["s2"], 구역["sr"], 구역["s7"], 구역["s11"]]),
]
판 = "".join('<div class="tabpane" data-tab="%s" role="tabpanel"%s>\n%s\n</div>\n'
             % (키, "" if 키 == "home" else " hidden", "\n".join(것)) for 키, 것 in 탭배치)
꼬리구역 = 구역["s9"]      # 출처표만 모든 탭 아래 공통 — 아카이브(82장)까지 깔면 탭마다 2만 픽셀이 길어진다

새본문 = 본문없는것.replace("<main id=\"main\" hidden>",
                      "<main id=\"main\" hidden>\n" + 조각["탭줄"] + 판 + 꼬리구역)
assert "tabpane" in 새본문

# ── 3. 스크립트 손보기 ──────────────────────────────────────────────────
def 바꾸기(s, 옛, 새, 몇=1):
    assert s.count(옛) == 몇, "못 찾았거나 여러 번 나온다: %r (%d)" % (옛[:60], s.count(옛))
    return s.replace(옛, 새)

바꿀것 = 꼬리
# (가) 옛 해시 처리기 — 이제 탭 라우터가 맡는다
바꿀것 = 바꾸기(바꿀것, """  addEventListener("hashchange", ()=>{
    const 키 = location.hash === "#rescene" ? "리센느" : "안원잘부";
    if(키 !== 상태.채널) 전환(키);
  });""",
    "  /* 해시는 탭 라우터가 맡는다 (개편_탭.js) — 여기서 또 다루면 탭을 옮길 때 채널이 튄다 */")
# (나) 채널을 바꿀 때 주소도 탭까지 담아 쓴다
바꿀것 = 바꾸기(바꿀것,
    '  history.replaceState(null, "", 키 === "리센느" ? "#rescene" : "#anwonjalbu");',
    '  if(typeof 해시쓰기 === "function") 해시쓰기();\n'
    '  else history.replaceState(null, "", 키 === "리센느" ? "#rescene" : "#anwonjalbu");')
# (다) 번호는 열린 탭 안에서만 센다
바꿀것 = 바꾸기(바꿀것, '  document.querySelectorAll("main section").forEach(n=>{',
    '  document.querySelectorAll(".tabpane:not([hidden]) section").forEach(n=>{')
# (라) 첫 채널은 새 해시에서도 읽는다
바꿀것 = 바꾸기(바꿀것, '    상태.채널 = location.hash === "#rescene" ? "리센느" : "안원잘부";',
    '    상태.채널 = (location.hash === "#rescene" || location.hash.endsWith("/res")) ? "리센느" : "안원잘부";')
# (마) 데이터가 다 그려진 뒤 새 화면도 그린다
바꿀것 = 바꾸기(바꿀것, '    전환(상태.채널);          // 채널에 딸린 세 화면은 여기서 한꺼번에 그린다',
    '    전환(상태.채널);          // 채널에 딸린 세 화면은 여기서 한꺼번에 그린다\n'
    '    if(typeof 그리기_개편 === "function") 그리기_개편();')

# ── 4. 붙이기 ──────────────────────────────────────────────────────────
새머리 = 바꾸기(머리, "</style>\n</head>", "</style>\n<style>\n" + 새CSS + "\n</style>\n</head>")
새머리 = 바꾸기(새머리, '<meta name="viewport"',
    '<meta name="robots" content="noindex">   <!-- 미리보기는 검색에 올리지 않는다 -->\n<meta name="viewport"')
새머리 = 바꾸기(새머리, "<body>\n", "<body>\n" + 조각["미리보기띠"] + "\n")

바꿀것 = 바꾸기(바꿀것, "</script>\n<script>\n/* melon-chart.html",
    "</script>\n<script>\n" + 새JS + "\n</script>\n<script>\n/* melon-chart.html")

결과 = 새머리 + 새본문 + 바꿀것
io.open(나가는것, "w", encoding="utf-8").write(결과)

print(나가는것)
print("구역 %d개 · 탭 %d개 · %d KB" % (len(구역), len(탭배치), len(결과) // 1024))
for 키, 것 in 탭배치:
    print("  %-8s %s" % (키, " ".join(re.search(r'id="([\w-]+)"', x).group(1) if re.search(r'id="([\w-]+)"', x) else "새것" for x in 것)))
