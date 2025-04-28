const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeText(text, type = 'webpage') {
  try {
    const prompt = type === 'webpage' 
      ? `Analyze this webpage content for security threats and suspicious patterns:
${text}

Provide a detailed analysis including:
1. Overall threat level (low/medium/high)
2. List of security threats with severity levels
3. List of suspicious patterns with severity levels
4. Specific recommendations for improvement
5. A summary of findings

Format the response as a JSON object with the following structure:
{
  "threatLevel": "string",
  "threats": [
    {
      "description": "string",
      "severity": "string"
    }
  ],
  "suspiciousPatterns": [
    {
      "description": "string",
      "severity": "string"
    }
  ],
  "recommendations": ["string"],
  "summary": "string"
}`
      : `Analyze this message for potential scams and suspicious content:
${text}

Provide a detailed analysis including:
1. Overall threat level (low/medium/high)
2. Scam type (phishing, investment scam, romance scam, etc.)
3. List of scam indicators with severity levels
4. List of suspicious patterns with severity levels
5. Specific recommendations for improvement
6. A summary of findings

Format the response as a JSON object with the following structure:
{
  "threatLevel": "string",
  "scamType": "string",
  "indicators": [
    {
      "description": "string",
      "severity": "string"
    }
  ],
  "suspiciousPatterns": [
    {
      "description": "string",
      "severity": "string"
    }
  ],
  "recommendations": ["string"],
  "summary": "string"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content.trim());
    return result;
  } catch (error) {
    console.error('Error in AI analysis:', error);
    throw error;
  }
}

exports.analyzeContentWithAI = async (content, url) => {
  try {
    const prompt = `Analyze this webpage content for security threats. Focus on specific findings in the actual content:

URL: ${url}
Content: ${content.substring(0, 4000)}

Analyze the following aspects:
1. Scripts and Code: Look for suspicious JavaScript, eval(), document.write(), etc.
2. Forms and Inputs: Check for proper validation, CSRF protection
3. External Resources: Analyze third-party scripts, iframes, and their security
4. Headers and Meta: Check security headers and meta tags
5. Links and Redirects: Look for suspicious URLs or redirects

Format the response as a JSON object with the following structure:
{
  "threatLevel": "string",
  "threats": [
    {
      "description": "string",
      "severity": "string"
    }
  ],
  "suspiciousPatterns": [
    {
      "description": "string",
      "severity": "string"
    }
  ],
  "recommendations": ["string"],
  "summary": "string"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content.trim());
    return result;
  } catch (error) {
    console.error('Error in AI analysis:', error);
    throw error;
  }
};

exports.analyzeMessageWithAI = async (message) => {
  try {
    const prompt = `Analyze this message for potential scams and suspicious content:
${message}

Provide a detailed analysis including:
1. Overall threat level (low/medium/high)
2. Scam type (phishing, investment scam, romance scam, etc.)
3. List of scam indicators with severity levels
4. List of suspicious patterns with severity levels
5. Specific recommendations for improvement
6. A summary of findings

Format the response as a JSON object with the following structure:
{
  "threatLevel": "string",
  "scamType": "string",
  "indicators": [
    {
      "description": "string",
      "severity": "string"
    }
  ],
  "suspiciousPatterns": [
    {
      "description": "string",
      "severity": "string"
    }
  ],
  "recommendations": ["string"],
  "summary": "string"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content.trim());
    return result;
  } catch (error) {
    console.error('Error in AI analysis:', error);
    throw error;
  }
};

exports.checkPhishingWithAI = async (url, content) => {
  try {
    const prompt = `Analyze the following URL and content for potential phishing indicators:
URL: ${url}
Content: ${content}

Please provide:
1. Phishing likelihood assessment (0-100%)
2. Key indicators found
3. Explanation of findings
4. Recommendations`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a cybersecurity expert specializing in phishing detection."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return {
      assessment: response.choices[0].message.content,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error checking phishing with AI:', error);
    throw error;
  }
};

exports.generateThreatReport = async (threatData) => {
  try {
    const prompt = `Generate a detailed threat report based on the following data:
${JSON.stringify(threatData, null, 2)}

Please include:
1. Executive summary
2. Detailed analysis
3. Impact assessment
4. Mitigation recommendations
5. Risk level`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a cybersecurity expert generating detailed threat reports."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    return {
      report: response.choices[0].message.content,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating threat report with AI:', error);
    throw error;
  }
};

module.exports = {
  analyzeText
}; 