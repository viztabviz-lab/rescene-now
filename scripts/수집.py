# -*- coding: utf-8 -*-
"""
data/*.json 을 다시 채운다. GitHub Actions 가 이 스크립트만 돌린다.

  python -X utf8 scripts/수집.py daily     구독자 2채널 · MV 11편 조회수
  python -X utf8 scripts/수집.py weekly    구글 트렌드 126주 · playboard 순위
  python -X utf8 scripts/수집.py videos    채널 두 개의 전체 영상 조회수·좋아요
  python -X utf8 scripts/수집.py archive   @data-viz 에 새로 올린 쇼츠를 카드로
  python -X utf8 scripts/수집.py --확인    아무것도 쓰지 않고 조회만 해 본다

원칙 셋 — 셋 다 이 파일 안에서 강제된다.
  1. 성공했을 때만 JSON 을 쓴다. 실패는 status.json 에 남기고 화면에는 직전 값이 그대로 보인다.
     빈 배열을 커밋해 차트가 사라지는 사고를 막는 유일한 장치다.
  2. 구글 트렌드는 주간 시계열을 **통째로 교체**한다. 구글이 구간 최고값을 100으로 재정규화하므로
     새 최고점이 나오면 지난 126주 값이 전부 내려간다. 마지막 점만 이어 붙이면 틀린 그림이 된다.
  3. milestone.json 의 백만돌파는 한 번 쓰면 다시 건드리지 않는다.

수집 수단
  YOUTUBE_API_KEY 가 있으면 YouTube Data API v3 를, 없으면 yt-dlp 를 쓴다.
  Actions IP 는 yt-dlp 봇 차단이 잦으니 워크플로에서는 키를 넣는다.
  두 경로 모두 유효숫자 3자리로 반올림된 같은 값을 준다.
"""

import html
import io
import json
import os
import re
import sys
import threading
import time
import urllib.parse
import urllib.request
import http.cookiejar
from datetime import date, datetime, timedelta, timezone

# line_buffering — 오래 걸리는 videos 수집에서 진행률이 실시간으로 보여야 한다.
# 이걸 빼면 200편마다 찍는 줄이 버퍼에 갇혀 끝날 때 한꺼번에 나온다.
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace",
                              line_buffering=True)

KST = timezone(timedelta(hours=9))
DATA = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
오늘 = datetime.now(KST).strftime("%Y-%m-%d")
지금 = datetime.now(KST).strftime("%Y-%m-%d %H:%M")
확인만 = "--확인" in sys.argv

리센느ID = "UCtKtCiaWRz-d3EZn2xd1mdA"
안원잘부ID = "UCWpY0eSJtyO-qNAPbKFRSSg"
트렌드엔티티 = "/g/11y36j339b"   # 리센느 (Google 지식그래프 · 걸 그룹)
데뷔주 = "2024-03-26"
바닥주수 = 110                  # 데뷔 ~ 2026-04-26. 역주행 시작 전까지의 주 수(고정)

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/124.0 Safari/537.36")


def 읽기(이름):
    with open(os.path.join(DATA, 이름), encoding="utf-8") as f:
        return json.load(f)


def 쓰기(이름, 값):
    if 확인만:
        print(f"    (확인만) {이름} 안 씀")
        return
    with open(os.path.join(DATA, 이름), "w", encoding="utf-8") as f:
        json.dump(값, f, ensure_ascii=False, indent=1)


def 상태기록(키, 결과, 기준=None, 메시지="", 출처=None):
    """수집 결과를 status.json 에 남긴다. 실패도 반드시 남는다 — 조용히 넘어가지 않는다.
    출처는 수단이 바뀌는 항목(videos 는 키 유무로 API/파싱이 갈린다)만 같이 갱신한다."""
    if 확인만:
        return
    st = 읽기("status.json")
    for 항목 in st["항목"]:
        if 항목["키"] == 키:
            항목["결과"] = 결과
            항목["수집"] = 오늘
            if 기준:
                항목["기준"] = str(기준)
            if 출처:
                항목["출처"] = 출처
            항목["메시지"] = 메시지
            break
    st["갱신"] = 오늘
    쓰기("status.json", st)


# ────────────────────────────────────────────────────────── 유튜브
def _api(경로, 파라미터):
    키 = os.environ.get("YOUTUBE_API_KEY")
    파라미터 = dict(파라미터, key=키)
    u = f"https://www.googleapis.com/youtube/v3/{경로}?" + urllib.parse.urlencode(파라미터)
    req = urllib.request.Request(u, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=40) as r:
        return json.loads(r.read().decode("utf-8"))


