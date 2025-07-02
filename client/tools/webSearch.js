export async function handleWebSearch(
  query,
  call_id,
  sendClientEvent,
) {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/web-search?q=${encodeURIComponent(
        query,
      )}`,
    );

    const { result } = await response.json();

    sendClientEvent({
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id,
        output: `I found some information related to your query: "${query}". Please use this information to create visual content on the whiteboard. Here is the result:\n\n${result}`,
      },
    });

    sendClientEvent({ type: "response.create" });
  } catch (error) {
    console.error("Error during search and conversion:", error);
    throw error;
  }
}
