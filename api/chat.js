import valpovoData from "../data/valpovoData.js";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { message } = req.body;

    const lowerMessage = message.toLowerCase();

    let category = "općenito";

    if (lowerMessage.includes("jest") || lowerMessage.includes("restoran")) {
      category = "gastronomija";
    } 
    else if (lowerMessage.includes("spavati") || lowerMessage.includes("smještaj")) {
      category = "smještaj";
    }
    else if (lowerMessage.includes("park") || lowerMessage.includes("šetnj")) {
      category = "priroda";
    }
    else if (lowerMessage.includes("događ")) {
      category = "događanja";
    }
    else if (lowerMessage.includes("vidjeti") || lowerMessage.includes("znamenit")) {
      category = "znamenitosti";
    }

    const items = valpovoData[category] || [];

    const responseJSON = {
      category: category,
      title: "Preporuke za Valpovo",
      intro: "Donosimo provjerene informacije.",
      sections: [
        {
          heading: category.charAt(0).toUpperCase() + category.slice(1),
          items: items
        }
      ]
    };

    res.status(200).json(responseJSON);

  } catch (error) {
    res.status(500).json({
      error: "Server error",
      details: error.message
    });
  }
}