def 채널구독자(채널ID들):
    """{채널ID: 구독자수}. 공개 구독자 수는 유효숫자 3자리 반올림이다."""
    if os.environ.get("YOUTUBE_API_KEY"):
        d = _api("channels", {"part": "statistics", "id": ",".join(채널ID들)})
        결과 = {i["id"]: int(i["statistics"]["subscriberCount"]) for i in d.get("items", [])}
    else:
        import yt_dlp
        옵션 = {"quiet": True, "no_warnings": True, "extract_flat": True,
                "playlist_items": "0", "skip_download": True}
        결과 = {}
        with yt_dlp.YoutubeDL(옵션) as y:
            for cid in 채널ID들:
                info = y.extract_info(f"https://www.youtube.com/channel/{cid}", download=False)
                결과[cid] = int(info.get("channel_follower_count") or 0)
    빠진것 = [c for c in 채널ID들 if not 결과.get(c)]
    if 빠진것:
        raise RuntimeError(f"구독자를 못 받은 채널: {빠진것}")
    return 결과


def 영상조회수(영상ID들):
    """{영상ID: 조회수}"""
    if os.environ.get("YOUTUBE_API_KEY"):
        결과 = {}
        for i in range(0, len(영상ID들), 50):
            덩이 = 영상ID들[i:i + 50]
            d = _api("videos", {"part": "statistics", "id": ",".join(덩이)})
            결과.update({v["id"]: int(v["statistics"]["viewCount"]) for v in d.get("items", [])})
    else:
        import yt_dlp
        옵션 = {"quiet": True, "no_warnings": True, "skip_download": True}
        결과 = {}
        with yt_dlp.YoutubeDL(옵션) as y:
            for vid in 영상ID들:
                info = y.extract_info(f"https://www.youtube.com/watch?v={vid}", download=False)
                결과[vid] = int(info.get("view_count") or 0)
    빠진것 = [v for v in 영상ID들 if not 결과.get(v)]
    if 빠진것:
        raise RuntimeError(f"조회수를 못 받은 영상: {빠진것}")
    return 결과


# ────────────────────────────────────────────────────────── 구글 트렌드
def 트렌드열기():
    cj = http.cookiejar.CookieJar()
    op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
    op.addheaders = [("User-Agent", UA), ("Accept-Language", "ko-KR,ko;q=0.9"),
                     ("Referer", "https://trends.google.co.kr/trends/explore?geo=KR"),
                     ("Accept", "application/json, text/plain, */*")]
    op.open("https://trends.google.co.kr/?geo=KR", timeout=40).read()   # 쿠키 워밍업
    return op


def 트렌드받기(op, url, 시도=6):
    마지막 = None
    for i in range(시도):
        try:
            with op.open(url, timeout=40) as r:
                b = r.read().decode("utf-8")
            if b.startswith(")]}'"):
                b = b[b.index("\n") + 1:]
            return json.loads(b)
        except Exception as e:
            마지막 = e
            time.sleep(2 + i * 3)     # Actions IP 는 429 를 자주 받는다
    raise 마지막


def 트렌드주간():
    op = 트렌드열기()
    구간 = f"{데뷔주} {오늘}"
    요청 = {"comparisonItem": [{"keyword": 트렌드엔티티, "geo": "KR", "time": 구간}],
            "category": 0, "property": ""}
    탐색 = 트렌드받기(op, "https://trends.google.co.kr/trends/api/explore?hl=ko&tz=-540&geo=KR&req="
                    + urllib.parse.quote(json.dumps(요청, ensure_ascii=False)))
    시계열 = next(w for w in 탐색["widgets"] if w["id"] == "TIMESERIES")
    d = 트렌드받기(op, "https://trends.google.co.kr/trends/api/widgetdata/multiline?hl=ko&tz=-540&req="
                 + urllib.parse.quote(json.dumps(시계열["request"], ensure_ascii=False))
                 + "&token=" + urllib.parse.quote(시계열["token"]))
    행 = d["default"]["timelineData"]
    주간 = [{"주시작": datetime.fromtimestamp(int(r["time"]), timezone.utc).strftime("%Y-%m-%d"),
            "값": int(r["value"][0])} for r in 행]
    if len(주간) < 126:
        raise RuntimeError(f"주간 구간이 {len(주간)}개뿐이다 (126 이상이어야 한다)")
    if max(w["값"] for w in 주간) != 100:
        raise RuntimeError("최고값이 100이 아니다 — 정규화가 깨졌다")
    return 주간


def 트렌드집계(주간, 이전집계):
    """바닥 구간은 역사적 사실이라 길이를 고정하고, 그 뒤만 다시 센다."""
    바닥 = 주간[:바닥주수]
    이후 = 주간[바닥주수:]
    최고 = max(주간, key=lambda w: w["값"])
    집계 = dict(이전집계)
    집계.update({
        "전체주수": len(주간),
        "바닥주수": len(바닥),
        "4이하인주": sum(1 for w in 바닥 if w["값"] <= 4),
        "바닥평균": round(sum(w["값"] for w in 바닥) / len(바닥), 2),
        "바닥구간": f"{바닥[0]['주시작']} ~ {바닥[-1]['주시작']}",
        "역주행주수": len(이후),
        "역주행구간": f"{이후[0]['주시작']} ~ {이후[-1]['주시작']}",
        "최고점": {"주시작": 최고["주시작"], "값": 최고["값"]},
    })
    return 집계


