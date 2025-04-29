import { ScanResult } from '@/components/ResultCard';

// Simple URL pattern
const URL_PATTERN = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

// Common phishing keywords and patterns
const PHISHING_PATTERNS = [
  /urgent/i,
  /verify your account/i,
  /password expired/i,
  /suspicious activity/i,
  /money transfer/i,
  /banking alert/i,
  /security alert/i,
  /account.+suspend/i,
  /limited access/i,
  /unusual activity/i,
  /update.+information/i,
  /click.+here/i,
  /congratulations.+winner/i,
  /prize.+claim/i,
  /bank.+refund/i,
  /credit.+verify/i,
  /your.+payment/i,
  /ssn.+verify/i,
  /social security/i,
  /cryptocurrency/i,
  /invest.+bitcoin/i,
  /tax.+refund/i,
  /irs.+contact/i,
  /fbi.+warning/i,
  /lottery.+win/i,
  /inheritance/i,
  /million.+dollar/i,
  /free.+gift/i,
  /login.+expired/i,
  /confirm.+identity/i,
];

// Suspicious URL patterns
const SUSPICIOUS_URL_PATTERNS = [
  /\.(tk|ga|ml|cf|gq|top|xyz|pw)\//i, // Suspicious TLDs
  /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // IP addresses instead of domain names
  /https?:\/\/\d+\.\d+\.\d+\.\d+/i, // URLs with IP addresses
  /paypal|apple|google|microsoft|amazon|netflix|facebook|instagram/i, // Common brand names (likely to be spoofed)
  /secure|signin|login|verify|account|update|password|credential/i, // Security/login related terms
  /\.(com|net|org)\.[a-z]{2,4}\//i, // Double extensions (.com.something)
  /tiny\.cc|bit\.ly|goo\.gl|t\.co|tinyurl/i, // URL shorteners
];

// Simulate analysis with a delay to mimic async processing
export const analyzeContent = async (text: string): Promise<ScanResult> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  let phishingMatchCount = 0;
  let isSuspiciousUrl = false;
  
  // Check if it's a URL
  const isUrl = URL_PATTERN.test(text);
  
  // If it's a URL, check for suspicious URL patterns
  if (isUrl) {
    for (const pattern of SUSPICIOUS_URL_PATTERNS) {
      if (pattern.test(text)) {
        isSuspiciousUrl = true;
        phishingMatchCount += 2; // URLs matching known patterns are weighted higher
      }
    }
  }
  
  // Check for phishing patterns in the text
  for (const pattern of PHISHING_PATTERNS) {
    if (pattern.test(text)) {
      phishingMatchCount++;
    }
  }
  
  // Calculate confidence score based on matches
  const maxPatterns = isUrl ? PHISHING_PATTERNS.length + SUSPICIOUS_URL_PATTERNS.length : PHISHING_PATTERNS.length;
  let confidenceScore: number;
  
  if (isUrl && isSuspiciousUrl) {
    // For suspicious URLs, start at a higher baseline
    confidenceScore = Math.min(95, 40 + (phishingMatchCount / maxPatterns) * 100);
  } else {
    confidenceScore = Math.min(95, (phishingMatchCount / maxPatterns) * 100);
  }
  
  // Round to nearest integer
  confidenceScore = Math.round(confidenceScore);
  
  // Determine status based on confidence score
  let status: 'safe' | 'warning' | 'danger';
  let message: string;
  let details: string | undefined;
  
  if (confidenceScore < 30) {
    status = 'safe';
    message = isUrl 
      ? 'This URL appears to be safe. No suspicious patterns detected.' 
      : 'This message appears to be legitimate. No suspicious patterns detected.';
    details = 'While this content appears safe, always practice caution with links and personal information.';
  } else if (confidenceScore < 70) {
    status = 'warning';
    message = isUrl 
      ? 'This URL has some suspicious characteristics. Proceed with caution.' 
      : 'This message contains some suspicious patterns. Be careful about taking any action.';
    details = 'Consider verifying the legitimacy of this content through official channels before proceeding.';
  } else {
    status = 'danger';
    message = isUrl 
      ? 'This URL has high likelihood of being a phishing attempt. Do not proceed.' 
      : 'This message contains multiple red flags suggesting a scam or phishing attempt.';
    details = 'Do not click any links, provide personal information, or respond to this content. Report it if possible.';
  }
  
  return {
    status,
    confidenceScore,
    message,
    details,
  };
};