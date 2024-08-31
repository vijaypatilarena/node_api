require('dotenv').config();  

const express = require('express');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());  

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "When a user provides a location, generate a detailed and informative response about the location. Ensure your response includes the following:\n\nGeographical Overview: Describe the geographical features of the location, including its position, landscape, and any notable natural landmarks.\n\nCultural and Historical Significance: Provide insights into the cultural and historical importance of the location. Include information about historical events, cultural heritage, and significant landmarks.\n\nMajor Attractions: Highlight key attractions and points of interest that are worth visiting. Include popular tourist spots, landmarks, museums, parks, and any unique features of the location.\n\nLocal Cuisine and Dining Options: Mention notable local cuisines and dining options. Include recommendations for restaurants, street food, and traditional dishes that are unique to the location.\n\nActivities and Experiences: Suggest activities and experiences that can be enjoyed in the location, such as outdoor adventures, cultural experiences, festivals, or recreational activities.\n\nPractical Information: Provide practical information such as local transportation options, best times to visit, climate and weather conditions, and any other useful tips for travelers.\n\nAdditional Insights: Offer any extra information that might enhance the user's understanding of the location, such as local customs, language, or safety tips.",
});

const generationConfig = {
  temperature: 0.35,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Function to get location info
async function getLocationInfo(location) {
  const chatSession = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          { text: location },
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage(location);
  return result.response.text();
}

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).send({ error: 'Message is required' });
    }

    const response = await getLocationInfo(message);
    res.send({ response });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