# ────────────────────────────────────────────────────────── playboard
def 플레이보드(채널ID):
    """채널 리포트 페이지의 SSR 페이로드에서 순위·구독 시계열을 뽑는다.
    공개 API 가 없어 페이지 구조에 기대므로 이 프로젝트에서 가장 잘 깨지는 수집이다."""
    u = f"https://playboard.co/en/channel/{채널ID}"
    req = urllib.request.Request(u, headers={
        "User-Agent": UA, "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
        "Accept": "text/html,application/xhtml+xml"})
    with urllib.request.urlopen(req, timeout=60) as r:
        h = r.read().decode("utf-8", errors="replace")

    def 계열(이름):
        """rows 배열을 괄호 짝을 세어 잘라낸다. rows:[] 로 비어 오는 날이 있어
        「]]」 를 찾는 방식은 못 쓴다 — 실제로 subscriberTrend 가 비어 온 적이 있다."""
        표시 = "Y." + 이름 + "={rows:"
        i = h.find(표시)
        if i < 0:
            raise RuntimeError(f"페이로드에 {이름} 이 없다 — 페이지 구조가 바뀌었을 수 있다")
        시작 = i + len(표시)
        깊이 = 0
        for j in range(시작, len(h)):
            if h[j] == "[":
                깊이 += 1
            elif h[j] == "]":
                깊이 -= 1
                if 깊이 == 0:
                    return json.loads(h[시작:j + 1])
        raise RuntimeError(f"{이름} 의 배열이 닫히지 않았다")

    lo, go, tr = 계열("loSubsRankings"), 계열("goSubsRankings"), 계열("subscriberTrend")
    if not lo:
        raise RuntimeError("한국 순위 시계열이 비어 있다")
    if len(lo) != len(go):
        raise RuntimeError("한국·전세계 순위 길이가 다르다")

    def 날(ts):
        return datetime.fromtimestamp(ts, timezone.utc).strftime("%Y-%m-%d")

    주간 = []
    for (t1, r1, s1), (t2, r2, s2) in zip(lo, go):
        주간.append({"날짜": 오늘 if t1 == -1 else 날(t1), "실시간": t1 == -1,
                    "한국": r1, "전세계": r2, "구독": s1})
    # 일별은 없는 날이 있다. 없으면 빈 목록을 주고 집계는 직전 값을 유지한다.
    일별 = [{"날짜": 날(t), "구독": s, "증가": g} for t, s, g, *_ in tr]
    return 주간, 일별


def 순위집계(주간, 일별, 이전):
    K = [w["한국"] for w in 주간]
    S = [w["구독"] for w in 주간]
    집계 = dict(이전)
    집계.update({
        "구간": f"{주간[0]['날짜']} ~ {주간[-1]['날짜']}",
        "측정수": len(주간),
        "첫한국순위": K[0], "끝한국순위": K[-1], "오른계단": K[0] - K[-1],
        "내려간주": sum(1 for i in range(1, len(K)) if K[i] > K[i - 1]),
    })
    if len(일별) >= 2:
        집계["일별평균증가"] = round((일별[-1]["구독"] - 일별[0]["구독"]) / (len(일별) - 1))
    for 이름, 조건 in (("백만돌파", lambda i: S[i] >= 1_000_000),
                     ("천위진입", lambda i: K[i] < 1000)):
        idx = next((i for i in range(len(주간)) if 조건(i)), None)
        if idx is not None:
            집계[이름] = {"날짜": 주간[idx]["날짜"], "순위": K[idx], "구독": S[idx], "인덱스": idx}
    return 집계


# ────────────────────────────────────────────────────────── daily
def 이력에더하기(목록, 항목, 최대=400):
    """같은 날짜가 이미 있으면 덮어쓴다. 하루에 여러 번 돌려도 늘어나지 않는다."""
    for i, x in enumerate(목록):
        if x["날짜"] == 항목["날짜"]:
            목록[i] = 항목
            break
    else:
        목록.append(항목)
    목록.sort(key=lambda x: x["날짜"])
    del 목록[:-최대]
    return 목록


