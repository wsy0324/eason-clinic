"""
Build songs_raw.json from music_data/Eason_music_all.xlsx

- Reads Excel, backfills album info
- Cleans song names (removes parenthetical content)
- Deduplicates (prefer studio > compilation > single > radio drama)
- Outputs frontend/src/data/songs_raw.json
"""

import openpyxl
import json
import re
import sys
import os
from collections import defaultdict

sys.stdout.reconfigure(encoding='utf-8')

EXCEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'music_data', 'Eason_music_all.xlsx')
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'src', 'data', 'songs_raw.json')

# Priority for deduplication: lower = higher priority
ALBUM_TYPE_PRIORITY = {
    '录音室专辑': 0,
    '新曲+精选': 1,
    '单曲': 2,
    '广播剧原声': 3,
}

def clean_song_name(name: str) -> str:
    """Remove parenthetical content like (Live), （国语版）, etc."""
    # Remove both () and （） and their content
    cleaned = re.sub(r'\s*[（\(][^）\)]*[）\)]', '', name).strip()
    return cleaned

def normalize_album_type(raw: str) -> str:
    """Normalize album type strings."""
    # Remove newlines and extra text
    t = raw.replace('\n', ' ').replace('\r', '').strip()
    # Map to canonical types
    if '录音室' in t:
        return 'studio'
    if '精选' in t or '新曲' in t:
        return 'compilation'
    if '单曲' in t:
        return 'single'
    if '广播剧' in t:
        return 'radio_drama'
    return 'unknown'

def slugify(title: str) -> str:
    """Create a pinyin-ish slug (simple: just use cleaned title as-is for now)."""
    # We'll generate better slugs later; for now use a hash or simple approach
    return re.sub(r'[^a-zA-Z0-9一-鿿]', '-', title).strip('-').lower()

