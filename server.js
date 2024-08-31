require('dotenv').config();

const express = require('express');
const cors = require('cors'); // Import the CORS package
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(express.json());

// Enable CORS for all routes
app.use(cors());


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

// Function to get location info and structure the response
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
  const responseText = result.response.text();

  // Slice and structure the response
  const structuredResponse = structureResponse(responseText);
  return structuredResponse;
}

// Function to structure the response
function structureResponse(responseText) {
  // Define delimiters or headers to slice the response
  const sections = responseText.split('\n\n'); // Split by double newline or any other delimiter

  // Structure the response into an object or any desired format
  const structuredResponse = {
    geographicalOverview: sections[0] || '',
    culturalAndHistoricalSignificance: sections[1] || '',
    majorAttractions: sections[2] || '',
    localCuisineAndDiningOptions: sections[3] || '',
    activitiesAndExperiences: sections[4] || '',
    practicalInformation: sections[5] || '',
    additionalInsights: sections[6] || ''
  };

  return structuredResponse;
}

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).send({ error: 'Message is required' });
    }

    const response = await getLocationInfo(message);
    res.send(response);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