def daily():
    live = 읽기("live.json")
    mv = live["MV"]["목록"]

    구독 = 채널구독자([리센느ID, 안원잘부ID])
    조회 = 영상조회수([m["id"] for m in mv])

    리센느, 안원잘부 = 구독[리센느ID], 구독[안원잘부ID]
    print(f"    리센느 {리센느:,} · 안원잘부 {안원잘부:,}")

    for 키, 값 in (("리센느", 리센느), ("안원잘부", 안원잘부)):
        c = live["채널"][키]
        c["구독자"] = 값
        c["기준"] = 오늘
        이력에더하기(c.setdefault("일별", []), {"날짜": 오늘, "구독": 값}, 최대=400)
    live["채널"]["리센느"]["이력"].append({"시각": 지금, "구독": 리센느})
    live["채널"]["안원잘부"]["이력"].append({"시각": 지금, "구독": 안원잘부})
    for 키 in ("리센느", "안원잘부"):
        live["채널"][키]["이력"] = live["채널"][키]["이력"][-200:]

    live["남은수"] = max(0, live["목표"] - 리센느)
    live["배수"] = round(안원잘부 / 리센느, 2)

    한해전 = (date.fromisoformat(오늘) - timedelta(days=365)).isoformat()
    for m in mv:
        m["조회수"] = 조회[m["id"]]
        m["최근1년"] = m["공개일"] >= 한해전
    mv.sort(key=lambda m: -m["조회수"])
    for i, m in enumerate(mv, 1):
        m["순위"] = i
    최근 = [m for m in mv if m["최근1년"]]
    live["MV"]["합계"] = sum(m["조회수"] for m in mv)
    live["MV"]["최근1년합계"] = sum(m["조회수"] for m in 최근)
    live["MV"]["최근1년편수"] = len(최근)
    live["MV"]["최근1년비중"] = round(live["MV"]["최근1년합계"] / live["MV"]["합계"] * 100, 1)
    live["MV"]["최근1년기준일"] = 한해전
    live["기준"] = 오늘
    print(f"    MV {live['MV']['합계']:,} · 최근 1년 {len(최근)}편 {live['MV']['최근1년비중']}%")

    쓰기("live.json", live)

    # club.json 의 리센느 구독자도 같이 맞춘다 — 한 페이지 안에서 값이 어긋나면 안 된다
    club = 읽기("club.json")
    club["리센느구독"] = 리센느
    club["안원잘부"]["구독자"] = 안원잘부
    club["안원잘부"]["끼는자리"] = next(
        (c["순위"] for c in club["전체"] if c["구독자"] < 안원잘부), club["총팀수"] + 1)
    club["리센느자리"] = next(
        (c["순위"] for c in club["전체"] if c["구독자"] < 리센느), club["총팀수"] + 1)
    쓰기("club.json", club)

    # 백만 돌파는 한 번만 기록한다
    ms = 읽기("milestone.json")
    if 리센느 >= 1_000_000 and not ms.get("백만돌파"):
        ms["백만돌파"] = 오늘
        쓰기("milestone.json", ms)
        print(f"    ★ 100만 돌파 기록: {오늘}")

    상태기록("live", "OK", 오늘, f"리센느 {리센느:,} · 안원잘부 {안원잘부:,}")
    상태기록("club", "OK", club["기준"], "리센느 자리만 갱신 (44팀 값은 수동)")
    return f"리센느 {리센느:,} · 안원잘부 {안원잘부:,} · MV {live['MV']['합계']:,}"


# ────────────────────────────────────────────────────────── weekly
def weekly_트렌드():
    t = 읽기("trends.json")
    주간 = 트렌드주간()
    t["집계"] = 트렌드집계(주간, t["집계"])
    t["주간"] = 주간                       # 부분 갱신이 아니라 통째로 교체
    t["기준"] = 오늘
    print(f"    트렌드 {len(주간)}주 · 현재 {주간[-1]['값']} · 최고 {t['집계']['최고점']['값']}")
    쓰기("trends.json", t)

    # 화면 01 타일은 live.json 의 값을 읽는다. 여기서 같이 맞추지 않으면
    # 타일(88)과 차트 끝점(83)이 같은 페이지에서 어긋난다.
    live = 읽기("live.json")
    live["트렌드"] = {"현재": 주간[-1]["값"],
                    "최고": t["집계"]["최고점"]["값"],
                    "주시작": 주간[-1]["주시작"]}
    쓰기("live.json", live)

    상태기록("trends", "OK", 주간[-1]["주시작"], f"{len(주간)}주 통째 교체")
    return f"트렌드 {len(주간)}주 (현재 {주간[-1]['값']})"


def weekly_순위():
    r = 읽기("rank.json")
    주간, 일별 = 플레이보드(안원잘부ID)
    r["집계"] = 순위집계(주간, 일별, r["집계"])
    r["주간"] = 주간
    r["기준"] = 오늘
    print(f"    순위 한국 {주간[-1]['한국']:,}위 · 전세계 {주간[-1]['전세계']:,}위")
    쓰기("rank.json", r)
    상태기록("rank", "OK", 주간[-1]["날짜"], f"한국 {주간[-1]['한국']:,}위")
    return f"한국 {주간[-1]['한국']:,}위"


