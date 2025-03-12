// Simulation routes
app.get("/api/simulations", authenticateJWT, async (req, res) => {
    try {
      const simulations = await Simulation.find({ userId: req.user.id }).sort({
        createdAt: -1,
      });
      res.json(simulations);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post(
    "/api/simulations/generate-prompt",
    authenticateJWT,
    async (req, res) => {
      try {
        const {
          name,
          subject,
          department,
          topic,
          details,
          complexity,
          interactivity,
        } = req.body;
  
        // Generate AI prompt
        const promptTemplate = `
  Create an interactive HTML simulation for ${subject} (${department}) on the topic of "${topic}".
  
  Simulation Name: ${name}
  
  Details:
  ${details}
  
  Technical Requirements:
  - Complexity Level: ${complexity}
  - Interactivity Level: ${interactivity}
  - The simulation should be a single HTML file with embedded JavaScript and CSS
  - Use modern JavaScript (ES6+) and CSS3
  - Ensure the simulation is responsive and works on different screen sizes
  - Include clear instructions for users
  - Add appropriate visualizations, controls, and feedback mechanisms
  - Implement proper physics/mathematical models where applicable
  - Include appropriate error handling
  
  The code should be well-commented and organized for educational purposes.
  `;
  
        // Log the prompt
        const aiPrompt = new AIPrompt({
          userId: req.user.id,
          prompt: promptTemplate,
          type: "simulation",
        });
  
        await aiPrompt.save();
  
        res.json({ prompt: promptTemplate });
      } catch (error) {
        console.error("Prompt generation error:", error);
        res.status(500).json({ message: "Failed to generate prompt" });
      }
    }
  );
  
  app.post(
    "/api/simulations/generate-code",
    authenticateJWT,
    async (req, res) => {
      try {
        const { prompt } = req.body;
  
        // Get user with their settings
        const user = await User.findById(req.user.id);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
  
        // Get preferred LLM from user settings (default to deepseek)
        const preferredLLM = user.settings?.preferredLLM || "deepseek";
  
        let generatedCode;
  
        if (preferredLLM === "openai") {
          // Use OpenAI
          if (!process.env.OPENAI_API_KEY) {
            return res
              .status(500)
              .json({ message: "OpenAI API key not configured" });
          }
  
          const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content:
                  "You are an expert in creating educational simulations using HTML, CSS, and JavaScript. Your task is to generate complete, working code for interactive simulations that can be used in virtual labs.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 4000,
          });
  
          generatedCode = completion.choices[0].message.content;
        } else {
          // Use Deepseek
          if (!process.env.DEEPSEEK_API_KEY) {
            return res
              .status(500)
              .json({ message: "Deepseek API key not configured" });
          }
  
          const completion = await deepseek.chat.completions.create({
            model: "deepseek-coder",
            messages: [
              {
                role: "system",
                content:
                  "You are an expert in creating educational simulations using HTML, CSS, and JavaScript. Your task is to generate complete, working code for interactive simulations that can be used in virtual labs.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 4000,
          });
  
          generatedCode = completion.choices[0].message.content;
        }
  
        // Log the response
        const aiPrompt = new AIPrompt({
          userId: req.user.id,
          prompt,
          response: generatedCode,
          type: "simulation",
          model: preferredLLM,
        });
  
        await aiPrompt.save();
  
        res.json({ code: generatedCode });
      } catch (error) {
        console.error("Code generation error:", error);
        res.status(500).json({ message: "Failed to generate code" });
      }
    }
  );