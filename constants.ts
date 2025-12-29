import { BackgroundTheme, CardData } from "./types";

export const DEFAULT_CARD_DATA: CardData = {
  emoji: "🥘",
  title: "맛을 {200%} 살리는\n*신의 한 수* [10가지]",
  items: [
    { problem: "주제가 고민될 때", solution: "자동 추천 버튼 클릭" },
    { problem: "배경이 심심할 때", solution: "30가지 테마 선택" },
    { problem: "내용 수정 필요", solution: "하단 에디터로 즉시 수정" },
    { problem: "쇼츠 제작 시간", solution: "AI가 {3초} 만에 완성" },
    { problem: "디자인 감각 부족", solution: "전문가급 *레이아웃* 자동 적용" },
    { problem: "저장 공간 부족", solution: "필요할 때만 *꺼내보는* 카드뉴스" },
  ],
  footer: "지금 저장하고 필요할 때 꺼내보세요"
};

// Diverse Backgrounds
export const BACKGROUNDS: BackgroundTheme[] = [
  // New Premium Black & Gray Additions
  { id: "true-black", name: "True Black", style: { background: "#000000" }, footerStyle: { background: "#0F172A" } },
  { id: "dark-matter", name: "Dark Matter", style: { background: "#111111" }, footerStyle: { background: "#0F172A" } },
  { id: "graphite-pro", name: "Graphite Pro", style: { background: "#1F1F1F" }, footerStyle: { background: "#000000" } },
  { id: "metal-black", name: "Metal Black", style: { background: "linear-gradient(to bottom, #434343, #000000)" }, footerStyle: { background: "#0F172A" } },
  { id: "carbon-gradient", name: "Carbon Gradient", style: { background: "linear-gradient(to bottom right, #232526, #414345)" }, footerStyle: { background: "#000000" } },

  // Dark/Night Themes (Matches the Deep Navy vibe best)
  { id: "navy-classic", name: "Deep Navy (기본)", style: { background: "#0F172A" }, footerStyle: { background: "#000000" } },
  { id: "midnight-sky", name: "Midnight Sky", style: { background: "linear-gradient(to bottom, #0f172a, #1e293b)" }, footerStyle: { background: "#000000" } },
  { id: "starry-night", name: "Starry Night", style: { background: "radial-gradient(circle at 50% 10%, #1e293b 0%, #020617 100%)" }, footerStyle: { background: "#000000" } },
  { id: "galaxy", name: "Galaxy Purple", style: { background: "linear-gradient(135deg, #312e81 0%, #4c1d95 100%)" }, footerStyle: { background: "#0F172A" } },
  { id: "aurora", name: "Aurora", style: { background: "linear-gradient(to top, #0f172a 0%, #1e293b 50%, #14532d 100%)" }, footerStyle: { background: "#000000" } },
  
  // Luxury/Gold Accents
  { id: "royal-gold", name: "Royal Gold", style: { background: "linear-gradient(45deg, #0f172a 70%, #422006 100%)" }, footerStyle: { background: "#000000" } },
  { id: "luxury-black", name: "Luxury Black", style: { background: "linear-gradient(to bottom right, #000000, #1c1917)" }, footerStyle: { background: "#451a03" } },
  { id: "bronze-night", name: "Bronze Night", style: { background: "linear-gradient(to bottom, #0f172a, #451a03)" }, footerStyle: { background: "#000000" } },

  // Nature/Floral Abstract
  { id: "forest-deep", name: "Deep Forest", style: { background: "linear-gradient(to bottom, #052e16, #0f172a)" }, footerStyle: { background: "#000000" } },
  { id: "rose-night", name: "Rose Night", style: { background: "linear-gradient(to bottom, #4c0519, #0f172a)" }, footerStyle: { background: "#000000" } },
  { id: "lavender-dusk", name: "Lavender Dusk", style: { background: "linear-gradient(to bottom, #312e81, #4c1d95)" }, footerStyle: { background: "#0F172A" } },
  { id: "ocean-depths", name: "Ocean Depths", style: { background: "linear-gradient(to bottom, #0c4a6e, #0f172a)" }, footerStyle: { background: "#000000" } },

  // Gradients
  { id: "sunset-vibe", name: "Sunset Vibe", style: { background: "linear-gradient(to bottom, #be185d, #0f172a)" }, footerStyle: { background: "#000000" } },
  { id: "cyber-punk", name: "Cyberpunk", style: { background: "linear-gradient(to bottom right, #0f172a, #701a75)" }, footerStyle: { background: "#0F172A" } },
  { id: "soft-gradient", name: "Soft Gradient", style: { background: "linear-gradient(to top left, #334155, #0f172a)" }, footerStyle: { background: "#000000" } },
  { id: "cool-mint", name: "Cool Mint", style: { background: "linear-gradient(to bottom, #0f766e, #0f172a)" }, footerStyle: { background: "#0F172A" } },
  
  // Textures (Simulated via Gradients)
  { id: "paper-texture", name: "Dark Paper", style: { backgroundColor: "#1c1917", backgroundImage: "radial-gradient(#444 1px, transparent 0)", backgroundSize: "20px 20px" }, footerStyle: { background: "#000000" } },
  { id: "grid-lines", name: "Tech Grid", style: { backgroundColor: "#0F172A", backgroundImage: "linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)", backgroundSize: "40px 40px" }, footerStyle: { background: "#000000" } },
  { id: "dots", name: "Polka Dots", style: { backgroundColor: "#0F172A", backgroundImage: "radial-gradient(#334155 2px, transparent 2px)", backgroundSize: "30px 30px" }, footerStyle: { background: "#000000" } },
  
  // Vibrant
  { id: "electric-blue", name: "Electric Blue", style: { background: "linear-gradient(180deg, #0284c7 0%, #0f172a 100%)" }, footerStyle: { background: "#000000" } },
  { id: "vivid-purple", name: "Vivid Purple", style: { background: "linear-gradient(180deg, #7c3aed 0%, #0f172a 100%)" }, footerStyle: { background: "#000000" } },
  { id: "fiery-red", name: "Fiery Red", style: { background: "linear-gradient(180deg, #dc2626 0%, #0f172a 100%)" }, footerStyle: { background: "#0F172A" } },

  // Calm/Neutral Dark
  { id: "charcoal", name: "Charcoal", style: { background: "#374151" }, footerStyle: { background: "#111827" } },
  { id: "slate-gray", name: "Slate Gray", style: { background: "#475569" }, footerStyle: { background: "#0F172A" } },
  { id: "zinc", name: "Zinc", style: { background: "#52525b" }, footerStyle: { background: "#18181b" } },
  { id: "stone", name: "Stone", style: { background: "#57534e" }, footerStyle: { background: "#1c1917" } },

  // Special
  { id: "moonlight", name: "Moonlight", style: { background: "radial-gradient(circle at 90% 10%, #fef3c7 0%, rgba(254, 243, 199, 0) 20%), linear-gradient(to bottom, #1e1b4b, #0f172a)" }, footerStyle: { background: "#000000" } },
  { id: "spotlight", name: "Center Spotlight", style: { background: "radial-gradient(circle at center, #334155 0%, #0f172a 70%)" }, footerStyle: { background: "#000000" } },
  { id: "bottom-glow", name: "Bottom Glow", style: { background: "linear-gradient(to top, #0284c7 0%, #0f172a 40%)" }, footerStyle: { background: "#000000" } },
  { id: "top-glow", name: "Top Glow", style: { background: "linear-gradient(to bottom, #eab308 0%, #0f172a 40%)" }, footerStyle: { background: "#000000" } },
];