# ────────────────────────────────────────────────────────── 영상 랭킹
채널정보 = {
    "리센느": {"이름": "RESCENE", "부제": "리센느 공식 · THE MUZE", "ID": 리센느ID},
    "안원잘부": {"이름": "안녕하세요원이입니다잘부탁드립니다", "부제": "원이 웹예능 · 솔파스튜디오",
               "ID": 안원잘부ID},
}
탭형식 = {"videos": "영상", "shorts": "쇼츠", "streams": "라이브"}
보관 = 150        # 채널마다 조회수·좋아요 상위 몇 편을 JSON 에 남기나
형식보관 = 80     # 형식(영상·쇼츠·라이브)마다 상위 몇 편을 남기나
일꾼 = 3          # 동시 조회 수. yt-dlp 로 6개를 굴렸더니 152편 만에 봇 차단을 받았다.
                 # watch 페이지만 한 번씩 받는 지금 방식으로도 3 이상은 올리지 않는다.


def 채널영상들(채널ID):
    """{영상ID: 형식}. 형식은 유튜브 탭 그대로다 — 길이로 추측하지 않는다.
    목록만 뽑는 flat 조회는 API 키가 있어도 yt-dlp 로 한다. 업로드 재생목록에는
    쇼츠·라이브 구분이 없어 API 로는 형식을 알 수 없기 때문이다."""
    import yt_dlp
    옵션 = {"quiet": True, "no_warnings": True, "extract_flat": True, "skip_download": True}
    본 = {}
    with yt_dlp.YoutubeDL(옵션) as y:
        for 탭, 형식 in 탭형식.items():
            try:
                info = y.extract_info(f"https://www.youtube.com/channel/{채널ID}/{탭}", download=False)
            except Exception as e:
                if "does not have a" in str(e):     # 라이브를 한 적 없는 채널
                    continue
                raise
            for e in info.get("entries") or []:
                본.setdefault(e["id"], 형식)        # 먼저 만난 탭의 형식을 쓴다
    if not 본:
        raise RuntimeError(f"영상 목록이 비었다 — 채널 {채널ID}")
    return 본


def _ISO길이(s):
    """PT1H2M3S → 3723. 못 읽으면 0."""
    m = re.match(r"^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$", s or "")
    if not m:
        return 0
    d, h, mi, se = (int(x) if x else 0 for x in m.groups())
    return ((d * 24 + h) * 60 + mi) * 60 + se


_지역 = threading.local()


def _브라우저():
    """스레드마다 opener 를 하나씩 둔다. 쿠키를 안 쓰므로 공유해도 되지만
    urllib 의 opener 는 스레드 안전이 보장되지 않는다."""
    op = getattr(_지역, "op", None)
    if op is None:
        op = urllib.request.build_opener()
        op.addheaders = [("User-Agent", UA),
                         ("Accept-Language", "en-US,en;q=0.9"),
                         ("Accept", "text/html,application/xhtml+xml")]
        _지역.op = op
    return op


def _숫자(s):
    return int(re.sub(r"[^\d]", "", s)) if s else None


def _한편(vid):
    """watch 페이지 HTML 한 번으로 조회수·좋아요·공개일·길이·제목을 읽는다.

    yt-dlp 는 한 편에 player API 까지 서너 번을 두드려 「Sign in to confirm you're not a bot」
    을 부른다 — 실제로 1,689편 중 152편에서 막혔다. 여기서는 페이지를 한 번만 받는다.
    영어(hl=en)로 받는 이유는 좋아요 수가 「11.7만」 같이 줄어 오지 않게 하기 위해서다.
    """
    u = f"https://www.youtube.com/watch?v={vid}&hl=en&gl=US"
    for 시도 in range(3):
        try:
            with _브라우저().open(u, timeout=30) as r:
                h = r.read().decode("utf-8", errors="replace")
            조회 = re.search(r'"viewCount":"(\d+)"', h)
            if not 조회:
                raise RuntimeError("viewCount 가 없다")   # 동의 화면·봇 차단 페이지
            좋아요 = (re.search(r'"expandedLikeCount":"([\d,\.]+)"', h)
                   or re.search(r'"likeCount":"(\d+)"', h))
            날 = (re.search(r'"uploadDate":"(\d{4}-\d{2}-\d{2})', h)
                 or re.search(r'"publishDate":"(\d{4}-\d{2}-\d{2})', h))
            길이 = re.search(r'"lengthSeconds":"(\d+)"', h)
            제목 = re.search(r'<meta name="title" content="([^"]*)"', h)
            return vid, {"제목": html.unescape(제목.group(1)) if 제목 else "",
                         "조회수": int(조회.group(1)),
                         "좋아요": _숫자(좋아요.group(1)) if 좋아요 else None,
                         "공개일": 날.group(1) if 날 else "",
                         "길이": int(길이.group(1)) if 길이 else 0}
        except Exception as e:
            코드 = getattr(e, "code", None)
            time.sleep((20 if 코드 == 429 else 3) * (시도 + 1))
    return vid, None


