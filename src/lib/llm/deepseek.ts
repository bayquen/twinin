import "server-only";

export class LlmError extends Error {}

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function deepseekJson(messages: ChatMessage[]): Promise<string> {
    const key = process.env.DEEPSEEK_API_KEY;
    if (!key) throw new Error("Missing Deepseek API key");

    const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
            model: process.env.DEEPSEEK_MODEL ?? "deepseek-flash",
            messages,
            response_format: { type: "json_object" },
            max_tokens: 800,
            temperature: 0.3,  // low temp for consistent, on-task picks. (SkiPped if thinking mode on)
            // stream: false,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(30_000),
    });
    // side note: Never include response body or the LLM prompt in errors/logs.
    if (!res.ok) throw new LlmError(`DeepSeek HTTP ${res.status}`);

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content ?? "";
        // Documented quirk: when output isn't valid JSON, DeepSeek can return 
        // only spaces with finish_reason "stop".
        if (!content.trim()) throw new LlmError("DeepSeek return blank content.");
        return content;
}