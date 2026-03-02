// Julia's portfolio context for RAG
// This data is used to answer questions about Julia

export const juliaContext = {
  personal: {
    name: "Julia Liu",
    title: "Interdisciplinary Designer",
    location: "San Francisco Bay Area",
    education: "UC Berkeley - Art, Data Science, and Design Certificate",
    interests: ["baking", "solo traveling", "creative coding"],
    email: "hello@julialiu.design"
  },

  skills: [
    "Product Design",
    "UX Research",
    "Figma",
    "Prototyping",
    "Design Systems",
    "Creative Coding",
    "User-Centered Design",
    "Interaction Design",
    "Data Visualization"
  ],

  projects: [
    {
      name: "Humanity's Tech Tree",
      description: "A collaborative timeline of human technological progress. An interactive experience that lets users explore and contribute to humanity's journey of innovation.",
      type: "Interactive Experience",
      highlights: ["Interactive timeline", "Collaborative contributions", "Visual storytelling"]
    },
    {
      name: "Claude × Flow",
      description: "Helping Claude Code flow. A project focused on improving the developer experience with AI-powered coding assistance.",
      type: "Developer Tools",
      highlights: ["AI integration", "Developer experience", "Workflow optimization"]
    }
  ],

  experience: `Julia is a product designer and UX researcher currently studying at UC Berkeley,
where she's pursuing a unique combination of Art, Data Science, and the Design Certificate.
This interdisciplinary background allows her to approach design challenges from multiple perspectives,
combining creative expression with data-driven insights.

She's passionate about creating meaningful digital experiences that bridge creativity and technology.
Her work spans product design, UX research, and creative coding, always with a focus on
user-centered design principles.

When not designing, Julia enjoys baking (she calls it her "baking era") and solo traveling
around the world, which gives her exposure to diverse cultures and design perspectives.`,

  designPhilosophy: `Julia believes in:
- User-centered design that puts people first
- Data-informed decisions balanced with creative intuition
- Interdisciplinary thinking that bridges art and technology
- Creating experiences that are both beautiful and functional
- Continuous learning and experimentation`,

  contact: {
    email: "hello@julialiu.design",
    linkedin: "linkedin.com/in/julialiu",
    github: "github.com/julialiu",
    portfolio: "julialiu.design"
  }
};

// Function to get relevant context based on query
export function getRelevantContext(query) {
  const queryLower = query.toLowerCase();
  let relevantParts = [];

  // Always include basic info
  relevantParts.push(`Name: ${juliaContext.personal.name}`);
  relevantParts.push(`Title: ${juliaContext.personal.title}`);
  relevantParts.push(`Education: ${juliaContext.personal.education}`);

  // Add skills if asking about skills/abilities
  if (queryLower.includes('skill') || queryLower.includes('can') || queryLower.includes('know') || queryLower.includes('able')) {
    relevantParts.push(`Skills: ${juliaContext.skills.join(', ')}`);
  }

  // Add projects if asking about work/projects
  if (queryLower.includes('project') || queryLower.includes('work') || queryLower.includes('portfolio') || queryLower.includes('made') || queryLower.includes('built')) {
    juliaContext.projects.forEach(project => {
      relevantParts.push(`Project: ${project.name} - ${project.description}`);
    });
  }

  // Add experience/background
  if (queryLower.includes('experience') || queryLower.includes('background') || queryLower.includes('about') || queryLower.includes('who')) {
    relevantParts.push(juliaContext.experience);
  }

  // Add design philosophy
  if (queryLower.includes('design') || queryLower.includes('philosophy') || queryLower.includes('approach') || queryLower.includes('believe')) {
    relevantParts.push(juliaContext.designPhilosophy);
  }

  // Add contact info
  if (queryLower.includes('contact') || queryLower.includes('reach') || queryLower.includes('email') || queryLower.includes('hire')) {
    relevantParts.push(`Contact: Email - ${juliaContext.contact.email}, Portfolio - ${juliaContext.contact.portfolio}`);
  }

  // Add interests/hobbies
  if (queryLower.includes('hobby') || queryLower.includes('interest') || queryLower.includes('free time') || queryLower.includes('fun')) {
    relevantParts.push(`Interests: ${juliaContext.personal.interests.join(', ')}`);
  }

  // If no specific match, include a broad overview
  if (relevantParts.length <= 3) {
    relevantParts.push(juliaContext.experience);
    relevantParts.push(`Skills: ${juliaContext.skills.slice(0, 5).join(', ')}`);
  }

  return relevantParts.join('\n\n');
}