def 영상통계(영상ID들):
    """{id: {제목·조회수·좋아요·공개일·길이}}. 못 받은 영상은 빠진다.
    좋아요를 숨긴 영상은 좋아요=None 이다 — 0 으로 적으면 순위가 거짓이 된다."""
    결과 = {}
    if os.environ.get("YOUTUBE_API_KEY"):
        for i in range(0, len(영상ID들), 50):
            d = _api("videos", {"part": "snippet,statistics,contentDetails",
                                "id": ",".join(영상ID들[i:i + 50])})
            for v in d.get("items", []):
                st, sn = v.get("statistics", {}), v.get("snippet", {})
                결과[v["id"]] = {
                    "제목": sn.get("title") or "",
                    "조회수": int(st.get("viewCount") or 0),
                    "좋아요": int(st["likeCount"]) if "likeCount" in st else None,
                    "공개일": (sn.get("publishedAt") or "")[:10],
                    "길이": _ISO길이(v.get("contentDetails", {}).get("duration")),
                }
    else:
        from concurrent.futures import ThreadPoolExecutor
        with ThreadPoolExecutor(max_workers=일꾼) as ex:
            for n, (vid, 값) in enumerate(ex.map(_한편, 영상ID들), 1):
                if 값:
                    결과[vid] = 값
                if n % 200 == 0:
                    print(f"      {n}/{len(영상ID들)}편")

    # 2차 — 못 받은 편만 한 개씩 천천히 다시 시도한다.
    # 실패는 조회수와 무관하게 흩어지므로 그대로 두면 랭킹에 구멍이 난다.
    # 실제로 1차에서 132편이 빠졌고 그 안에 조회수 10위권(Pinball 959만)이 있었다.
    빠진 = [v for v in 영상ID들 if v not in 결과]
    if 빠진:
        print(f"      2차 — 못 받은 {len(빠진)}편을 하나씩 다시")
        for i, vid in enumerate(빠진, 1):
            _, 값 = _한편(vid)
            if 값:
                결과[vid] = 값
            time.sleep(0.7)          # 1차에서 막힌 뒤라 더 천천히 두드린다
            if i % 50 == 0:
                print(f"      2차 {i}/{len(빠진)}편")
    return 결과


def 남길것(목록):
    """조회수 상위 · 좋아요 상위 · 형식별 상위를 합집합으로 남긴다.
    전부 담으면 매주 300KB 씩 저장소가 불어나고, 화면은 상위 50편까지만 쓴다."""
    남 = set()

    def 상위(후보, 키, 개수):
        있는것 = [v for v in 후보 if v[키] is not None]
        있는것.sort(key=lambda v: -v[키])
        남.update(v["id"] for v in 있는것[:개수])

    상위(목록, "조회수", 보관)
    상위(목록, "좋아요", 보관)
    for 형식 in 탭형식.values():
        같은형식 = [v for v in 목록 if v["형식"] == 형식]
        상위(같은형식, "조회수", 형식보관)
        상위(같은형식, "좋아요", 형식보관)
    return [v for v in 목록 if v["id"] in 남]


def videos():
    """채널마다 전체 영상의 조회수·좋아요를 다시 재고 상위만 남긴다.
    가장 오래 걸리는 수집이다 — 키가 없으면 편당 한 번씩 페이지를 받아 1,700편에 20분쯤 걸린다."""
    나온것 = {"기준": 오늘, "잰시각": 지금,
            "수단": "YouTube Data API v3" if os.environ.get("YOUTUBE_API_KEY") else "watch 페이지 직접 파싱",
            "보관": {"채널상위": 보관, "형식상위": 형식보관},
            "채널": {}}
    말 = []
    for 키, 정보 in 채널정보.items():
        형식맵 = 채널영상들(정보["ID"])
        아이디들 = list(형식맵)
        print(f"    {키} 목록 {len(아이디들)}편 — 통계 조회 시작")
        통계 = 영상통계(아이디들)
        빠진수 = len(아이디들) - len(통계)
        if 빠진수 > len(아이디들) * 0.1:
            raise RuntimeError(f"{키}: {len(아이디들)}편 중 {빠진수}편을 못 받았다 (10% 초과)")

        목록 = [dict(통계[v], id=v, 형식=형식맵[v]) for v in 아이디들 if v in 통계]
        목록.sort(key=lambda v: -v["조회수"])
        좋아요있는것 = [v for v in 목록 if v["좋아요"] is not None]
        나온것["채널"][키] = {
            "이름": 정보["이름"], "부제": 정보["부제"], "채널ID": 정보["ID"],
            "편수": dict({"전체": len(목록)},
                       **{f: sum(1 for v in 목록 if v["형식"] == f) for f in 탭형식.values()}),
            "합계": {"조회수": sum(v["조회수"] for v in 목록),
                   "좋아요": sum(v["좋아요"] for v in 좋아요있는것)},
            "좋아요숨김": len(목록) - len(좋아요있는것),
            "못받은편수": 빠진수,
            "목록": 남길것(목록),
        }
        c = 나온것["채널"][키]
        print(f"    {키} {c['편수']['전체']}편 · 조회수 {c['합계']['조회수']:,} "
              f"· 좋아요 {c['합계']['좋아요']:,} · 남긴 {len(c['목록'])}편")
        말.append(f"{키} {c['편수']['전체']}편")

    쓰기("videos.json", 나온것)
    상태기록("videos", "OK", 오늘,
          " · ".join(f"{k} {v['편수']['전체']}편 조회수 {v['합계']['조회수']:,}"
                     for k, v in 나온것["채널"].items()),
          출처="유튜브 채널 탭 + " + 나온것["수단"])
    return " · ".join(말)


