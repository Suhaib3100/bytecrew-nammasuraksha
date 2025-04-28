import {
	MarketIndex,
	MarketSummary,
	SectorPerformance,
	StockData,
	StockHistoricalData,
	TechnicalIndicator,
} from "./types";

// Generate historical data for market indices
export const generateHistoricalData = (
	baseValue: number,
	volatility: number = 50,
): StockHistoricalData[] => {
	// Generate 5 years of data (approximately 1825 days)
	return Array.from({ length: 1825 }, (_, i) => {
		const date = new Date();
		date.setDate(date.getDate() - (1825 - i));

		// Base value with some randomness and long-term trends
		// Add some cyclical patterns for more realistic data
		const yearCycle = Math.sin(i / 365) * (baseValue * 0.15); // Yearly cycle
		const quarterCycle = Math.sin(i / 90) * (baseValue * 0.05); // Quarterly cycle
		const monthCycle = Math.sin(i / 30) * (baseValue * 0.02); // Monthly cycle

		// Create a general trend upward over time (about 7% per year on average)
		const trend = baseValue * (i / 1825) * 0.35;

		const adjustedBaseValue =
			baseValue + yearCycle + quarterCycle + monthCycle + trend;

		// Daily volatility
		const open = adjustedBaseValue + (Math.random() - 0.5) * volatility;
		const high = open + Math.random() * volatility;
		const low = open - Math.random() * volatility;
		const close = low + Math.random() * (high - low);

		// Volume with some patterns (higher on certain days)
		const dayOfWeek = date.getDay();
		const volumeMultiplier = dayOfWeek === 1 || dayOfWeek === 5 ? 1.5 : 1; // Higher volume on Mondays and Fridays
		const volume = Math.floor((Math.random() * 5 + 3) * volumeMultiplier); // 3-8 billion

		return {
			date: date.toISOString().split("T")[0],
			open: parseFloat(open.toFixed(2)),
			high: parseFloat(high.toFixed(2)),
			low: parseFloat(low.toFixed(2)),
			close: parseFloat(close.toFixed(2)),
			volume: volume,
		};
	});
};

// Mock data for the dashboard
export const mockMarketIndices: MarketIndex[] = [
	{
		name: "S&P 500",
		value: 5248.75,
		change: 32.64,
		changePercent: 0.63,
	},
	{
		name: "Dow Jones",
		value: 39807.37,
		change: 134.21,
		changePercent: 0.34,
	},
	{
		name: "Nasdaq",
		value: 16379.92,
		change: 78.81,
		changePercent: 0.48,
	},
	{
		name: "Russell 2000",
		value: 2092.74,
		change: -5.93,
		changePercent: -0.28,
	},
];

// Mock data for Indian markets
export const mockIndianMarketIndices: MarketIndex[] = [
	{
		name: "NIFTY 50",
		value: 22456.8,
		change: 167.45,
		changePercent: 0.75,
	},
	{
		name: "SENSEX",
		value: 73648.62,
		change: 601.19,
		changePercent: 0.82,
	},
	{
		name: "BANK NIFTY",
		value: 48123.45,
		change: -110.85,
		changePercent: -0.23,
	},
	{
		name: "NIFTY IT",
		value: 36789.2,
		change: 528.3,
		changePercent: 1.45,
	},
];

export const mockMarketSummary: MarketSummary = {
	advancers: 2347,
	decliners: 1853,
	unchanged: 124,
	totalVolume: 4.8, // in billions
	marketTrend: "bullish",
};

// Generate historical data for each index
export const mockIndexHistoricalData = {
	"S&P 500": generateHistoricalData(5000, 50),
	"Dow Jones": generateHistoricalData(39800, 200),
	Nasdaq: generateHistoricalData(16300, 100),
	"Russell 2000": generateHistoricalData(2100, 25),
	// Indian market indices
	"NIFTY 50": generateHistoricalData(22000, 150),
	SENSEX: generateHistoricalData(73000, 400),
	"BANK NIFTY": generateHistoricalData(48000, 200),
	"NIFTY IT": generateHistoricalData(36500, 180),
};

