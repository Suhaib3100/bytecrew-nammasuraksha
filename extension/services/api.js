import config from '../config';

class ApiService {
    static async analyzeContent(content, type) {
        try {
            const response = await fetch(`${config.API_BASE_URL}${config.ENDPOINTS.ANALYZE_MESSAGE}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content,
                    type
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.analysis;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async getAnalysisHistory(limit = 10, offset = 0) {
        try {
            const response = await fetch(
                `${config.API_BASE_URL}${config.ENDPOINTS.ANALYZE_HISTORY}?limit=${limit}&offset=${offset}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async getAnalysis(id) {
        try {
            const response = await fetch(`${config.API_BASE_URL}${config.ENDPOINTS.GET_ANALYSIS}/${id}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
}

export default ApiService; 