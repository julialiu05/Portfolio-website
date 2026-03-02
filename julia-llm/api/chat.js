import Anthropic from '@anthropic-ai/sdk';

// Julia's context data (embedded for serverless function)
const juliaContext = {
  personal: {
    name: "Julia Liu",
    title: "Interdisciplinary Designer",
    location: "San Francisco Bay Area",
    education: "UC Berkeley - Art, Data Science, and Design Certificate",
    interests: ["baking", "solo traveling", "creative coding"],
    email: "hello@julialiu.design"
  },
  skills: [
    "Product Design", "UX Research", "Figma", "Prototyping",
    "Design Systems", "Creative Coding", "User-Centered Design",
    "Interaction Design", "Data Visualization"
  ],
  projects: [
    {
      name: "Humanity's Tech Tree",
      description: "A collaborative timeline of human technological progress. An interactive experience that lets users explore and contribute to humanity's journey of innovation.",
      type: "Interactive Experience"
    },
    {
      name: "Claude × Flow",
      description: "Helping Claude Code flow. A project focused on improving the developer experience with AI-powered coding assistance.",
      type: "Developer Tools"
    }
  ],
  experience: `Julia is a product designer and UX researcher currently studying at UC Berkeley,
where she's pursuing Art, Data Science, and the Design Certificate. This interdisciplinary
background allows her to approach design challenges from multiple perspectives. She's passionate
about creating meaningful digital experiences that bridge creativity and technology.`,
  designPhilosophy: `Julia believes in user-centered design, data-informed decisions balanced with
creative intuition, interdisciplinary thinking, and creating experiences that are both beautiful
and functional.`
};

// Get relevant context based on query
function getRelevantContext(query) {
  const queryLower = query.toLowerCase();
  let parts = [];

  parts.push(`Name: ${juliaContext.personal.name}`);
  parts.push(`Title: ${juliaContext.personal.title}`);
  parts.push(`Education: ${juliaContext.personal.education}`);

  if (queryLower.match(/skill|can|know|able|good at/)) {
    parts.push(`Skills: ${juliaContext.skills.join(', ')}`);
  }

  if (queryLower.match(/project|work|portfolio|made|built|create/)) {
    juliaContext.projects.forEach(p => {
      parts.push(`Project: ${p.name} - ${p.description}`);
    });
  }

  if (queryLower.match(/experience|background|about|who|tell me/)) {
    parts.push(juliaContext.experience);
  }

  if (queryLower.match(/design|philosophy|approach|believe|style/)) {
    parts.push(juliaContext.designPhilosophy);
  }

  if (queryLower.match(/contact|reach|email|hire|connect/)) {
    parts.push(`Email: ${juliaContext.personal.email}`);
  }

  if (queryLower.match(/hobby|interest|free time|fun|outside/)) {
    parts.push(`Interests: ${juliaContext.personal.interests.join(', ')}`);
  }

  // Default to broad overview
  if (parts.length <= 3) {
    parts.push(juliaContext.experience);
    parts.push(`Skills: ${juliaContext.skills.slice(0, 5).join(', ')}`);
  }

  return parts.join('\n\n');
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get relevant context for RAG
    const context = getRelevantContext(message);

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Build messages array with conversation history
    const messages = [
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `You are JuliaLLM, a friendly AI assistant that represents Julia Liu and answers questions about her.
You should respond as if you're helping visitors learn about Julia's work, skills, and background.
Be warm, professional, and conversational - matching Julia's friendly personality.

Here is relevant information about Julia to help answer questions:

${context}

Guidelines:
- Answer in first person as Julia's AI assistant, not as Julia herself
- Be helpful and encouraging to potential employers/collaborators
- If asked something not in the context, politely say you don't have that specific information
- Keep responses concise but informative
- Feel free to suggest checking out Julia's portfolio for more details`,
      messages: messages,
    });

    return res.status(200).json({
      response: response.content[0].text,
      conversationHistory: messages
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      error: 'Failed to process request',
      details: error.message
    });
  }
}