// Top performing stocks
export const mockTopStocks: StockData[] = [
	{
		symbol: "AAPL",
		name: "Apple Inc.",
		price: 182.52,
		change: 3.24,
		changePercent: 1.81,
		volume: 58.3,
		marketCap: 2820,
		pe: 30.2,
		sector: "Technology",
		lastUpdated: new Date().toISOString(),
	},
	{
		symbol: "MSFT",
		name: "Microsoft Corporation",
		price: 425.27,
		change: 7.89,
		changePercent: 1.89,
		volume: 23.7,
		marketCap: 3160,
		pe: 37.4,
		sector: "Technology",
		lastUpdated: new Date().toISOString(),
	},
	{
		symbol: "GOOGL",
		name: "Alphabet Inc.",
		price: 175.98,
		change: 2.13,
		changePercent: 1.23,
		volume: 19.8,
		marketCap: 2180,
		pe: 25.1,
		sector: "Technology",
		lastUpdated: new Date().toISOString(),
	},
	{
		symbol: "AMZN",
		name: "Amazon.com Inc.",
		price: 182.41,
		change: 3.78,
		changePercent: 2.12,
		volume: 32.5,
		marketCap: 1890,
		pe: 47.3,
		sector: "Consumer Cyclical",
		lastUpdated: new Date().toISOString(),
	},
	{
		symbol: "NVDA",
		name: "NVIDIA Corporation",
		price: 924.79,
		change: 23.45,
		changePercent: 2.6,
		volume: 41.2,
		marketCap: 2280,
		pe: 68.5,
		sector: "Technology",
		lastUpdated: new Date().toISOString(),
	},
	{
		symbol: "META",
		name: "Meta Platforms Inc.",
		price: 511.32,
		change: 8.76,
		changePercent: 1.74,
		volume: 17.9,
		marketCap: 1310,
		pe: 29.8,
		sector: "Technology",
		lastUpdated: new Date().toISOString(),
	},
	{
		symbol: "TSLA",
		name: "Tesla Inc.",
		price: 175.21,
		change: -3.42,
		changePercent: -1.91,
		volume: 98.7,
		marketCap: 557,
		pe: 48.2,
		sector: "Automotive",
		lastUpdated: new Date().toISOString(),
	},
	{
		symbol: "BRK.A",
		name: "Berkshire Hathaway Inc.",
		price: 621430.0,
		change: 4320.0,
		changePercent: 0.7,
		volume: 0.001,
		marketCap: 741,
		pe: 10.8,
		sector: "Financial Services",
		lastUpdated: new Date().toISOString(),
	},
	{
		symbol: "JPM",
		name: "JPMorgan Chase & Co.",
		price: 198.47,
		change: 1.23,
		changePercent: 0.62,
		volume: 8.9,
		marketCap: 572,
		pe: 12.1,
		sector: "Financial Services",
		lastUpdated: new Date().toISOString(),
	},
	{
		symbol: "V",
		name: "Visa Inc.",
		price: 278.34,
		change: 2.87,
		changePercent: 1.04,
		volume: 6.3,
		marketCap: 567,
		pe: 31.4,
		sector: "Financial Services",
		lastUpdated: new Date().toISOString(),
	},
];