# ────────────────────────────────────────────────────────── 08 아카이브
아카이브채널 = "UCXhPSo-zn2vM_sMzDwM9_tw"     # 내 쇼츠 채널 @data-viz
아카이브시작 = "2026-08-09"                    # 리센느 소재로 돌린 날. 그 전 편은 이 페이지와 무관하다
아카이브최대 = 40                              # 한 번에 훑는 최근 편수

# 제목이나 설명에 이 중 하나가 있어야 카드로 넣는다. 이 채널에는 야구·선거·연휴 쇼츠도
# 올라오는데 그런 편이 「우리가 세어 본 것들」에 끼면 페이지가 무슨 페이지인지 흐려진다.
# 「메이」는 넣지 않는다 — 「메이저리그」에 걸린다. 그 편들은 설명에 안원잘부가 들어 있어 걸린다.
아카이브관련어 = ("리센느", "rescene", "안원잘부", "anwonjalbu", "리마인", "re:min",
              "원이", "제나", "미나미", "민채", "리브", "까엉", "리트", "메트")

_설명패턴 = re.compile(r'"shortDescription":"((?:[^"' + chr(92) * 2 + r']|' + chr(92) * 2 + r'.)*)"')


def 채널최근영상(채널ID, 개수=아카이브최대):
    """[{id, 제목, 설명, 공개일, 길이}] 최신순.
    API 가 있으면 업로드 재생목록 한 번으로 설명까지 다 온다. 없으면 목록만 yt-dlp 로 뽑고
    편마다 watch 페이지를 받아 채운다(느리지만 로컬에서 확인할 때 쓴다)."""
    if os.environ.get("YOUTUBE_API_KEY"):
        d = _api("playlistItems", {"part": "snippet", "maxResults": min(개수, 50),
                                   "playlistId": "UU" + 채널ID[2:]})
        나옴 = []
        for it in d.get("items", []):
            sn = it["snippet"]
            나옴.append({"id": sn["resourceId"]["videoId"],
                       "제목": sn.get("title") or "",
                       "설명": sn.get("description") or "",
                       # publishedAt 은 UTC 다. 한국 날짜로 바꿔야 카드 날짜가 하루 어긋나지 않는다
                       "공개일": (datetime.strptime(sn["publishedAt"], "%Y-%m-%dT%H:%M:%SZ")
                               .replace(tzinfo=timezone.utc).astimezone(KST).strftime("%Y-%m-%d")),
                       "길이": 0})
        return 나옴

    import yt_dlp
    옵션 = {"quiet": True, "no_warnings": True, "extract_flat": True,
            "skip_download": True, "playlistend": 개수}
    본 = []
    with yt_dlp.YoutubeDL(옵션) as y:
        for 탭 in ("shorts", "videos"):
            try:
                info = y.extract_info(f"https://www.youtube.com/channel/{채널ID}/{탭}", download=False)
            except Exception as e:
                if "does not have a" in str(e):
                    continue
                raise
            본 += [e["id"] for e in (info.get("entries") or [])]
    나옴 = []
    for vid in 본[:개수]:
        _, 값 = _한편(vid)
        if not 값:
            continue
        나옴.append({"id": vid, "제목": 값["제목"], "설명": _설명받기(vid),
                    "공개일": 값["공개일"], "길이": 값["길이"]})
    return 나옴


def _설명받기(vid):
    """watch 페이지에서 설명만 따로 뽑는다. API 경로에서는 쓰지 않는다."""
    try:
        with _브라우저().open(f"https://www.youtube.com/watch?v={vid}&hl=ko&gl=KR", timeout=30) as r:
            h = r.read().decode("utf-8", errors="replace")
        m = _설명패턴.search(h)
        return json.loads('"' + m.group(1) + '"') if m else ""
    except Exception:
        return ""


