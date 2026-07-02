/**
 * 29 mood categories with keywords, display names, and emojis.
 *
 * Prescription templates have moved to per-song data (songs_enriched.json).
 * This file retains mood definitions for NLP matching and UI display.
 */

export interface MoodInfo {
  keywords: string[];
  display_name: string;
  display_emoji: string;
}

export const moodMap: Record<string, MoodInfo> = {
  // ── Positive / Light ──
  "开心": {
    keywords: ["开心", "高兴", "快乐", "愉快", "想笑", "喜悦", "乐", "欢快", "嗨", "兴奋", "笑", "好开心", "真开心", "太开心", "开心死了"],
    display_name: "开心",
    display_emoji: "😊",
  },
  "轻松": {
    keywords: ["轻松", "放松", "自在", "舒服", "惬意", "悠闲", "轻快", "松弛", "无忧无虑", "不紧张", "无所谓", "随便", "无所谓啦"],
    display_name: "轻松",
    display_emoji: "🍃",
  },
  "治愈": {
    keywords: ["治愈", "被治愈", "疗愈", "需要温暖", "温暖", "抱抱", "安慰", "温柔", "暖", "被理解", "被安慰"],
    display_name: "需要治愈",
    display_emoji: "🕯️",
  },
  "温暖": {
    keywords: ["温暖", "需要温暖", "安慰", "鼓励", "好话", "温柔的", "陪我", "陪伴", "暖", "温馨"],
    display_name: "需要温暖",
    display_emoji: "🤗",
  },
  "释怀": {
    keywords: ["释怀", "看开", "算了", "就这样吧", "接受了", "想通了", "过去了", "放下了", "没关系了", "没事了", "算了算了"],
    display_name: "释怀",
    display_emoji: "🕊️",
  },
  "成长": {
    keywords: ["长大", "成熟", "变老", "时间过", "年龄", "年纪", "一辈子", "人生", "活成", "变得", "发现", "终于明白"],
    display_name: "成长",
    display_emoji: "🌳",
  },
  "自由": {
    keywords: ["自由", "解放", "不受束缚", "随便", "任性", "按自己", "随心", "自由自在", "飞", "放飞"],
    display_name: "渴望自由",
    display_emoji: "🕊️",
  },
  "勇气": {
    keywords: ["勇气", "勇敢", "胆量", "不怕", "冲", "敢", "坚强", "不退缩", "面对", "往前"],
    display_name: "需要勇气",
    display_emoji: "⚔️",
  },
  "浪漫": {
    keywords: ["浪漫", "甜蜜", "心动", "约会", "恋爱", "玫瑰花", "小鹿乱撞", "美好", "甜", "温柔的", "深情"],
    display_name: "浪漫",
    display_emoji: "💕",
  },
  "暧昧": {
    keywords: ["暧昧", "不确定", "试探", "朦胧", "说不清", "说不出口", "暗恋", "偷偷", "在意", "猜", "想他", "想她"],
    display_name: "暧昧",
    display_emoji: "💫",
  },

  // ── Sad / Heartbreak ──
  "失恋": {
    keywords: ["失恋", "分手", "不爱了", "前任", "被甩", "他走了", "她走了", "离开我", "爱错", "感情结束", "散了", "没了"],
    display_name: "失恋",
    display_emoji: "💔",
  },
  "放不下": {
    keywords: ["放不下", "忘不了", "忘不掉", "舍不得", "还想", "还在想", "走不出", "摆脱不了", "没办法放下", "还在意"],
    display_name: "放不下",
    display_emoji: "💭",
  },
  "遗憾": {
    keywords: ["遗憾", "后悔", "可惜", "如果当初", "差一点", "错过", "来不及", "要是", "当时", "没想到", "悔恨"],
    display_name: "遗憾",
    display_emoji: "🍂",
  },
  "怀念": {
    keywords: ["怀念", "想念", "回忆", "过去", "想家", "以前", "曾经", "那时候", "好想", "怀旧", "思念", "记起", "想回"],
    display_name: "怀念",
    display_emoji: "📷",
  },
  "孤独": {
    keywords: ["孤独", "一个人", "孤单", "寂寞", "没人", "独处", "一个人过", "独自", "好孤单", "没人陪", "空", "冷冷清清"],
    display_name: "孤独",
    display_emoji: "🌙",
  },
  "麻木": {
    keywords: ["麻木", "没感觉", "无感", "机械", "行尸走肉", "空", "没情绪", "冷漠", "无所谓了", "不在乎", "无所谓"],
    display_name: "麻木",
    display_emoji: "🫥",
  },
  "崩溃": {
    keywords: ["崩溃", "撑不住", "受不了", "极限", "倒下", "撑不下去了", "大哭", "爆发", "塌", "坏掉", "完蛋", "崩了"],
    display_name: "快要崩溃",
    display_emoji: "💥",
  },
  "暗恋": {
    keywords: ["暗恋", "偷偷喜欢", "默默", "不敢说", "单恋", "一个人在", "远远", "看着他", "看着她", "不敢表白"],
    display_name: "暗恋",
    display_emoji: "💌",
  },

  // ── Stress / Pressure ──
  "疲惫": {
    keywords: ["累", "疲惫", "疲倦", "累了", "没力气", "筋疲力尽", "透支", "很累", "太累", "好累", "没劲", "提不起劲", "乏", "没精神"],
    display_name: "疲惫",
    display_emoji: "😮‍💨",
  },
  "焦虑": {
    keywords: ["焦虑", "紧张", "不安", "担心", "害怕", "慌", "压力", "睡不着", "失眠", "烦躁", "静不下来", "心慌", "焦躁", "急", "着急"],
    display_name: "焦虑",
    display_emoji: "😰",
  },
  "迷茫": {
    keywords: ["迷茫", "不知道", "找不到方向", "迷失", "方向", "不知道怎么办", "困惑", "不知道去哪", "没有目标", "没有方向", "不知道该", "不知道该做什么"],
    display_name: "迷茫",
    display_emoji: "🌫️",
  },
  "想逃离": {
    keywords: ["逃走", "离开", "想走", "不想待着", "逃避", "躲", "想去远方", "不想面对", "出走", "离开这里", "换个地方", "想逃"],
    display_name: "想逃离",
    display_emoji: "🏃",
  },
  "压抑": {
    keywords: ["压抑", "难受", "透不过气", "闷", "憋", "喘不过气", "被压", "沉重", "闷闷不乐", "胸口闷", "憋得慌"],
    display_name: "压抑",
    display_emoji: "🌧️",
  },
  "自卑": {
    keywords: ["自卑", "不自信", "不如别人", "自己不好", "不够好", "配不上", "丑", "嫌弃自己", "看不上自己", "差劲"],
    display_name: "自卑",
    display_emoji: "🥀",
  },
  "委屈": {
    keywords: ["委屈", "不公平", "冤枉", "被误会", "没人看到", "不被理解", "心酸", "说不出来", "憋屈", "委屈巴巴"],
    display_name: "委屈",
    display_emoji: "🥺",
  },

  // ── Anger / Frustration ──
  "愤怒": {
    keywords: ["愤怒", "生气", "火大", "冒火", "暴怒", "怒", "恼火", "蹭", "火冒三丈", "气炸", "忍不住"],
    display_name: "愤怒",
    display_emoji: "🤬",
  },
  "生气": {
    keywords: ["生气", "气", "不爽", "不高兴", "恼怒", "不高兴了", "恼了", "来气", "气人", "可气"],
    display_name: "生气",
    display_emoji: "😤",
  },
  "不甘心": {
    keywords: ["不甘心", "不服", "凭什么", "不公平", "努力没有", "没有回报", "白费", "不认输", "不想认", "凭什么是我", "意难平"],
    display_name: "不甘心",
    display_emoji: "💢",
  },
  "嫉妒": {
    keywords: ["嫉妒", "羡慕", "眼红", "酸", "凭什么他有", "吃醋", "比较", "对比", "别人有", "看不惯"],
    display_name: "嫉妒",
    display_emoji: "🐍",
  },
  "清醒": {
    keywords: ["清醒", "看透", "明白", "懂了", "不再被骗", "看清", "觉醒", "恍然", "终于明白", "恍然大悟"],
    display_name: "突然清醒",
    display_emoji: "💡",
  },
};