def main():
    wb = openpyxl.load_workbook(EXCEL_PATH)
    ws = wb.active

    # Track album info for backfill
    current_album = ''
    current_type_raw = ''
    current_lang = ''
    current_company = ''
    current_date = ''

    all_songs = []

    for row in ws.iter_rows(min_row=3, values_only=True):
        date = row[0]
        album = str(row[1]).strip() if row[1] else ''
        company = str(row[2]).strip() if row[2] else ''
        album_type = str(row[3]).strip() if row[3] else ''
        lang = str(row[4]).strip() if row[4] else ''
        song = str(row[6]).strip() if row[6] else ''
        artist = str(row[7]).strip() if row[7] else ''

        if album:
            current_album = album
            current_type_raw = album_type
            current_lang = lang
            current_company = company
            current_date = date

        if not song:
            continue

        # Skip interludes, spoken word, karaoke versions
        skip_patterns = ['interlude', 'Interlude', 'Reprise', '口白', 'Kara', 'DEMO', 'Demo', 'demo', 'NG take']
        if any(p.lower() in song.lower() for p in skip_patterns):
            continue

        # Skip pure instrumentals / remix-only tracks
        if song.strip().upper() == song.strip() and len(song.strip()) < 5:
            # All-caps short titles like "STYLE" are fine, but skip things like "USIC BOX"
            if 'USIC' in song or 'SECOND' in song:
                continue

        cleaned = clean_song_name(song)
        if not cleaned or len(cleaned) < 1:
            continue

        all_songs.append({
            'original_title': song,
            'title': cleaned,
            'album': current_album,
            'album_type_raw': current_type_raw,
            'album_type': normalize_album_type(current_type_raw),
            'lang': current_lang,
            'company': current_company,
            'date': str(current_date)[:10] if current_date else '',
            'artist': artist,
        })

    print(f'Total songs parsed: {len(all_songs)}')

    # Deduplicate by cleaned title
    # For each title, pick best album type
    groups = defaultdict(list)
    for s in all_songs:
        groups[s['title']].append(s)

    deduped = []
    dupes_found = []

    for title, entries in groups.items():
        if len(entries) == 1:
            deduped.append(entries[0])
        else:
            # Sort by album type priority, then by date (newer first)
            entries_sorted = sorted(entries, key=lambda x: (
                ALBUM_TYPE_PRIORITY.get(x['album_type_raw'], 99),
                -(int(x['date'][:4]) if x['date'] and x['date'][:4].isdigit() else 0)
            ))
            best = entries_sorted[0]
            deduped.append(best)
            dupes_found.append({
                'title': title,
                'kept': f"{best['album']} ({best['album_type']})",
                'discarded': [f"{e['album']} ({e['album_type']})" for e in entries_sorted[1:]]
            })

    print(f'After dedup: {len(deduped)} songs')
    print(f'Duplicates resolved: {len(dupes_found)}')

    # Handle special case: K歌之王 粤语 vs 国语 - keep both
    # Check if both versions exist in all_songs
    kg_canto = [s for s in all_songs if 'K歌之王' in s['original_title'] and '粤语' in s['original_title']]
    kg_mando = [s for s in all_songs if 'K歌之王' in s['original_title'] and '国语' in s['original_title']]
    if kg_canto and kg_mando:
        # Make sure both are in deduped
        for s in kg_canto + kg_mando:
            cleaned = clean_song_name(s['original_title'])
            # Remove the generic K歌之王 and add both
            deduped = [d for d in deduped if d['title'] != 'K歌之王']
        # Add specific versions
        deduped.append({
            'original_title': kg_canto[0]['original_title'],
            'title': 'K歌之王（粤语）',
            'album': kg_canto[0]['album'],
            'album_type_raw': kg_canto[0]['album_type_raw'],
            'album_type': normalize_album_type(kg_canto[0]['album_type_raw']),
            'lang': kg_canto[0]['lang'],
            'company': kg_canto[0]['company'],
            'date': kg_canto[0]['date'],
            'artist': kg_canto[0]['artist'],
        })
        deduped.append({
            'original_title': kg_mando[0]['original_title'],
            'title': 'K歌之王（国语）',
            'album': kg_mando[0]['album'],
            'album_type_raw': kg_mando[0]['album_type_raw'],
            'album_type': normalize_album_type(kg_mando[0]['album_type_raw']),
            'lang': kg_mando[0]['lang'],
            'company': kg_mando[0]['company'],
            'date': kg_mando[0]['date'],
            'artist': kg_mando[0]['artist'],
        })

    # Similar: 低等动物 粤语版 (打得火热) and 国语版 (反正是我)
    dd_canto = [s for s in all_songs if '低等动物' in s['original_title'] and '国语' not in s['original_title']]
    dd_mando = [s for s in all_songs if '低等动物' in s['original_title'] and '国语' in s['original_title']]
    if dd_canto and dd_mando:
        deduped = [d for d in deduped if d['title'] != '低等动物']
        deduped.append({
            'original_title': dd_canto[0]['original_title'],
            'title': '低等动物（粤语）',
            'album': dd_canto[0]['album'],
            'album_type_raw': dd_canto[0]['album_type_raw'],
            'album_type': normalize_album_type(dd_canto[0]['album_type_raw']),
            'lang': dd_canto[0]['lang'],
            'company': dd_canto[0]['company'],
            'date': dd_canto[0]['date'],
            'artist': dd_canto[0]['artist'],
        })
        deduped.append({
            'original_title': dd_mando[0]['original_title'],
            'title': '低等动物（国语）',
            'album': dd_mando[0]['album'],
            'album_type_raw': dd_mando[0]['album_type_raw'],
            'album_type': normalize_album_type(dd_mando[0]['album_type_raw']),
            'lang': dd_mando[0]['lang'],
            'company': dd_mando[0]['company'],
            'date': dd_mando[0]['date'],
            'artist': dd_mando[0]['artist'],
        })

    # Shall We Talk 粤语 vs 国语
    swt_canto = [s for s in all_songs if 'Shall We Talk' in s['original_title'] and '国语' not in s['original_title']]
    swt_mando = [s for s in all_songs if 'Shall We Talk' in s['original_title'] and '国语' in s['original_title']]
    if swt_canto and swt_mando:
        deduped = [d for d in deduped if d['title'] != 'Shall We Talk']
        deduped.append({
            'original_title': swt_canto[0]['original_title'],
            'title': 'Shall We Talk（粤语）',
            'album': swt_canto[0]['album'],
            'album_type_raw': swt_canto[0]['album_type_raw'],
            'album_type': normalize_album_type(swt_canto[0]['album_type_raw']),
            'lang': swt_canto[0]['lang'],
            'company': swt_canto[0]['company'],
            'date': swt_canto[0]['date'],
            'artist': swt_canto[0]['artist'],
        })
        deduped.append({
            'original_title': swt_mando[0]['original_title'],
            'title': 'Shall We Talk（国语）',
            'album': swt_mando[0]['album'],
            'album_type_raw': swt_mando[0]['album_type_raw'],
            'album_type': normalize_album_type(swt_mando[0]['album_type_raw']),
            'lang': swt_mando[0]['lang'],
            'company': swt_mando[0]['company'],
            'date': swt_mando[0]['date'],
            'artist': swt_mando[0]['artist'],
        })

    # Remove tracks with "remix" or "Remix" in title (keep original, not remix)
    deduped = [d for d in deduped if 'remix' not in d['original_title'].lower() and 'Remix' not in d['original_title']]

    # Sort by date, then album
    deduped.sort(key=lambda x: (
        x['date'] if x['date'] else '9999',
        x['album']
    ))

    # Add IDs
    for i, song in enumerate(deduped):
        # Generate a simple ID
        song['id'] = f"song-{i+1:04d}"

    print(f'Final count: {len(deduped)} songs')

    # Write output
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(deduped, f, ensure_ascii=False, indent=2)

    print(f'Written to {OUTPUT_PATH}')

    # Also output duplicate report
    if dupes_found:
        print(f'\n=== Duplicate Resolution Report ===')
        for d in dupes_found:
            print(f'  {d["title"]}: kept {d["kept"]}, discarded {d["discarded"]}')

if __name__ == '__main__':
    main()