// Sector performance
export const mockSectorPerformance: SectorPerformance[] = [
	{
		sector: "Technology",
		change: 1.87,
		divYield: 0.78,
		volume: 124.5,
		industries: ["Software", "Semiconductors", "Hardware", "IT Services"],
		stockCount: 342,
		performance: {
			week1: 2.1,
			month1: 3.8,
			month3: 7.2,
			month6: 12.5,
			ytd: 15.3,
			year1: 22.7,
			year5: 118.4,
			year10: 287.6,
			allTime: 1245.8,
		},
		analysis: {
			rsi: 62.4,
			macd: {
				value: 2.34,
				signal: 1.87,
				histogram: 0.47,
			},
			sma: {
				sma20: 1245.67,
				sma50: 1198.32,
				sma200: 1087.45,
			},
			ema: {
				ema12: 1267.89,
				ema26: 1234.56,
			},
			bb: {
				upper: 1345.67,
				middle: 1245.67,
				lower: 1145.67,
			},
		},
	},
	{
		sector: "Healthcare",
		change: 0.92,
		divYield: 1.45,
		volume: 87.3,
		industries: [
			"Pharmaceuticals",
			"Medical Devices",
			"Healthcare Services",
			"Biotechnology",
		],
		stockCount: 278,
		performance: {
			week1: 1.2,
			month1: 2.5,
			month3: 4.8,
			month6: 8.7,
			ytd: 9.2,
			year1: 14.5,
			year5: 67.8,
			year10: 142.3,
			allTime: 567.9,
		},
		analysis: {
			rsi: 54.7,
			macd: {
				value: 1.23,
				signal: 0.98,
				histogram: 0.25,
			},
			sma: {
				sma20: 876.54,
				sma50: 845.32,
				sma200: 798.76,
			},
			ema: {
				ema12: 887.65,
				ema26: 865.43,
			},
			bb: {
				upper: 912.34,
				middle: 876.54,
				lower: 840.76,
			},
		},
	},
	{
		sector: "Financial Services",
		change: 0.54,
		divYield: 2.34,
		volume: 102.7,
		industries: [
			"Banks",
			"Insurance",
			"Asset Management",
			"Financial Technology",
		],
		stockCount: 312,
		performance: {
			week1: 0.8,
			month1: 1.7,
			month3: 3.2,
			month6: 5.4,
			ytd: 6.8,
			year1: 11.2,
			year5: 42.7,
			year10: 87.6,
			allTime: 345.8,
		},
		analysis: {
			rsi: 48.9,
			macd: {
				value: 0.87,
				signal: 0.76,
				histogram: 0.11,
			},
			sma: {
				sma20: 654.32,
				sma50: 642.18,
				sma200: 612.45,
			},
			ema: {
				ema12: 659.87,
				ema26: 648.76,
			},
			bb: {
				upper: 678.54,
				middle: 654.32,
				lower: 630.1,
			},
		},
	},
	{
		sector: "Consumer Cyclical",
		change: 1.23,
		divYield: 1.12,
		volume: 93.5,
		industries: ["Retail", "Automotive", "Entertainment", "Hospitality"],
		stockCount: 245,
		performance: {
			week1: 1.5,
			month1: 3.2,
			month3: 5.7,
			month6: 9.8,
			ytd: 11.3,
			year1: 17.6,
			year5: 72.4,
			year10: 156.8,
			allTime: 487.3,
		},
		analysis: {
			rsi: 57.8,
			macd: {
				value: 1.56,
				signal: 1.32,
				histogram: 0.24,
			},
			sma: {
				sma20: 765.43,
				sma50: 743.21,
				sma200: 698.76,
			},
			ema: {
				ema12: 778.98,
				ema26: 759.87,
			},
			bb: {
				upper: 798.65,
				middle: 765.43,
				lower: 732.21,
			},
		},
	},
	{
		sector: "Communication Services",
		change: 0.78,
		divYield: 0.95,
		volume: 78.2,
		industries: ["Telecom", "Media", "Social Media", "Entertainment"],
		stockCount: 187,
		performance: {
			week1: 1.1,
			month1: 2.3,
			month3: 4.2,
			month6: 7.5,
			ytd: 8.7,
			year1: 13.2,
			year5: 54.7,
			year10: 112.3,
			allTime: 378.9,
		},
		analysis: {
			rsi: 52.3,
			macd: {
				value: 1.12,
				signal: 0.95,
				histogram: 0.17,
			},
			sma: {
				sma20: 543.21,
				sma50: 532.1,
				sma200: 498.76,
			},
			ema: {
				ema12: 548.76,
				ema26: 537.65,
			},
			bb: {
				upper: 567.89,
				middle: 543.21,
				lower: 518.54,
			},
		},
	},
	{
		sector: "Industrials",
		change: -0.32,
		divYield: 1.87,
		volume: 67.8,
		industries: ["Aerospace", "Defense", "Machinery", "Transportation"],
		stockCount: 234,
		performance: {
			week1: -0.5,
			month1: -1.2,
			month3: 2.1,
			month6: 4.3,
			ytd: 5.2,
			year1: 8.7,
			year5: 37.6,
			year10: 76.5,
			allTime: 287.4,
		},
		analysis: {
			rsi: 43.2,
			macd: {
				value: -0.45,
				signal: -0.32,
				histogram: -0.13,
			},
			sma: {
				sma20: 432.1,
				sma50: 438.76,
				sma200: 421.54,
			},
			ema: {
				ema12: 428.65,
				ema26: 434.32,
			},
			bb: {
				upper: 452.87,
				middle: 432.1,
				lower: 411.32,
			},
		},
	},
	{
		sector: "Energy",
		change: -0.87,
		divYield: 3.45,
		volume: 54.3,
		industries: ["Oil & Gas", "Renewable Energy", "Energy Equipment", "Coal"],
		stockCount: 156,
		performance: {
			week1: -1.2,
			month1: -2.7,
			month3: -4.5,
			month6: -2.1,
			ytd: -1.8,
			year1: 3.2,
			year5: 12.4,
			year10: 28.7,
			allTime: 145.6,
		},
		analysis: {
			rsi: 38.7,
			macd: {
				value: -0.98,
				signal: -0.76,
				histogram: -0.22,
			},
			sma: {
				sma20: 321.54,
				sma50: 332.1,
				sma200: 345.87,
			},
			ema: {
				ema12: 318.76,
				ema26: 327.65,
			},
			bb: {
				upper: 342.32,
				middle: 321.54,
				lower: 300.76,
			},
		},
	},
	{
		sector: "Utilities",
		change: 0.12,
		divYield: 3.21,
		volume: 32.7,
		industries: [
			"Electric Utilities",
			"Gas Utilities",
			"Water Utilities",
			"Renewable Utilities",
		],
		stockCount: 98,
		performance: {
			week1: 0.3,
			month1: 0.8,
			month3: 1.7,
			month6: 3.2,
			ytd: 3.8,
			year1: 5.4,
			year5: 21.3,
			year10: 45.7,
			allTime: 187.6,
		},
		analysis: {
			rsi: 47.5,
			macd: {
				value: 0.23,
				signal: 0.18,
				histogram: 0.05,
			},
			sma: {
				sma20: 234.56,
				sma50: 232.1,
				sma200: 227.65,
			},
			ema: {
				ema12: 235.87,
				ema26: 233.21,
			},
			bb: {
				upper: 245.32,
				middle: 234.56,
				lower: 223.8,
			},
		},
	},
	{
		sector: "Real Estate",
		change: -0.45,
		divYield: 3.78,
		volume: 28.9,
		industries: ["Residential", "Commercial", "Industrial", "REITs"],
		stockCount: 123,
		performance: {
			week1: -0.7,
			month1: -1.5,
			month3: -2.8,
			month6: -1.2,
			ytd: -0.5,
			year1: 2.1,
			year5: 15.7,
			year10: 32.4,
			allTime: 156.7,
		},
		analysis: {
			rsi: 41.2,
			macd: {
				value: -0.56,
				signal: -0.43,
				histogram: -0.13,
			},
			sma: {
				sma20: 187.65,
				sma50: 192.34,
				sma200: 198.76,
			},
			ema: {
				ema12: 185.43,
				ema26: 189.87,
			},
			bb: {
				upper: 198.54,
				middle: 187.65,
				lower: 176.76,
			},
		},
	},
	{
		sector: "Materials",
		change: 0.23,
		divYield: 2.12,
		volume: 43.5,
		industries: [
			"Chemicals",
			"Metals & Mining",
			"Paper & Forest Products",
			"Construction Materials",
		],
		stockCount: 145,
		performance: {
			week1: 0.4,
			month1: 1.2,
			month3: 2.5,
			month6: 4.7,
			ytd: 5.3,
			year1: 7.8,
			year5: 28.4,
			year10: 54.3,
			allTime: 213.7,
		},
		analysis: {
			rsi: 48.9,
			macd: {
				value: 0.34,
				signal: 0.27,
				histogram: 0.07,
			},
			sma: {
				sma20: 276.54,
				sma50: 272.1,
				sma200: 265.87,
			},
			ema: {
				ema12: 278.76,
				ema26: 274.32,
			},
			bb: {
				upper: 287.65,
				middle: 276.54,
				lower: 265.43,
			},
		},
	},
	{
		sector: "Consumer Defensive",
		change: 0.67,
		divYield: 2.45,
		volume: 56.7,
		industries: [
			"Food & Beverage",
			"Household Products",
			"Personal Products",
			"Tobacco",
		],
		stockCount: 167,
		performance: {
			week1: 0.9,
			month1: 1.8,
			month3: 3.4,
			month6: 5.7,
			ytd: 6.5,
			year1: 9.8,
			year5: 32.7,
			year10: 67.5,
			allTime: 245.8,
		},
		analysis: {
			rsi: 51.2,
			macd: {
				value: 0.78,
				signal: 0.65,
				histogram: 0.13,
			},
			sma: {
				sma20: 345.87,
				sma50: 338.76,
				sma200: 324.54,
			},
			ema: {
				ema12: 349.32,
				ema26: 342.1,
			},
			bb: {
				upper: 362.43,
				middle: 345.87,
				lower: 329.31,
			},
		},
	},
];

