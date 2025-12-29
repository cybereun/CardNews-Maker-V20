import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_PROMPT } from "../constants";
import { CardData, YoutubeMetadata } from "../types";
import { getApiKey } from "../utils/storage";

const getClient = () => {
  // First try to get from local storage (user setting)
  const storedKey = getApiKey();
  // Fallback to process.env if available (dev mode)
  const apiKey = storedKey || process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API Key가 설정되지 않았습니다. 설정 버튼을 눌러 API Key를 입력해주세요.");
  }
  return new GoogleGenAI({ apiKey });
};

// New function to test the connection
export const testConnection = async (apiKey: string): Promise<boolean> => {
  try {
    const ai = new GoogleGenAI({ apiKey });
    // Make a very cheap/fast call to verify the key
    await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Hello",
    });
    return true;
  } catch (error) {
    console.error("Connection test failed:", error);
    return false;
  }
};

export const generateCardContent = async (topic: string): Promise<CardData | null> => {
  try {
    const ai = getClient();
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `주제: ${topic}`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            emoji: { type: Type.STRING },
            title: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  problem: { type: Type.STRING },
                  solution: { type: Type.STRING }
                },
                required: ["problem", "solution"]
              }
            },
            footer: { type: Type.STRING }
          },
          required: ["emoji", "title", "items", "footer"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return null;
    
    return JSON.parse(jsonText) as CardData;

  } catch (error) {
    console.error("Error generating content:", error);
    alert(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.");
    return null;
  }
};

export const recommendTopic = async (): Promise<string> => {
  try {
    const ai = getClient();
    
    // We want a catchy, save-worthy topic
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "사람들이 '저장'하고 싶어할 만한 유용한 카드뉴스 주제를 하나만 추천해줘. 예를 들어 '자취생 필수템', '엑셀 단축키', '다이어트 식단' 등. 주제명만 딱 출력해.",
    });

    return response.text?.trim() || "직장인 엑셀 단축키 모음";
  } catch (error) {
    console.error("Error recommending topic:", error);
    alert(error instanceof Error ? error.message : "API 키를 확인해주세요.");
    return "겨울철 난방비 절약 꿀팁"; // Fallback
  }
};

export const generateYoutubeMetadata = async (cardData: CardData): Promise<YoutubeMetadata | null> => {
  try {
    const ai = getClient();
    
    // Remove formatting symbols for cleaner context
    const cleanTitle = cardData.title.replace(/[\*\{\}\[\]]/g, '');
    const contentSummary = cardData.items.map(i => `${i.problem} -> ${i.solution}`).join('\n');

    const prompt = `
      너는 유튜브 쇼츠(Shorts) 알고리즘 전문가야. 
      아래 카드뉴스 내용을 바탕으로 조회수가 폭발할 수 있는 쇼츠 업로드용 텍스트를 작성해줘.

      [카드뉴스 정보]
      - 제목: ${cleanTitle}
      - 주요 내용:
      ${contentSummary}

      [요구사항]
      1. 제목 (Title):
         - 시선을 확 끄는 '후킹' 멘트 필수.
         - 검색 노출을 위한 SEO 키워드 포함.
         - 이모지 적절히 사용.
         - 50자 이내.
      2. 설명 (Description):
         - 시청자가 "더보기"를 누르고 싶게 만드는 2~3줄 요약.
         - 구독과 좋아요를 자연스럽게 유도.
      3. 해시태그 (Hashtags):
         - 관련성 높고 조회수 많은 태그 10개 내외.
         - #쇼츠 #shorts #꿀팁 같은 대형 태그 포함.

      JSON 포맷으로 출력해:
      {
        "title": "제목 내용",
        "description": "설명 내용",
        "hashtags": ["#태그1", "#태그2"]
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "description", "hashtags"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return null;

    return JSON.parse(jsonText) as YoutubeMetadata;

  } catch (error) {
    console.error("Error generating youtube metadata:", error);
    alert(error instanceof Error ? error.message : "API 키를 확인해주세요.");
    return null;
  }
};