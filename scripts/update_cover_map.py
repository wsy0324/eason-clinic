"""Update album_cover_map.json after new cover files added."""
import json, os, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('frontend/src/data/songs_raw.json', 'r', encoding='utf-8') as f:
    songs = json.load(f)

albums = set(s['album'] for s in songs)
cover_dir = 'frontend/public/assets/cd_cover'
cover_files = [f for f in os.listdir(cover_dir) if os.path.isfile(os.path.join(cover_dir, f))]

print(f'Albums: {len(albums)}, Cover files: {len(cover_files)}')

# Known matches (album name -> cover filename)
MANUAL = {
    'U87': 'U 87.jpg',
    'H3M': 'H³M.jpg',
    'L.O.V.E.': 'LOVE.jpg',
    'Solidays (2 CD)': 'Solidays.jpg',
    'Shall We Dance?Shall We Talk!': 'Shall We Dance？Shall We Talk!.jpg',
    'The Line-up': 'The Easy Ride.jpg',
    'Stranger under my skin': 'Stranger Under My Skin.jpg',
    'Live For Today': 'Live for Today.jpg',
    'The Easy Ride': 'The Easy Ride.jpg',
    'The Key': 'The Key.jpg',
    'Time Flies': 'Time Flies.jpg',
    'Listen To Eason Chan': 'Listen To Eason Chan.jpg',
    'Special thanks to': 'Special Thanks To.jpg',
    'Taste the Atmosphere': 'Taste the Atmosphere.jpg',
    'Life Continues': 'Life Continues.jpg',
    'CHIN UP!': 'CHIN UP!.jpg',
    'Nothing Really Matters': 'Life Continues.jpg',

    # Chinese album names
    '陈奕迅': '陈奕迅.jpg',
    '认了吧': '认了吧.jpg',
    '黑白灰': '黑白灰.jpg',
    '怎么样': '怎么样.jpg',
    '打得火热': '打得火热.jpg',
    '上五楼的快活': '上五楼的快活.jpg',
    '与我常在': '与我常在.jpg',
    '天佑爱人': '天佑爱人.jpg',
    '幸福': '幸福.jpg',
    '反正是我': '反正是我.jpg',
    '不想放手': '不想放手.jpg',
    '婚礼的祝福': '婚礼的祝福.jpg',
    '七': '七.jpg',
    '孤勇者': '孤勇者.jpg',
    '准备中': '準備中.jpg',
    '我的快乐时代': '我的快樂時代.jpg',
    '？': '？.jpg',
    '酝酿': '婚礼的祝福.jpg',
    '一滴眼泪': '婚礼的祝福.jpg',
}

def normalize(s):
    s = s.lower()
    for ch in '《》 ·.()&!?？：~-':
        s = s.replace(ch, '')
    return s

album_cover_map = {}

for album in sorted(albums):
    if album in MANUAL:
        if MANUAL[album] in cover_files:
            album_cover_map[album] = MANUAL[album]
            continue

    a_norm = normalize(album)
    best_score = 0
    best_cover = None

    for cf in cover_files:
        cf_name = os.path.splitext(cf)[0]
        c_norm = normalize(cf_name)

        score = 0
        if a_norm == c_norm:
            score = 100
        elif a_norm in c_norm:
            score = 85 * (len(a_norm) / len(c_norm))
        elif c_norm in a_norm:
            score = 85 * (len(c_norm) / len(a_norm))
        else:
            common = len(set(a_norm) & set(c_norm))
            if common >= 3:
                total = max(len(a_norm), len(c_norm))
                score = 60 * (common / total)

        if score > best_score:
            best_score = score
            best_cover = cf

    album_cover_map[album] = best_cover if best_score >= 55 else None

matched = sum(1 for v in album_cover_map.values() if v is not None)
print(f'Matched: {matched}/{len(albums)}')

unmatched = {k: v for k, v in album_cover_map.items() if v is None}
if unmatched:
    print(f'\nUnmatched albums ({len(unmatched)}):')
    for album in sorted(unmatched):
        affected = [s['title'] for s in songs if s['album'] == album][:3]
        print(f'  [{album}] -> {affected}')

with open('scripts/album_cover_map.json', 'w', encoding='utf-8') as f:
    json.dump(album_cover_map, f, ensure_ascii=False, indent=2)
print('Saved.')
