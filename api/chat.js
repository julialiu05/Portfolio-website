import Anthropic from '@anthropic-ai/sdk';

const juliaContext = {
  personal: {
    name: "Julia Liu",
    title: "Product Designer, Artist & Tinkerer",
    location: "San Francisco Bay Area (originally from San Diego)",
    education: "UC Berkeley — Art Practice & Data Science, pursuing the Berkeley Design Certificate",
    interests: [
      "Making ceramics",
      "Collecting pins, cards, wrappers, fallen leaves, and petals",
      "Baking for friends",
      "Running the biggest design club at Berkeley",
      "Taking photos while solo traveling",
      "Adding three sugar packets to drinks"
    ],
    email: "julia.liu05@berkeley.edu",
    linkedin: "https://www.linkedin.com/in/julialiu05/",
    github: "https://github.com/julialiu05"
  },
  skills: [
    "Product Design", "UX Research", "Figma", "Prototyping",
    "Design Systems", "Creative Coding", "User-Centered Design",
    "Interaction Design", "Data Visualization", "Claude Code"
  ],
  projects: [
    {
      name: "Humanity's Tech Tree",
      role: "Founding Designer",
      year: "2025",
      description: "A collaborative timeline of human technological progress. An interactive experience that lets users explore and contribute to humanity's journey of innovation. Julia led the full design from research to shipped product.",
      type: "Interactive Experience / Web App"
    },
    {
      name: "Anthropic × Flow",
      role: "Designer",
      year: "2026",
      status: "Shipped",
      description: "Helping Claude Code flow. A VS Code extension and Electron app focused on improving the developer experience with AI-powered coding assistance. Built in collaboration with Anthropic.",
      type: "Developer Tools / VS Code Extension"
    },
    {
      name: "FinQuantum",
      role: "Design Intern",
      year: "2025",
      description: "AI-powered pre-approvals for a mortgage startup. Julia designed B2B tools during her internship, creating dashboards and approval flows for the lending process.",
      type: "B2B SaaS / Fintech"
    },
    {
      name: "WorryJar",
      role: "Designer & Developer",
      year: "2025",
      status: "Shipped",
      description: "A mindfulness app for managing anxiety. Users write down worries and place them in a virtual jar, with guided journaling and reflection features.",
      type: "Mobile App / Wellness"
    },
    {
      name: "Reels AI",
      role: "Designer",
      year: "2026",
      description: "AI-powered features for Instagram Reels. A concept project exploring how AI could enhance content discovery, summaries, and DM sharing on the platform.",
      type: "Concept / Social Media"
    }
  ],
  experience: `Julia is a product designer, artist, and tinkerer studying at UC Berkeley, where she pursues Art Practice, Data Science, and the Berkeley Design Certificate. She describes herself as a designer who explores and works between the worlds of canvas and terminals.

Her interdisciplinary background lets her approach design from multiple angles — combining creative expression with data-driven thinking. She runs the biggest design club at UC Berkeley and has shipped real products including Anthropic × Flow (a VS Code extension for Claude Code) and WorryJar (a mindfulness app).

She has internship experience at FinQuantum (AI mortgage startup) and has worked on projects spanning interactive experiences, developer tools, mobile apps, and AI-powered features.`,

  designPhilosophy: `Julia believes in user-centered design, data-informed decisions balanced with creative intuition, interdisciplinary thinking that bridges art and technology, and creating experiences that are both beautiful and functional. She is passionate about building, experimenting, and exploring new technology.`
};

function getRelevantContext(query) {
  const q = query.toLowerCase();
  let parts = [];

  parts.push(`Name: ${juliaContext.personal.name}`);
  parts.push(`Title: ${juliaContext.personal.title}`);
  parts.push(`Education: ${juliaContext.personal.education}`);
  parts.push(`Location: ${juliaContext.personal.location}`);

  if (q.match(/skill|can|know|able|good at|tool|tech|figma|code/)) {
    parts.push(`Skills: ${juliaContext.skills.join(', ')}`);
  }

  if (q.match(/project|work|portfolio|made|built|create|ship|case stud/)) {
    juliaContext.projects.forEach(p => {
      parts.push(`Project: ${p.name} (${p.year}, ${p.role}) - ${p.description}`);
    });
  }

  if (q.match(/experience|background|about|who|tell me|intern/)) {
    parts.push(juliaContext.experience);
  }

  if (q.match(/design|philosophy|approach|believe|style|process/)) {
    parts.push(juliaContext.designPhilosophy);
  }

  if (q.match(/contact|reach|email|hire|connect|linkedin|github/)) {
    parts.push(`Email: ${juliaContext.personal.email}`);
    parts.push(`LinkedIn: ${juliaContext.personal.linkedin}`);
    parts.push(`GitHub: ${juliaContext.personal.github}`);
  }

  if (q.match(/hobby|interest|free time|fun|outside|ceramic|bak|travel|collect/)) {
    parts.push(`Outside of design, Julia is: ${juliaContext.personal.interests.join('; ')}`);
  }

  if (q.match(/club|berkeley|school|uc|college|student/)) {
    parts.push(`Julia runs the biggest design club at UC Berkeley.`);
    parts.push(`Education: ${juliaContext.personal.education}`);
  }

  // Broad overview fallback
  if (parts.length <= 4) {
    parts.push(juliaContext.experience);
    parts.push(`Skills: ${juliaContext.skills.join(', ')}`);
    juliaContext.projects.forEach(p => {
      parts.push(`Project: ${p.name} (${p.year}) - ${p.description}`);
    });
  }

  return parts.join('\n\n');
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message, conversationHistory = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const context = getRelevantContext(message);

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const messages = [
      ...conversationHistory.slice(-10),
      { role: 'user', content: message }
    ];

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: `You are JuliaLLM, a friendly AI assistant on Julia Liu's portfolio website. You answer questions about Julia's work, skills, background, and projects.

Be warm, conversational, and concise — match Julia's friendly personality. Use casual language, not corporate speak.

Here is information about Julia:

${context}

Guidelines:
- Speak as Julia's AI assistant, not as Julia herself
- Be helpful and encouraging to visitors, potential employers, and collaborators
- If asked something not covered in the context, politely say you don't have that specific info and suggest reaching out to Julia directly
- Keep responses concise (2-4 sentences usually) but informative
- When mentioning her email, write it as julia[dot]liu05[at]berkeley.edu
- You can suggest checking out specific case studies on her portfolio`,
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