/**
 * Mood adjacency — similar/related moods that can substitute for each other.
 * Used to give bonus scores when a song matches an adjacent mood.
 */
export const MOOD_ADJACENCY: Record<string, string[]> = {
  "开心": ["轻松", "浪漫", "温暖", "自由"],
  "轻松": ["开心", "释怀", "温暖", "治愈"],
  "治愈": ["温暖", "轻松", "释怀", "成长"],
  "温暖": ["治愈", "感恩", "轻松", "浪漫"],
  "释怀": ["清醒", "成长", "轻松", "治愈"],
  "成长": ["释怀", "清醒", "勇气", "治愈"],
  "自由": ["开心", "想逃离", "释怀", "勇气"],
  "勇气": ["自由", "成长", "不甘心", "清醒"],
  "浪漫": ["开心", "温暖", "暧昧", "治愈"],
  "暧昧": ["浪漫", "暗恋", "遗憾", "孤独"],

  "失恋": ["放不下", "遗憾", "怀念", "孤独", "委屈"],
  "放不下": ["失恋", "遗憾", "怀念", "孤独"],
  "遗憾": ["放不下", "怀念", "失恋", "后悔"],
  "怀念": ["遗憾", "放不下", "孤独", "温暖"],
  "孤独": ["怀念", "放不下", "麻木", "想逃离", "自卑"],
  "麻木": ["孤独", "疲惫", "崩溃", "释怀"],
  "崩溃": ["麻木", "疲惫", "压抑", "愤怒"],
  "暗恋": ["暧昧", "遗憾", "孤独", "自卑"],

  "疲惫": ["焦虑", "迷茫", "压抑", "麻木", "想逃离"],
  "焦虑": ["疲惫", "迷茫", "压抑", "崩溃"],
  "迷茫": ["疲惫", "焦虑", "想逃离", "孤独"],
  "想逃离": ["迷茫", "自由", "疲惫", "压抑"],
  "压抑": ["疲惫", "焦虑", "崩溃", "愤怒", "委屈"],
  "自卑": ["孤独", "压抑", "委屈", "遗憾"],
  "委屈": ["压抑", "自卑", "不甘心", "愤怒"],

  "愤怒": ["生气", "不甘心", "压抑", "崩溃"],
  "生气": ["愤怒", "不甘心", "委屈"],
  "不甘心": ["愤怒", "生气", "嫉妒", "勇气"],
  "嫉妒": ["不甘心", "自卑", "生气", "委屈"],
  "清醒": ["释怀", "成长", "勇气", "愤怒"],
};

