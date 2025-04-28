import {
	ChartDataItem,
	MarketIndex,
	MarketSummary,
	SectorPerformance,
	StockData,
	StockHistoricalData,
	TechnicalIndicator,
	MarketItem,
} from "./types";
import {
	generateHistoricalData,
	mockIndexHistoricalData,
	mockMarketIndices,
	mockIndianMarketIndices,
	mockMarketSummary,
	mockSectorPerformance,
	mockIndianSectorPerformance,
	mockTopStocks,
	mockTechnicalIndicators,
} from "./mock-data";
import { mockMarketItems } from "./mock-market-items";

/**
 * Market Data Service
 *
 * This service provides methods to fetch market data.
 * Currently using mock data, but can be easily replaced with real API calls.
 */
export class MarketDataService {
	/**
	 * Get all market indices
	 */
	static async getMarketIndices(): Promise<MarketIndex[]> {
		// In the future, replace with API call
		// return fetch('/api/market-indices').then(res => res.json());
		return Promise.resolve(mockMarketIndices);
	}

	/**
	 * Get Indian market indices
	 */
	static async getIndianMarketIndices(): Promise<MarketIndex[]> {
		// In the future, replace with API call
		// return fetch('/api/indian-market-indices').then(res => res.json());
		return Promise.resolve(mockIndianMarketIndices);
	}

	/**
	 * Get market summary data
	 */
	static async getMarketSummary(): Promise<MarketSummary> {
		// In the future, replace with API call
		// return fetch('/api/market-summary').then(res => res.json());
		return Promise.resolve(mockMarketSummary);
	}

	/**
	 * Get sector performance data
	 */
	static async getSectorPerformance(): Promise<SectorPerformance[]> {
		// In the future, replace with API call
		// return fetch('/api/sector-performance').then(res => res.json());
		return Promise.resolve(mockSectorPerformance);
	}

	/**
	 * Get Indian sector performance data
	 */
	static async getIndianSectorPerformance(): Promise<SectorPerformance[]> {
		// In the future, replace with API call
		// return fetch('/api/indian-sector-performance').then(res => res.json());
		return Promise.resolve(mockIndianSectorPerformance);
	}

	/**
	 * Get top stocks by market cap
	 */
	static async getTopStocks(): Promise<StockData[]> {
		// In the future, replace with API call
		// return fetch('/api/top-stocks').then(res => res.json());
		return Promise.resolve(mockTopStocks);
	}

	/**
	 * Get historical data for a specific market index
	 */
	static async getIndexHistoricalData(
		indexName: string,
	): Promise<StockHistoricalData[]> {
		// In the future, replace with API call
		// return fetch(`/api/index-history/${indexName}`).then(res => res.json());
		return Promise.resolve(
			mockIndexHistoricalData[
				indexName as keyof typeof mockIndexHistoricalData
			] || mockIndexHistoricalData["S&P 500"],
		);
	}

	/**
	 * Format historical data for chart display
	 */
	static formatChartData(
		historicalData: StockHistoricalData[],
	): ChartDataItem[] {
		return historicalData.map((item) => ({
			date: item.date,
			price: item.close,
			volume: item.volume,
		}));
	}

	/**
	 * Generate historical data for a specific stock
	 */
	static async getStockHistoricalData(
		stock: StockData,
	): Promise<StockHistoricalData[]> {
		// In the future, replace with API call
		// return fetch(`/api/stock-history/${stock.symbol}`).then(res => res.json());

		const baseValue = stock.price;
		const volatility = Math.max(5, 20 - stock.marketCap / 1000);
		return Promise.resolve(generateHistoricalData(baseValue, volatility));
	}

	/**
	 * Filter historical data by time range
	 */
	static filterDataByTimeRange(
		data: ChartDataItem[],
		timeRange: "1m" | "3m" | "6m" | "1y" | "5y",
	): ChartDataItem[] {
		return data.filter((item) => {
			const date = new Date(item.date);
			const referenceDate = new Date();
			let daysToSubtract = 30; // Default 1 month

			if (timeRange === "3m") {
				daysToSubtract = 90;
			} else if (timeRange === "6m") {
				daysToSubtract = 180;
			} else if (timeRange === "1y") {
				daysToSubtract = 365;
			} else if (timeRange === "5y") {
				daysToSubtract = 365 * 5;
			}

			const startDate = new Date(referenceDate);
			startDate.setDate(startDate.getDate() - daysToSubtract);
			return date >= startDate;
		});
	}

	/**
	 * Calculate price change for a dataset
	 */
	static calculateChange(data: ChartDataItem[]) {
		if (data.length < 2) return { value: 0, percent: 0 };

		const firstPrice = data[0].price;
		const lastPrice = data[data.length - 1].price;
		const change = lastPrice - firstPrice;
		const percentChange = (change / firstPrice) * 100;

		return {
			value: change.toFixed(2),
			percent: percentChange.toFixed(2),
		};
	}

	/**
	 * Get technical indicators
	 */
	static async getTechnicalIndicators(): Promise<TechnicalIndicator[]> {
		// In the future, replace with API call
		// return fetch('/api/technical-indicators').then(res => res.json());
		return Promise.resolve(mockTechnicalIndicators);
	}

	/**
	 * Get market items for the comprehensive market data table
	 * Includes indices, commodities, bonds, and currencies
	 */
	static async getMarketItems(): Promise<MarketItem[]> {
		// In the future, replace with API call
		// return fetch('/api/market-items').then(res => res.json());
		return Promise.resolve(mockMarketItems);
	}

	/**
	 * Get market items filtered by type
	 */
	static async getMarketItemsByType(type: 'index' | 'commodity' | 'bond' | 'currency'): Promise<MarketItem[]> {
		// In the future, replace with API call
		// return fetch(`/api/market-items/${type}`).then(res => res.json());
		const items = await this.getMarketItems();
		return items.filter(item => item.type === type);
	}
}
