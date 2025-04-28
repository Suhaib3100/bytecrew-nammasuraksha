const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

exports.analyzeContentWithAI = async (content, url) => {
  try {
    const prompt = `Analyze the following webpage content for security threats and vulnerabilities:
URL: ${url}
Content: ${content}

Please provide a detailed analysis including:
1. Potential security threats
2. Suspicious patterns or indicators
3. Recommendations for improvement
4. Risk level assessment (Low/Medium/High)`;

    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a security expert analyzing web content for potential threats and vulnerabilities."
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
      analysis: response.data.choices[0].message.content,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error analyzing content with AI:', error);
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

    const response = await openai.createChatCompletion({
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
      assessment: response.data.choices[0].message.content,
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

    const response = await openai.createChatCompletion({
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
      report: response.data.choices[0].message.content,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating threat report with AI:', error);
    throw error;
  }
}; 