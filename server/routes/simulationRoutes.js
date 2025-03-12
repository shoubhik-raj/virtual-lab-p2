// Add this route for AI chat with code context
app.post("/api/simulations/chat", authenticateJWT, async (req, res) => {
  try {
    const { message, code, history } = req.body;

    // Get user with their settings
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get preferred LLM from user settings
    const preferredLLM = user.settings?.preferredLLM || "deepseek";

    // Format chat history for the AI
    const formattedHistory = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Add system message and the current message
    const messages = [
      {
        role: "system",
        content:
          "You are an AI assistant helping to build an educational simulation using HTML, CSS, and JavaScript. You can modify code based on user requests. When the user asks for changes, provide the updated code in full.",
      },
      ...formattedHistory,
      { role: "user", content: message },
    ];

    let aiResponse;
    let updatedCode = null;

    if (preferredLLM === "openai") {
      // Use OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
      });

      aiResponse = completion.choices[0].message.content;
    } else {
      // Use Deepseek
      const completion = await deepseek.chat.completions.create({
        model: "deepseek-coder",
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
      });

      aiResponse = completion.choices[0].message.content;
    }

    // Check if the response contains code updates
    // This is a simple approach - in production, you'd want more robust extraction
    if (
      aiResponse.includes("```html") ||
      aiResponse.includes("```javascript") ||
      aiResponse.includes("```css")
    ) {
      const codeMatch = aiResponse.match(
        /```(?:html|javascript|css)([\s\S]*?)```/
      );
      if (codeMatch && codeMatch[1]) {
        updatedCode = codeMatch[1].trim();

        // If the AI provided full code replacement, use it
        if (
          updatedCode.includes("<html") ||
          updatedCode.includes("<!DOCTYPE")
        ) {
          // It's a complete HTML document
        } else {
          // It might be a partial update, so we'd need more sophisticated merging
          // For now, we'll just use what the AI provided
        }
      }
    }

    res.json({
      response: aiResponse,
      updatedCode: updatedCode,
    });
  } catch (error) {
    console.error("AI chat error:", error);
    res.status(500).json({ message: "Failed to process chat message" });
  }
});