/**
 * Mood conflicts — antithetical moods. Songs matching a conflict mood get a heavy penalty.
 */
export const MOOD_CONFLICT: Record<string, string[]> = {
  "开心": ["失恋", "压抑", "焦虑", "崩溃", "遗憾", "愤怒", "悲伤"],
  "轻松": ["焦虑", "崩溃", "压抑", "愤怒", "疲惫"],
  "治愈": ["崩溃", "愤怒", "绝望"],
  "温暖": ["失恋", "崩溃", "麻木"],
  "释怀": ["愤怒", "不甘心", "嫉妒"],
  "自由": ["压抑", "自卑", "崩溃"],

  "失恋": ["开心", "轻松", "浪漫"],
  "遗憾": ["开心", "轻松"],
  "崩溃": ["开心", "轻松", "治愈", "浪漫"],
  "愤怒": ["轻松", "释怀", "治愈", "浪漫"],
  "焦虑": ["轻松", "释怀"],
  "压抑": ["开心", "自由", "轻松"],
  "麻木": ["浪漫", "开心", "暧昧"],
};

// ── Legacy template exports (used as fallback; primary source is song data) ──

export const dosage_templates: string[] = [];
export const follow_up_templates: string[] = [];
export const emotion_analysis_templates: string[] = [
  "陈医生听到的，是{moods}。{mood_desc}，没关系，我们一个一个来。",
  "从你的描述里，陈医生听出了{moods}。今晚先把其他的放一放，我们先处理这个。",
  "你的症状陈医生收到了——{moods}。不是大病，但值得开一首好歌。",
  "听诊结果：{moods}。这不是诊断，只是陈医生试着听懂你。",
  "陈医生听到的是{count}种情绪：{moods}。它们都值得被认真对待。",
  "从那只言片语里，陈医生捕捉到{moods}的影子。这些情绪不丢人，它们只是需要一首歌的时间。",
];

export const listening_scene_templates: string[] = [];
export const daily_task_templates: string[] = [];
export const avoid_templates: string[] = [];

export const small_note_templates: string[] = [
  "本处方不提供医学诊断，只负责把此刻的心情交给一首歌照看。",
  "本门诊不治病，只负责在你需要的时候放一首对的歌。",
  "处方有效期：一首歌的时间。明天如果还需要，记得回来复诊。",
  "本处方不做诊断、不开药、不解决人生难题。它只是一首歌，和一点点陪伴。",
  "如果听完觉得还不够，欢迎随时回来。陈医生的诊室永远开着门。",
];
