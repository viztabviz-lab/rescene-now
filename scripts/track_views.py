# -*- coding: utf-8 -*-
"""영상 한 편의 조회수를 1분 간격으로 적립한다 (GitHub Actions 용 · PC 가 꺼져 있어도 돈다)

「n시간 만에 500만」 같은 돌파 시각은 그 순간에 재 두지 않으면 어디에도 안 남는다.
PC 쪽 `신규영상추적.py` 는 PC 가 잠들면 같이 죽으므로, 같은 일을 여기서 한다.

  · 값   YouTube Data API v3 videos.list(statistics) — 1회 1유닛, 하루 1,440유닛
  · 저장 `track` 브랜치의 track/<영상ID>.csv  (main 을 건드리지 않아 Pages 빌드·커밋 이력이 안 더러워진다)
  · 한 번 실행이 RUN_MIN 분 동안 1분마다 재고, 5점마다 push 한다
  · 끝   목표를 넘고 AFTER_MIN 분이 더 지났거나 DEADLINE 이 지나면 track/<영상ID>.done 을 남기고 멈춘다

환경변수: YOUTUBE_API_KEY · VIDEO_ID · TARGET · DEADLINE(ISO, +09:00) · RUN_MIN · AFTER_MIN · OUT_DIR
"""
import os, sys, csv, json, time, datetime, subprocess, urllib.request, urllib.parse

KST = datetime.timezone(datetime.timedelta(hours=9))
KEY = os.environ["YOUTUBE_API_KEY"]
VID = os.environ["VIDEO_ID"]
TARGET = int(os.environ.get("TARGET", "0"))
DEADLINE = datetime.datetime.fromisoformat(os.environ["DEADLINE"])
RUN_MIN = float(os.environ.get("RUN_MIN", "50"))
AFTER_MIN = int(os.environ.get("AFTER_MIN", "30"))
OUT = os.environ.get("OUT_DIR", "out")
CSV = os.path.join(OUT, "track", VID + ".csv")
DONE = os.path.join(OUT, "track", VID + ".done")


def 재기():
    u = "https://www.googleapis.com/youtube/v3/videos?" + urllib.parse.urlencode(
        {"part": "statistics", "id": VID, "key": KEY})
    s = json.loads(urllib.request.urlopen(u, timeout=20).read())["items"][0]["statistics"]
    return int(s["viewCount"]), s.get("likeCount", ""), s.get("commentCount", "")


def push(msg):
    def g(*a):
        return subprocess.run(["git", "-C", OUT] + list(a), capture_output=True, text=True)
    g("add", "track")
    if g("diff", "--cached", "--quiet").returncode == 0:
        return
    g("commit", "-q", "-m", msg)
    r = g("push", "-q", "origin", "HEAD:track")
    if r.returncode != 0:
        print("push 실패:", r.stderr.strip()[:200], flush=True)


def 넘은뒤점수():
    if not os.path.exists(CSV) or not TARGET:
        return 0
    return sum(1 for r in csv.DictReader(open(CSV, encoding="utf-8")) if r["views"] and int(r["views"]) >= TARGET)


os.makedirs(os.path.dirname(CSV), exist_ok=True)
if os.path.exists(DONE):
    print("이미 끝난 추적이다:", DONE)
    sys.exit(0)
if not os.path.exists(CSV):
    with open(CSV, "w", newline="", encoding="utf-8") as f:
        csv.writer(f).writerow(["kst", "views", "likes", "comments"])

시작, n, 끝 = time.time(), 0, None
while time.time() - 시작 < RUN_MIN * 60:
    t0, now = time.time(), datetime.datetime.now(KST)
    try:
        v, l, c = 재기()
        with open(CSV, "a", newline="", encoding="utf-8") as f:
            csv.writer(f).writerow([now.strftime("%Y-%m-%d %H:%M:%S"), v, l, c])
        n += 1
        print(now.strftime("%H:%M:%S"), format(v, ","), flush=True)
    except Exception as e:
        print(now.strftime("%H:%M:%S"), "실패", type(e).__name__, str(e)[:120], flush=True)
    if now > DEADLINE:
        끝 = "기한 %s 지남" % DEADLINE.isoformat()
    elif TARGET and 넘은뒤점수() >= AFTER_MIN:
        끝 = "목표 %s 넘고 %d점 더 받음" % (format(TARGET, ","), AFTER_MIN)
    if 끝:
        open(DONE, "w", encoding="utf-8").write(끝 + "\n")
        break
    if n % 5 == 0:
        push("track: %s %s" % (VID, now.strftime("%m-%d %H:%M")))
    time.sleep(max(1, 60 - (time.time() - t0)))

push("track: %s %s%s" % (VID, datetime.datetime.now(KST).strftime("%m-%d %H:%M"), " (끝)" if 끝 else ""))
print("끝:", 끝 or "이번 실행 시간 종료 — 다음 실행이 잇는다")
