import OpenAI from 'openai';

const getOpenAIClient = (): OpenAI => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required for AI functionality.');
  }

  return new OpenAI({ apiKey });
};

export interface AIResult {
  summary: string;
  action_items: string[];
  suggested_title: string;
  tokensUsed: number;
}

const stripHTML = (html: string): string =>
  html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export const generateAIContent = async (title: string, content: string): Promise<AIResult> => {
  const plainText = stripHTML(content);

  const prompt = `You are a productivity assistant. Analyze this note and respond ONLY with valid JSON.

Note Title: "${title}"
Note Content:
${plainText.slice(0, 4000)}

Respond with exactly this JSON structure:
{
  "summary": "2-3 sentence summary of the note",
  "action_items": ["action item 1", "action item 2"],
  "suggested_title": "a concise, descriptive title"
}`;

  const openai = getOpenAIClient();

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 500,
    response_format: { type: 'json_object' },
  });

  const raw = response.choices[0].message.content || '{}';
  const parsed = JSON.parse(raw);

  return {
    summary: parsed.summary || 'No summary generated.',
    action_items: Array.isArray(parsed.action_items) ? parsed.action_items : [],
    suggested_title: parsed.suggested_title || title,
    tokensUsed: response.usage?.total_tokens || 0,
  };
};
