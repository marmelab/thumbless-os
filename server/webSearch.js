import OpenAI from "openai";
const client = new OpenAI();

export async function handleWebSearch(query) {
  try {
    const response = await client.responses.create({
        model: "gpt-4.1",
        tools: [ { type: "web_search_preview" } ],
        tool_choice: { type: "web_search_preview" },
        input: query,
    });
    return response.output_text;
  } catch (error) {
    console.error("Error during search and conversion:", error);
    throw error;
  }
}
