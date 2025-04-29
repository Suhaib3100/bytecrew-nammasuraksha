const dns = require('dns');
const whois = require('whois-json');
const { isValidDomain } = require('../utils/validators');

class QuickAnalysisService {
    static async analyzeDomain(domain) {
        try {
            const results = {
                domain,
                threatLevel: 'unknown',
                checks: [],
                timestamp: new Date().toISOString()
            };

            // 1. Basic Domain Pattern Check
            const domainPatternCheck = this.checkDomainPattern(domain);
            results.checks.push(domainPatternCheck);

            // 2. DNS Check
            const dnsCheck = await this.performDNSCheck(domain);
            results.checks.push(dnsCheck);

            // 3. WHOIS Age Check
            const whoisCheck = await this.performWhoisCheck(domain);
            results.checks.push(whoisCheck);

            // 4. Suspicious Pattern Check
            const suspiciousCheck = this.checkSuspiciousPatterns(domain);
            results.checks.push(suspiciousCheck);

            // Calculate overall threat level
            results.threatLevel = this.calculateThreatLevel(results.checks);
            
            return results;
        } catch (error) {
            console.error('Error in domain analysis:', error);
            throw error;
        }
    }

    static checkDomainPattern(domain) {
        const check = {
            type: 'domain_pattern',
            status: 'safe',
            message: 'Domain pattern appears normal'
        };

        // Check for excessive hyphens
        if ((domain.match(/-/g) || []).length > 2) {
            check.status = 'warning';
            check.message = 'Domain contains excessive hyphens';
        }

        // Check for number sequence
        if (/\d{5,}/.test(domain)) {
            check.status = 'warning';
            check.message = 'Domain contains suspicious number sequence';
        }

        // Check for common brand names with variations
        const brandPatterns = /(paypal|google|microsoft|apple|amazon).*[^a-z]/i;
        if (brandPatterns.test(domain)) {
            check.status = 'danger';
            check.message = 'Potential brand impersonation detected';
        }

        return check;
    }

    static async performDNSCheck(domain) {
        const check = {
            type: 'dns_check',
            status: 'unknown',
            message: 'DNS check failed'
        };

        try {
            await new Promise((resolve, reject) => {
                dns.resolve(domain, (err, addresses) => {
                    if (err) {
                        check.status = 'danger';
                        check.message = 'Domain DNS resolution failed';
                        reject(err);
                    } else {
                        check.status = 'safe';
                        check.message = 'Domain DNS resolves correctly';
                        resolve(addresses);
                    }
                });
            });
        } catch (error) {
            console.error('DNS check error:', error);
        }

        return check;
    }

    static async performWhoisCheck(domain) {
        const check = {
            type: 'whois_check',
            status: 'unknown',
            message: 'WHOIS check failed'
        };

        try {
            const whoisData = await whois(domain);
            const creationDate = new Date(whoisData.creationDate);
            const domainAge = (new Date() - creationDate) / (1000 * 60 * 60 * 24); // Age in days

            if (domainAge < 30) {
                check.status = 'danger';
                check.message = 'Domain is less than 30 days old';
            } else if (domainAge < 180) {
                check.status = 'warning';
                check.message = 'Domain is less than 6 months old';
            } else {
                check.status = 'safe';
                check.message = 'Domain age is acceptable';
            }
        } catch (error) {
            console.error('WHOIS check error:', error);
        }

        return check;
    }

    static checkSuspiciousPatterns(domain) {
        const check = {
            type: 'suspicious_patterns',
            status: 'safe',
            message: 'No suspicious patterns detected'
        };

        const suspiciousPatterns = [
            { pattern: /secure.*login/i, message: 'Contains login-related keywords' },
            { pattern: /account.*verify/i, message: 'Contains verification-related keywords' },
            { pattern: /bank.*update/i, message: 'Contains banking-related keywords' },
            { pattern: /\.(tk|ml|ga|cf|gq)$/i, message: 'Uses free domain TLD' }
        ];

        for (const { pattern, message } of suspiciousPatterns) {
            if (pattern.test(domain)) {
                check.status = 'danger';
                check.message = message;
                break;
            }
        }

        return check;
    }

    static calculateThreatLevel(checks) {
        const statusScore = {
            'danger': 2,
            'warning': 1,
            'safe': 0,
            'unknown': 0
        };

        const totalScore = checks.reduce((score, check) => score + statusScore[check.status], 0);
        const maxPossibleScore = checks.length * 2;
        const scorePercentage = (totalScore / maxPossibleScore) * 100;

        if (scorePercentage >= 50) return 'high';
        if (scorePercentage >= 25) return 'medium';
        return 'low';
    }
}

module.exports = QuickAnalysisService; 