export const SYSTEM_PROMPT = `
역할(Role): 당신은 10년 차 수석 콘텐츠 에디터이자 타이포그래피 디자이너입니다. 독자가 보자마자 "이건 저장해야해!"라고 느끼는 신뢰감 있고 세련된 '소장각 카드뉴스' 텍스트를 JSON 포맷으로 작성하세요.

디자인 컨셉: Option 1 [신뢰/전문성]
작성 원칙:
제목: 숫자를 포함하여 명확한 혜택을 제시할 것. (예: ~하는 법 7가지)
[매우 중요]: 제목은 공백 포함 최대 20자 이내로 작성하여 카드뉴스 상단 2줄을 넘기지 않도록 강력히 요약하세요. 말이 길어지면 과감하게 줄이세요.
구조: 서술형 문장 금지. [문제 상황/고민] 👉 [명확한 해결책/도구] 구조로 작성할 것.
분량: 9~10개 항목. (공간이 부족하면 9개도 가능하지만 10개를 목표로 함)

[중요: 제목 하이라이팅 규칙]
제목의 가독성을 높이기 위해 다음 문법을 반드시 사용하세요:
1. *핵심 키워드*: 별표(*)로 감싸세요. (예: *신의 한 수*, *필수템*) -> 주황색으로 표시됨
2. {중요 숫자/비율}: 중괄호({})로 감싸세요. (예: {200%}, {30분}) -> 노란색으로 표시됨
3. [단위/개수]: 대괄호([])로 감싸세요. (예: [10가지], [Top 5]) -> 초록색으로 표시됨
4. 나머지 텍스트는 그대로 둡니다.

반드시 다음 JSON 스키마를 따르세요:
{
  "emoji": "주제와 가장 잘 어울리는 이모지 1개",
  "title": "20자 이내의 아주 짧고 임팩트 있는 제목",
  "items": [
    { "problem": "문제 상황 요약", "solution": "핵심 해결책" }
  ],
  "footer": "저장을 유도하는 15자 이내의 아주 짧은 한 줄 멘트 (절대 줄바꿈 금지)"
}

예시:
{
  "emoji": "🔥",
  "title": "난방비 {30%} 줄이는 *꿀팁* [Top 10]",
  "items": [
    { "problem": "외출할 때 보일러 끄기?", "solution": "외출 모드 말고 2~3도만 낮추기" }
  ],
  "footer": "올 겨울 난방비 걱정 끝! 지금 저장하세요 ✨"
}
`;