// Indian sector performance
export const mockIndianSectorPerformance: SectorPerformance[] = [
	{ sector: "IT", change: 1.45 },
	{ sector: "FMCG", change: 0.92 },
	{ sector: "Auto", change: 0.65 },
	{ sector: "Pharma", change: 0.38 },
	{ sector: "Bank", change: -0.23 },
	{ sector: "Metal", change: -0.87 },
	{ sector: "Realty", change: 0.42 },
	{ sector: "Oil & Gas", change: -0.56 },
	{ sector: "Power", change: 0.31 },
	{ sector: "Media", change: -0.18 },
];

// Technical indicators
export const mockTechnicalIndicators: TechnicalIndicator[] = [
	{
		id: "rsi",
		name: "Relative Strength Index (RSI)",
		description:
			"Measures the speed and change of price movements on a scale of 0-100. Values above 70 indicate overbought conditions, while values below 30 indicate oversold conditions.",
		type: "momentum",
	},
	{
		id: "macd",
		name: "Moving Average Convergence Divergence (MACD)",
		description:
			"Shows the relationship between two moving averages of a security's price. The MACD is calculated by subtracting the 26-period EMA from the 12-period EMA.",
		type: "momentum",
	},
	{
		id: "stoch",
		name: "Stochastic Oscillator",
		description:
			"Compares a security's closing price to its price range over a specific period. It generates overbought and oversold signals.",
		type: "momentum",
	},
	{
		id: "sma",
		name: "Simple Moving Average (SMA)",
		description:
			"Calculates the average price over a specific period. It helps identify the direction of the trend and potential support/resistance levels.",
		type: "trend",
	},
	{
		id: "ema",
		name: "Exponential Moving Average (EMA)",
		description:
			"Similar to SMA but gives more weight to recent prices. It responds more quickly to price changes than the SMA.",
		type: "trend",
	},
	{
		id: "bb",
		name: "Bollinger Bands",
		description:
			"Consists of a middle band (SMA) with upper and lower bands that are standard deviations away from the middle band. They help identify volatility and potential reversal points.",
		type: "volatility",
	},
	{
		id: "atr",
		name: "Average True Range (ATR)",
		description:
			"Measures market volatility by calculating the average range between high and low prices over a specific period.",
		type: "volatility",
	},
	{
		id: "obv",
		name: "On-Balance Volume (OBV)",
		description:
			"Relates volume to price change. It adds volume on up days and subtracts volume on down days to identify buying and selling pressure.",
		type: "volume",
	},
	{
		id: "vwap",
		name: "Volume-Weighted Average Price (VWAP)",
		description:
			"Calculates the average price weighted by volume. It helps identify the true average price and liquidity levels.",
		type: "volume",
	},
];