def 첫문장(설명):
    """설명 첫 문장을 카드의 「주장」으로 쓴다. 사람이 손으로 적어 둔 주장은 건드리지 않는다.

    첫 「줄」을 그대로 쓰면 안 된다 — 유튜브 설명은 한 문장이 두세 줄로 접혀 있어서
    「…2026년 2월 23일부터 8월 19일까지」처럼 중간에서 끊긴다. 빈 줄 전까지를 한 문단으로
    이어 붙인 뒤 마침표까지를 잘라낸다.
    """
    문단 = []
    for 줄 in (설명 or "").split("\n"):
        if not 줄.strip():
            if 문단:
                break
            continue
        문단.append(줄.strip())
    글 = " ".join(문단)
    m = re.match(r"(.+?[.。!?])(\s|$)", 글)
    문장 = (m.group(1) if m else 글).strip()
    if len(문장) > 90:                       # 카드 한 장에 들어갈 만큼만
        문장 = 문장[:88].rstrip() + "…"
    return 문장


def 아카이브():
    """@data-viz 채널에 새로 올라온 리센느 쇼츠를 카드로 더한다.

    이미 있는 카드는 손대지 않는다 — 「주장」과 「수치」는 사람이 쓴 문장이고
    유튜브에서 되받을 수 있는 값이 아니다. 새 카드의 주장은 영상 설명 첫 줄로 채우고
    수치는 비워 둔다(화면은 수치가 비면 그 줄을 그리지 않는다).
    """
    a = 읽기("archive.json")
    있는것 = {c["id"] for c in a["카드"] if c.get("id")}
    최근 = 채널최근영상(아카이브채널)
    if not 최근:
        raise RuntimeError("채널에서 아무 편도 못 받았다")

    새것, 거른것 = [], []
    for v in 최근:
        if v["id"] in 있는것 or v["공개일"] < 아카이브시작:
            continue
        본문 = (v["제목"] + " " + v["설명"]).lower()
        if not any(w in 본문 for w in 아카이브관련어):
            거른것.append(v["제목"][:28])
            continue
        새것.append({
            "id": v["id"], "날짜": v["공개일"], "제목": html.unescape(v["제목"]),
            "주장": 첫문장(v["설명"]), "수치": "",
            "링크": f"https://www.youtube.com/shorts/{v['id']}",
            "썸네일": f"https://i.ytimg.com/vi/{v['id']}/mqdefault.jpg",
            "공개예정": False,
        })

    if 거른것:
        print(f"    리센느와 무관해 뺀 편: {', '.join(거른것)}")
    if 새것:
        올린것 = [c for c in a["카드"] if not c.get("공개예정")]
        예정 = [c for c in a["카드"] if c.get("공개예정")]
        올린것 = sorted(새것 + 올린것, key=lambda c: c["날짜"], reverse=True)
        a["카드"] = 올린것 + 예정        # 아직 안 올린 카드는 늘 맨 뒤에 둔다
    a["기준"] = 오늘
    쓰기("archive.json", a)

    말 = f"카드 {len(a['카드'])}장" + (f" (새로 {len(새것)}장)" if 새것 else " (새 편 없음)")
    for c in 새것:
        print(f"    + {c['날짜']} {c['제목'][:34]}")
    상태기록("archive", "OK", 오늘, 말)
    return 말


# ────────────────────────────────────────────────────────── 실행
작업 = {
    "daily": [("live", daily), ("archive", 아카이브)],
    "weekly": [("trends", weekly_트렌드), ("rank", weekly_순위)],
    "videos": [("videos", videos)],
    "archive": [("archive", 아카이브)],
}


def main():
    무엇 = next((a for a in sys.argv[1:] if not a.startswith("--")), None)
    if 무엇 not in 작업:
        print(__doc__)
        sys.exit(2)

    수단 = ("YouTube Data API v3" if os.environ.get("YOUTUBE_API_KEY")
          else "yt-dlp(목록) + watch 페이지 파싱(조회수·좋아요)")
    print(f"[{지금} KST] {무엇} · 유튜브 수집 수단 = {수단}"
          + (" · 확인만" if 확인만 else ""))

    실패 = []
    for 키, 함수 in 작업[무엇]:
        print(f"  {키} …")
        try:
            결과 = 함수()
            print(f"  {키} OK — {결과}")
        except Exception as e:
            메시지 = f"{type(e).__name__}: {e}"[:200]
            print(f"  {키} 실패 — {메시지}")
            상태기록(키, "실패", None, 메시지)
            실패.append(키)

    if 실패:
        # 실패해도 JSON 은 그대로 두었다. 화면에는 직전 값이 보이고 표에 실패로 남는다.
        print(f"\n실패: {', '.join(실패)} — 직전 값을 유지했다")
        sys.exit(1)
    print("\n모두 성공")


if __name__ == "__main__":
    main()
