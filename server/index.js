import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import multer from "multer";
import { Octokit } from "octokit";
import { OpenAI } from "openai";
import cloudinary from "cloudinary";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import axios from "axios";

// Get the current file's directory (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(cookieParser());

// Create the uploads directory if it doesn't exist
const labsUploadsDir = path.join(__dirname, "uploads", "labs", "thumbnails");
const experimentsUploadsDir = path.join(
  __dirname,
  "uploads",
  "experiments",
  "thumbnails"
);

if (!fs.existsSync(labsUploadsDir)) {
  fs.mkdirSync(labsUploadsDir, { recursive: true });
}

if (!fs.existsSync(experimentsUploadsDir)) {
  fs.mkdirSync(experimentsUploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine the destination based on the route
    if (req.originalUrl.includes("/experiments")) {
      cb(null, experimentsUploadsDir);
    } else {
      cb(null, labsUploadsDir);
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Use a unique filename
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for files
  },
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/virtual-labs")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Import models
import User from "./models/User.js";
import Lab from "./models/Lab.js";
import Simulation from "./models/Simulation.js";
import AIPrompt from "./models/AIPrompt.js";
import Institution from "./models/Institution.js";
import Experiment from "./models/Experiment.js";

// Configure Passport.js
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "/api/auth/github/callback",
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Fetch the user's email from GitHub
        const email = profile.emails?.[0]?.value; // Get the first email

        let user = await User.findOne({ githubId: profile.id });

        if (!user) {
          if (!email) {
            return done(new Error("Email is required for new users."));
          }

          user = new User({
            githubId: profile.id,
            name: profile.displayName || profile.username,
            email: email, // Save the email
            avatar: profile.photos?.[0]?.value,
            githubUsername: profile.username,
            githubAccessToken: accessToken,
          });
          await user.save();
        } else {
          // Update access token and email if it has changed
          user.githubAccessToken = accessToken;
          if (user.email !== email) {
            user.email = email; // Update email if it has changed
            await user.save();
          }
        }

        console.log("GitHub Profile Data:", profile);

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Initialize Passport
app.use(passport.initialize());

// JWT middleware with improved error handling
const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    console.log("No token found in cookies");
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    req.user = user;
    next();
  } catch (error) {
    console.error("JWT verification error:", error.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Deepseek with OpenAI SDK
const deepseek = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Auth routes
app.get(
  "/api/auth/github",
  passport.authenticate("github", { scope: ["user:email", "repo"] })
);

app.get(
  "/api/auth/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: "/login",
  }),
  async (req, res) => {
    const token = jwt.sign(
      { id: req.user._id, name: req.user.name, email: req.user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // Update cookie settings for better cross-domain compatibility in production
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Secure cookie in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Allow cross-site cookie in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/", // Ensure cookie is available across the entire site
    });

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/onboarding`);
    }

    // Check if user has completed onboarding
    if (!user.isOnboarded) {
      return res.redirect(`${process.env.CLIENT_URL}/onboarding`);
    }

    // Log authentication success for debugging
    console.log("Authentication successful for user:", user.name);

    // Redirect to dashboard if user exists and is onboarded
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
);

app.get("/api/auth/status", authenticateJWT, async (req, res) => {
  try {
    console.log("Auth status check for user ID:", req.user.id);

    const user = await User.findById(req.user.id).select("-githubAccessToken");
    if (!user) {
      console.log("User not found in database:", req.user.id);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Auth status successful for user:", user.name);
    res.json({
      user,
      isAuthenticated: true,
      tokenPresent: !!req.cookies.token,
    });
  } catch (error) {
    console.error("Auth status error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
});

// Lab routes
app.get("/api/labs", authenticateJWT, async (req, res) => {
  try {
    const labs = await Lab.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(labs);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post(
  "/api/labs",
  authenticateJWT,
  upload.single("thumbnail"),
  async (req, res) => {
    try {
      const {
        name,
        description,
        discipline,
        targetAudience,
        courseAlignment,
        institution,
      } = req.body;

      // Handle thumbnail upload
      let thumbnailUrl = null;
      if (req.file) {
        thumbnailUrl = `/uploads/labs/thumbnails/${req.file.filename}`;
      }

      // Create the lab
      const lab = new Lab({
        userId: req.user.id,
        name,
        description,
        discipline,
        targetAudience,
        courseAlignment,
        institution,
        thumbnail: thumbnailUrl,
      });

      await lab.save();
      res.status(201).json({ success: true, data: lab });
    } catch (error) {
      console.error("Lab creation error:", error);
      if (!res.headersSent) {
        res
          .status(500)
          .json({ success: false, message: "Failed to create lab" });
      }
    }
  }
);

// Experiment routes
app.get("/api/labs/:labId/experiments", authenticateJWT, async (req, res) => {
  try {
    const { labId } = req.params;

    // Verify lab belongs to user
    const lab = await Lab.findOne({ _id: labId, userId: req.user.id });
    if (!lab) {
      return res.status(404).json({ message: "Lab not found" });
    }

    const experiments = await Experiment.find({ labId }).sort({
      createdAt: -1,
    });
    res.json(experiments);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post(
  "/api/experiments",
  authenticateJWT,
  upload.single("thumbnail"),
  async (req, res) => {
    console.log("GOT RE");
    try {
      const {
        name,
        institution,
        aim,
        theory,
        pretest,
        procedure,
        simulation,
        posttest,
        references,
        contributors,
        faqs,
      } = req.body;
      console.log(req.body);

      console.log("saving FILE", institution);
      // Handle thumbnail upload
      let thumbnailUrl = null;
      if (req.file) {
        thumbnailUrl = `/uploads/experiments/thumbnails/${req.file.filename}`;
      }

      console.log("SAVED FILE");
      console.log("PATH : ", thumbnailUrl);
      console.log("FILE : ", req.file);

      const newExperiment = new Experiment({
        userId: req.user.id,
        name,
        institution,
        labId: req.body.labId,
        aim,
        theory,
        pretest,
        procedure,
        simulation,
        posttest,
        references,
        contributors,
        faqs: Array.isArray(faqs) ? faqs : JSON.parse(faqs), // Parse FAQs if sent as a JSON string
        thumbnail: thumbnailUrl,
      });

      console.log("SAVINGGG");

      await newExperiment.save();
      res.status(201).json(newExperiment);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to create experiment", error: error });
    }
  }
);

// Simulation routes
app.get("/api/simulations", authenticateJWT, async (req, res) => {
  try {
    const simulations = await Simulation.find({
      userId: req.user.id,
      experimentId: req.body.experimentId,
    }).sort({
      createdAt: -1,
    });
    res.json(simulations);
  } catch (error) {
    console.error("Error fetching simulations:", error);
    res.status(500).json({ message: "Failed to fetch simulations" });
  }
});

app.get(
  "/api/simulations/by-experiment/:experimentId",
  authenticateJWT,
  async (req, res) => {
    try {
      const { experimentId } = req.params;

      console.log("Fetching simulations for experiment ID:", experimentId);

      if (!experimentId) {
        return res.status(400).json({ message: "Experiment ID is required" });
      }

      const simulations = await Simulation.find({
        userId: req.user.id,
        experimentId: experimentId,
      }).sort({ createdAt: -1 });

      console.log(
        `Found ${simulations.length} simulations for experiment ${experimentId}`
      );

      res.json(simulations);
    } catch (error) {
      console.error("Error fetching simulations by experiment:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch simulations for this experiment" });
    }
  }
);

app.post(
  "/api/simulations/generate-prompt",
  authenticateJWT,
  async (req, res) => {
    try {
      const {
        name,
        subject,
        course,
        department,
        description,
        complexity,
        interactivity,
        experimentId,
      } = req.body;

      console.log("GOTTTA : ", experimentId);

      // Generate AI prompt
      const promptTemplate = `
Create an detailed step by step prompt for an interactive HTML, CSS and JavaScript simulation for ${subject}, for the students of ${course} from ${department} department, on the topic of "${name}".

Simulation Name: ${name}

Details:
${description}

keep in mind that you are writing this prompt for students who wants to learn about this topic.

Technical Requirements:
- Complexity Level: ${complexity}
- Interactivity Level: ${interactivity}

`;
      // Get user with their settings
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get preferred LLM from user settings (default to deepseek)
      const preferredLLM = user.settings?.preferredLLM || "deepseek";

      let generatedPrompt;

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
                "You are an expert in writing prompts for creating educational simulations using HTML, CSS, and JavaScript. Your task is to generate complete step by step detailed simulation building prompt for AI to create interactive simulations that can be used in virtual labs. Return only the prompt, no additional text or code",
            },
            { role: "user", content: promptTemplate },
          ],
          temperature: 0.5,
          max_tokens: 5000,
        });

        generatedPrompt = completion.choices[0].message.content;
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
                "You are an expert in writing prompts for creating educational simulations using HTML, CSS, and JavaScript. Your task is to generate complete step by step detailed simulation building prompt for AI to create interactive simulations that can be used in virtual labs. Return only the prompt, no additional text or code",
            },
            { role: "user", content: promptTemplate },
          ],
          temperature: 0.5,
          max_tokens: 5000,
        });

        generatedPrompt = completion.choices[0].message.content;
      }

      // Log the prompt
      const aiPrompt = new AIPrompt({
        userId: req.user.id,
        prompt: generatedPrompt,
        type: "simulation",
      });

      console.log("SAVINGGG : ");

      await aiPrompt.save();

      res.json({
        prompt: generatedPrompt,
        name,
        subject,
        course,
        department,
        description,
        complexity,
        interactivity,
        experimentId,
      });
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
      console.log("GOT REQ IN GENERATE CODE LMAO");
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
              content: `You are an expert in creating educational simulations using HTML, CSS, and JavaScript. Your task is to generate complete, working code for interactive simulations that can be used in virtual labs. send code in html, css and javascript in one file embedded in html. include all the necessary code to make the simulation work. only send the code.
                Technical Requirements:
                - The simulation should be a single HTML file with embedded JavaScript and CSS.
                - Use modern JavaScript (ES6+) and CSS3
                - Ensure the simulation is responsive and works on different screen sizes
                - Include clear instructions for users
                - Add appropriate visualizations, controls, and feedback mechanisms
                - Implement proper physics/mathematical models where applicable
                - Include appropriate error handling`,
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
              content: `You are an expert in creating educational simulations using HTML, CSS, and JavaScript. Your task is to generate complete, working code for interactive simulations that can be used in virtual labs. send code in html, css and javascript in one file embedded in html. include all the necessary code to make the simulation work. only send the code.
                Technical Requirements:
                - The simulation should be a single HTML file with embedded JavaScript and CSS.
                - Use modern JavaScript (ES6+) and CSS3
                - Ensure the simulation is responsive and works on different screen sizes
                - Include clear instructions for users in the code
                - Add appropriate visualizations, controls, and feedback mechanisms
                - Implement proper physics/mathematical models where applicable
                - Include appropriate error handling`,
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

app.post("/api/simulations", authenticateJWT, async (req, res) => {
  try {
    const {
      experimentId,
      name,
      subject,
      department,
      topic,
      details,
      prompt,
      code,
      course,
    } = req.body;

    // Get user with GitHub access token
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create simulation in database
    const simulation = new Simulation({
      userId: req.user.id,
      name,
      subject,
      department,
      topic,
      details,
      prompt,
      code,
      course,
      experimentId,
    });

    await simulation.save();

    res.status(201).json(simulation);
  } catch (error) {
    console.error("Simulation creation error:", error);
    res.status(500).json({ message: "Failed to create simulation" });
  }
});

// Update the chat route with better error handling
app.post("/api/simulations/chat", authenticateJWT, async (req, res) => {
  try {
    console.log("Received chat request");
    const { message, code, history } = req.body;

    // Get user with their settings
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get preferred LLM from user settings
    let preferredLLM = user.settings?.preferredLLM || "deepseek";

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
          "You are an expert simulation builder AI assistant helping to build an educational simulation using HTML, CSS, and JavaScript. you work on code for interactive simulations that can be used in virtual labs. include all the necessary code to make the simulation work. only send the code.  You can modify code based on user requests. When the user asks for changes, provide the updated code in full.",
      },
      ...formattedHistory,
      { role: "user", content: message },
    ];

    let aiResponse;
    let updatedCode = null;

    try {
      if (preferredLLM === "openai") {
        console.log("Using OpenAI for chat");
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: messages,
          temperature: 0.7,
          max_tokens: 2000,
        });

        aiResponse = completion.choices[0].message.content;
      } else {
        console.log("Attempting to use Deepseek for chat");
        try {
          const completion = await deepseek.chat.completions.create({
            model: "deepseek-coder",
            messages: messages,
            temperature: 0.7,
            max_tokens: 2000,
          });

          aiResponse = completion.choices[0].message.content;
        } catch (deepseekError) {
          console.error("Deepseek API error:", deepseekError);
          console.log("Falling back to OpenAI");

          const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            temperature: 0.7,
            max_tokens: 2000,
          });

          aiResponse = completion.choices[0].message.content;
        }
      }
    } catch (llmError) {
      console.error("LLM API error:", llmError);
      return res.status(500).json({
        message: "Error communicating with AI service",
        details: llmError.message,
      });
    }

    // Check if the response contains code updates
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
          console.log("Complete HTML document detected");
        } else {
          // It might be a partial update
          console.log("Partial code update detected");
        }
      }
    }

    console.log("Sending response back to client");
    res.json({
      response: aiResponse,
      updatedCode: updatedCode,
    });
  } catch (error) {
    console.error("AI chat error:", error);
    res.status(500).json({
      message: "Failed to process chat message",
      details: error.message,
    });
  }
});

// Add this new route for user settings
app.put("/api/auth/settings", authenticateJWT, async (req, res) => {
  try {
    const { settings } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { settings },
      { new: true }
    ).select("-githubAccessToken");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Settings update error:", error);
    res.status(500).json({ message: "Failed to update settings" });
  }
});

// Add a route to handle institutions
app.get("/api/institutions", async (req, res) => {
  try {
    console.log("HEYEYOIHFSLK JDF");
    const institutions = await Institution.find({}).sort({ name: 1 });
    console.log("YOOOOOOOO :", institutions);
    res.json(institutions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Add API endpoint for onboarding
app.post("/api/auth/onboarding", authenticateJWT, async (req, res) => {
  try {
    const { institution } = req.body;

    // Update user with institution and mark as onboarded
    await User.findByIdAndUpdate(req.user.id, {
      institution,
      isOnboarded: true,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ message: "Failed to complete onboarding" });
  }
});

// Add this route to fetch lab details by ID
app.get("/api/labs/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Received Lab ID:", id); // Log the received ID

    const lab = await Lab.findById(id);
    console.log("Fetched Lab:", lab); // Log the fetched lab

    if (!lab) {
      return res.status(404).json({ message: "Lab not found" });
    }

    // Fetch experiments that match the userId
    const experiments = await Experiment.find({
      labId: id,
      userId: req.user.id,
    });

    // Return lab details along with the filtered experiments
    res.status(200).json({ lab, experiments });
  } catch (error) {
    console.error("Error fetching lab details:", error);
    res.status(500).json({ message: "Failed to fetch lab details" });
  }
});

// Add this route to fetch all experiments created by the user
app.get("/api/experiments", authenticateJWT, async (req, res) => {
  try {
    // Fetch experiments that match the userId
    const experiments = await Experiment.find({ userId: req.user.id });

    // Return the experiments
    res.status(200).json(experiments);
  } catch (error) {
    console.error("Error fetching experiments:", error);
    res.status(500).json({ message: "Failed to fetch experiments" });
  }
});

// Add this route to fetch experiment details by ID
app.get("/api/experiments/:id", authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Received Experiment ID:", id);

    const experiment = await Experiment.findById(id);
    console.log("Fetched experiment:", experiment);

    if (!experiment) {
      return res.status(404).json({ message: "Experiment not found" });
    }

    const simulations = await Simulation.find({
      id,
      userId: req.user.id,
    });

    res.status(200).json({ experiment, simulations });
  } catch (error) {
    console.error("Error fetching experiment details:", error);
    res.status(500).json({ message: "Failed to fetch experiment details" });
  }
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

axios.defaults.withCredentials = true;
