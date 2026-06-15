"""
Prescription writer for Eason Music Clinic — expanded edition.

Generates human-readable prescription text from song data and templates.
All advice text is original — no lyrics are used.
"""

import random
import os
import json
from datetime import datetime


class PrescriptionWriter:
    def __init__(self):
        self.dosage_templates: list[str] = []
        self.follow_up_templates: list[str] = []
        self.emotion_analysis_templates: list[str] = []
        self.listening_scene_templates: list[str] = []
        self.daily_task_templates: list[str] = []
        self.avoid_templates: list[str] = []
        self.small_note_templates: list[str] = []
        self._load_templates()

    def _load_templates(self):
        data_dir = os.path.join(os.path.dirname(__file__), "data")
        with open(os.path.join(data_dir, "mood_keywords.json"), "r", encoding="utf-8") as f:
            mood_data = json.load(f)
            self.dosage_templates = mood_data.get("dosage_templates", [])
            self.follow_up_templates = mood_data.get("follow_up_templates", [])
            self.emotion_analysis_templates = mood_data.get("emotion_analysis_templates", [])
            self.listening_scene_templates = mood_data.get("listening_scene_templates", [])
            self.daily_task_templates = mood_data.get("daily_task_templates", [])
            self.avoid_templates = mood_data.get("avoid_templates", [])
            self.small_note_templates = mood_data.get("small_note_templates", [])

    def generate_song_reason(self, song: dict, symptoms: list[str]) -> str:
        """Generate a personalized reason why this song fits the user's current state."""
        seeds = song.get("advice_seeds", [])
        mood_str = "、".join(symptoms[:3])

        if seeds:
            seed = random.choice(seeds)
            reasons = [
                f"适合在你感到{mood_str}的时候服用。{seed}。",
                f"这首歌里有一种{mood_str}时最需要的东西。{seed}。",
                f"为今天的{mood_str}开的。{seed}。",
                f"陈医生觉得你现在需要这个旋律。{seed}。",
            ]
            return random.choice(reasons)

        return f"适合在你感到{mood_str}的时候服用。这首歌或许能陪你把今晚过完。"

    def generate_doctor_advice(self, song: dict, symptoms: list[str]) -> str:
        """Generate original, warm doctor advice text."""
        seeds = song.get("advice_seeds", [])
        if seeds:
            return random.choice(seeds)

        symptom_advice = {
            "疲惫": "累的时候就先停下来吧，没有人规定你必须一直跑。先休息，再出发。",
            "失恋": "允许自己难过，但不准一直难过。先把这首歌听完，听完之后好好洗个脸。",
            "迷茫": "不知道方向很正常，很多人都是边走边找。你现在只是暂时看不清，不是没有路。",
            "孤独": "一个人不是孤独，是独处。独处的时候你可以把所有伪装卸下来。",
            "想逃离": "偶尔离开一下不是逃避，是重新整理自己。走一段路，看一些风景，然后再决定。",
            "不甘心": "不甘心说明你还在乎，这是生命力。但别让不甘心消耗你太久。",
            "怀念": "怀念是因为那段日子值得。但最好的怀念方式，是带着它继续往前走。",
            "放不下": "放不下说明你真正拥有过。不急着放下，先让它安静地待在你心里。",
            "释怀不了": "释怀不是删除记忆，是把它放到一个不会再疼的位置。",
            "没人懂我": "懂你的人不用多，你懂自己就够了。不过今晚，陈医生试着懂你。",
            "想重新开始": "每一个重新开始的日子，都是从上一首歌结束的时候开始的。",
            "压抑": "盖子压太久了，掀开一条缝，让今晚的夜风进来一点。",
            "成长": "成长不是变完美，是学会和自己的不完美好好相处。",
            "温暖": "今晚世界欠你的温度，让这首歌还给你一点点。",
            "焦虑": "你不是落后了，你只是在自己的时区里。深呼吸，没人催你。",
            "开心": "开心的时候更应该好好听一首歌，让这个瞬间被音乐记住。快乐值得被庆祝。",
            "轻松": "轻松的状态很珍贵，选一首歌配这个心情，就当给今天的自己一个奖励。",
            "感恩": "能感到感恩说明你心里有光。把这份感谢收进一首歌里，它会存得很久。",
            "期待": "对未来有期待是一件很好的事。在等待它来的时候，先听首好歌暖个场。",
            "释然": "想通了的感觉真好啊，像卸下一件背了很久的行李。这首歌就是你的卸货仪式。",
            "活力": "有能量的时候就该让它尽情释放。这首歌就是你的充电背景音，去做你想做的。",
        }
        for symptom in symptoms:
            if symptom in symptom_advice:
                return symptom_advice[symptom]

        return "你不一定是需要答案，你可能只是需要一首歌的时间。先听完这首，再看。"

    def generate_emotion_analysis(self, symptoms: list[str]) -> str:
        """Generate an 'auscultation' paragraph describing the user's emotional state."""
        if self.emotion_analysis_templates:
            template = random.choice(self.emotion_analysis_templates)
            mood_str = "、".join(symptoms[:3])
            mood_count = len(symptoms)
            if mood_count == 1:
                mood_desc = "一种很清晰的感受"
            elif mood_count == 2:
                mood_desc = "两种情绪交织在一起"
            else:
                mood_desc = "好几种情绪混在一起"
            return template.replace("{moods}", mood_str).replace("{mood_desc}", mood_desc).replace("{count}", str(mood_count))
        mood_str = "、".join(symptoms[:3])
        return f"陈医生听到的，是{mood_str}。今晚先把其他的放一放，我们先处理这个。"

    def generate_listening_scene(self, song: dict, symptoms: list[str]) -> str:
        """Generate a recommended listening scene."""
        if self.listening_scene_templates:
            return random.choice(self.listening_scene_templates)
        scenes = [
            "推荐场景：夜晚路上、公交靠窗、宿舍关灯后。",
            "推荐场景：睡前床上、只开一盏小灯、闭上眼睛。",
            "推荐场景：一个人散步的时候、耳机音量刚好盖过车声。",
            "推荐场景：雨天窗边、一杯温水、什么都不用想。",
        ]
        return random.choice(scenes)

    def generate_daily_task(self, symptoms: list[str]) -> str:
        """Generate a small daily task for the user."""
        if self.daily_task_templates:
            return random.choice(self.daily_task_templates)
        tasks = [
            "今日小任务：出门走十分钟，什么都不用想，只听完这一首歌。",
            "今日小任务：写下三个今天让你觉得还可以的小事，哪怕只是喝到一杯不错的咖啡。",
            "今日小任务：给自己发一条语音消息，说一句你今天最想听到的话。",
            "今日小任务：洗个热水澡，在水声里把这首歌循环三遍。",
        ]
        return random.choice(tasks)

    def generate_avoid(self) -> str:
        """Generate a 'contraindication' notice."""
        if self.avoid_templates:
            return random.choice(self.avoid_templates)
        avoids = [
            "服用禁忌：不要一边刷短视频一边听，也不要急着逼自己马上好起来。",
            "服用禁忌：不建议在社交媒体上寻找对比，此刻你只需要这首歌。",
            "服用禁忌：不要跳过前奏，也不要还没听完就切下一首。",
            "服用禁忌：不要一边听一边自我检讨，今晚你的任务只是听完。",
        ]
        return random.choice(avoids)

    def generate_small_note(self) -> str:
        """Generate a small note at the bottom of the prescription."""
        if self.small_note_templates:
            return random.choice(self.small_note_templates)
        notes = [
            "本处方不负责解决所有问题，只负责陪你把今晚过完。",
            "本门诊不治病，只负责在你需要的时候放一首对的歌。",
            "处方有效期：今晚。明天如果还需要，记得回来复诊。",
        ]
        return random.choice(notes)

    def generate_rx_id(self) -> str:
        """Generate a prescription ID like RX-2026-0615-034"""
        now = datetime.now()
        date_str = now.strftime("%Y-%m%d")
        rand = random.randint(1, 999)
        return f"RX-{date_str}-{rand:03d}"

    def write_prescription(self, song: dict, symptoms: list[str]) -> dict:
        """Generate a complete prescription from a recommended song."""
        return {
            "rx_id": self.generate_rx_id(),
            "clinic": random.choice(["情绪内科", "深夜情绪科", "音乐疗愈科", "心情内科"]),
            "symptom_summary": symptoms,
            "emotion_analysis": self.generate_emotion_analysis(symptoms),
            "song": {
                "id": song["id"],
                "title": song["title"],
                "moods": song.get("moods", []),
                "theme_color": song.get("theme_color", "#8b7355"),
            },
            "song_reason": self.generate_song_reason(song, symptoms),
            "dosage": random.choice(self.dosage_templates) if self.dosage_templates else "今晚散步时服用一次，音量调到刚好能盖住心事。",
            "listening_scene": self.generate_listening_scene(song, symptoms),
            "doctor_advice": self.generate_doctor_advice(song, symptoms),
            "daily_task": self.generate_daily_task(symptoms),
            "avoid": self.generate_avoid(),
            "follow_up": random.choice(self.follow_up_templates) if self.follow_up_templates else "明天再来复诊，陈医生可能会给你换一首更适合今天的歌。",
            "small_note": self.generate_small_note(),
        }


# Singleton
prescription_writer = PrescriptionWriter()
