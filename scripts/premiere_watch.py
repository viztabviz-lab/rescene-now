# -*- coding: utf-8 -*-
"""안원잘부 채널에 프리미어가 뜨면 동접을 10초 간격으로 적립한다 — PC 없이 GitHub Actions 에서.

PC 쪽 프리미어감시.py + 동접수집.py 와 같은 방식(채널 /videos·/streams 폴링 → watch HTML originalViewCount).
watch HTML 이 막히면 videos.list liveStreamingDetails.concurrentViewers 를 같이 적어 둔다(API열).
결과: track 브랜치 track/premiere_<영상ID>.csv · 진행 로그 track/premiere_<YYMMDD>.log
"""
import os, re, csv, json, time, datetime, subprocess, urllib.request

KST = datetime.timezone(datetime.timedelta(hours=9))
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
채널들 = ["https://www.youtube.com/@helloiamwoninicetomeetyou/videos",
          "https://www.youtube.com/@helloiamwoninicetomeetyou/streams"]
KEY = os.environ.get("YOUTUBE_API_KEY", "")
OUT = os.environ.get("OUT_DIR", "out")
마감 = datetime.datetime.fromisoformat(os.environ["DEADLINE"])
감시간격 = int(os.environ.get("WATCH_SEC", "30"))
수집간격 = int(os.environ.get("SAMPLE_SEC", "10"))
D = os.path.join(OUT, "track")
os.makedirs(D, exist_ok=True)
로그경로 = os.path.join(D, f"premiere_{datetime.datetime.now(KST):%y%m%d}.log")

RE_뷰 = re.compile(r'videoViewCountRenderer":\{"viewCount":\{"runs":\[(.*?)\]\}'
                   r',"isLive":(true|false)(?:,"originalViewCount":"(\d+)")?')
RE_런 = re.compile(r'"text":"([^"]*)"')
RE_좋아요 = re.compile(r'"likeCount":"(\d+)"')


def 지금():
    return datetime.datetime.now(KST)


def 로그(s):
    줄 = f"[{지금():%m-%d %H:%M:%S}] {s}"
    print(줄, flush=True)
    with open(로그경로, "a", encoding="utf-8") as f:
        f.write(줄 + "\n")


def 받기(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "ko-KR,ko;q=0.9",
                                               "Cookie": "CONSENT=YES+1; SOCS=CAI"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read().decode("utf-8", "replace")


def 목록():
    ids = []
    for u in 채널들:
        try:
            for v in re.findall(r'"videoId":"([\w-]{11})"', 받기(u)):
                if v not in ids:
                    ids.append(v)
        except Exception as e:
            로그(f"채널 조회 실패 {u[-8:]} {type(e).__name__}")
    return ids


def 뽑기(vid):
    try:
        html = 받기(f"https://www.youtube.com/watch?v={vid}")
    except Exception as e:
        return None, f"오류:{type(e).__name__}", None, ""
    상태 = "라이브" if '"isLiveNow":true' in html else "라이브아님"
    m = RE_좋아요.search(html)
    좋아요 = int(m.group(1)) if m else None
    m = RE_뷰.search(html)
    if not m:
        return None, 상태, 좋아요, ""
    원문 = "".join(RE_런.findall(m.group(1)))
    수 = int(m.group(3)) if m.group(3) else None
    if 수 is None:
        n = re.search(r"([\d,]+)", 원문)
        수 = int(n.group(1).replace(",", "")) if n else None
    if "대기" in 원문:
        상태 = "대기"
    elif "시청 중" in 원문:
        상태 = "시청중"
    return 수, 상태, 좋아요, 원문


def api(vid):
    if not KEY:
        return {}
    try:
        u = ("https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,liveStreamingDetails"
             f"&id={vid}&key={KEY}")
        it = json.loads(받기(u)).get("items", [])
        return it[0] if it else {}
    except Exception:
        return {}


def 올리기(msg):
    subprocess.run(["git", "-C", OUT, "add", "-A"], check=False)
    r = subprocess.run(["git", "-C", OUT, "commit", "-q", "-m", msg], check=False)
    if r.returncode == 0:
        for _ in range(3):
            if subprocess.run(["git", "-C", OUT, "push", "-q", "origin", "HEAD:track"], check=False).returncode == 0:
                return
            subprocess.run(["git", "-C", OUT, "pull", "-q", "--rebase", "origin", "track"], check=False)


def 수집(vid, 제목):
    p = os.path.join(D, f"premiere_{vid}.csv")
    새파일 = not os.path.exists(p)
    f = open(p, "a", newline="", encoding="utf-8-sig")
    w = csv.writer(f)
    if 새파일:
        w.writerow(["시각KST", "동접", "상태", "좋아요", "원문", "API동접", "API조회수"])
    로그(f"수집 시작 {vid} 「{제목}」 → {p}")
    시청본적, 끝시각, 마지막푸시, n = False, None, time.time(), 0
    while 지금() < 마감:
        t0 = time.time()
        수, 상태, 좋아요, 원문 = 뽑기(vid)
        a, apin, apiv = {}, "", ""
        if n % 3 == 0 or 수 is None:          # API 는 30초마다(대기 구간엔 값이 없다) — 할당량 아끼기
            a = api(vid)
            apin = a.get("liveStreamingDetails", {}).get("concurrentViewers", "")
            apiv = a.get("statistics", {}).get("viewCount", "")
        w.writerow([f"{지금():%Y-%m-%d %H:%M:%S}", 수 if 수 is not None else "", 상태,
                    좋아요 if 좋아요 is not None else "", 원문, apin, apiv])
        f.flush()
        n += 1
        if n % 6 == 1:
            로그(f"{상태} 동접 {수} API {apin} 좋아요 {좋아요}")
        if 상태 == "시청중" or apin:
            시청본적 = True
        if 시청본적 and 상태 == "라이브아님" and not apin:
            끝시각 = 끝시각 or time.time()
            if time.time() - 끝시각 > 120:
                로그("프리미어 종료 감지 — 2분 더 적고 끝냄")
                break
        else:
            끝시각 = None
        if time.time() - 마지막푸시 >= 60:
            올리기(f"premiere {vid} {지금():%H:%M}")
            마지막푸시 = time.time()
        time.sleep(max(0, 수집간격 - (time.time() - t0)))
    f.close()
    올리기(f"premiere {vid} 끝")
    return 시청본적


def main():
    기준 = set(목록())
    로그(f"기준 영상 {len(기준)}개 확보. {감시간격}초마다 확인, 마감 {마감:%H:%M}")
    if not 기준:
        로그("채널 목록을 하나도 못 읽었다 — GitHub IP 가 막힌 듯")
    올리기("premiere 감시 시작")
    while 지금() < 마감:
        현재 = 목록()
        for vid in [v for v in 현재 if v not in 기준]:
            기준.add(vid)
            수, 상태, _, 원문 = 뽑기(vid)
            a = api(vid)
            lsd = a.get("liveStreamingDetails")
            제목 = a.get("snippet", {}).get("title", "")
            로그(f"새 영상 {vid} 「{제목}」 상태 {상태} 원문 「{원문}」 live={bool(lsd)}")
            if 상태 in ("대기", "시청중", "라이브") or (lsd and not lsd.get("actualEndTime")):
                if 수집(vid, 제목):
                    로그("한 편 끝 — 감시 종료")
                    return
            else:
                로그("프리미어 아님 — 계속 감시")
                올리기(f"premiere 일반 업로드 {vid}")
        time.sleep(감시간격)
    로그("마감 시각 — 오늘은 프리미어 없음")
    올리기("premiere 마감")


if __name__ == "__main__":
    main()
