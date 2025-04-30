const express = require('express');
const router = express.Router();
const whois = require('whois-json');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const dns = require('dns');
const dnsPromises = dns.promises;

// Helper function to perform native whois command
async function nativeWhoisLookup(domain) {
    try {
        const { stdout } = await execPromise(`whois ${domain}`);
        return stdout;
    } catch (error) {
        console.error('Native WHOIS lookup failed:', error);
        return null;
    }
}

// Helper function to parse raw WHOIS data
function parseRawWhois(rawData) {
    if (!rawData) return {};
    
    const patterns = {
        'Domain Name': /Domain Name:\s*(.+)/i,
        'Registrar': /Registrar:\s*(.+)/i,
        'Creation Date': /Creation Date:\s*(.+)/i,
        'Updated Date': /(Updated|Last Modified) Date:\s*(.+)/i,
        'Expiration Date': /(Expiry|Expiration) Date:\s*(.+)/i,
        'Name Servers': /Name Server:\s*(.+)/i,
        'Status': /Status:\s*(.+)/i,
        'DNSSEC': /DNSSEC:\s*(.+)/i
    };

    const result = {};
    for (const [key, pattern] of Object.entries(patterns)) {
        const match = rawData.match(pattern);
        if (match) {
            if (key === 'Updated Date') {
                result[key] = match[2];
            } else {
                result[key] = match[1];
            }
        }
    }

    // Handle multiple name servers
    const nameServers = rawData.match(/Name Server:\s*(.+)/gi);
    if (nameServers) {
        result['Name Servers'] = nameServers.map(ns => ns.replace(/Name Server:\s*/i, '').trim()).join(', ');
    }

    return result;
}

// Helper function to get DNS information
async function getDnsInfo(domain) {
    try {
        const [a, ns, mx, txt] = await Promise.all([
            dnsPromises.resolve(domain).catch(() => []),
            dnsPromises.resolveNs(domain).catch(() => []),
            dnsPromises.resolveMx(domain).catch(() => []),
            dnsPromises.resolveTxt(domain).catch(() => [])
        ]);

        return {
            ipAddresses: a,
            nameServers: ns,
            mxRecords: mx.map(record => `${record.exchange} (priority: ${record.priority})`),
            txtRecords: txt.flat()
        };
    } catch (error) {
        console.error('DNS lookup failed:', error);
        return null;
    }
}

// WHOIS lookup endpoint
router.post('/lookup', async (req, res) => {
    try {
        const { domain } = req.body;

        if (!domain) {
            return res.status(400).json({
                success: false,
                error: 'Domain is required'
            });
        }

        // Try whois-json first
        let whoisData = {};
        try {
            whoisData = await whois(domain);
        } catch (error) {
            console.error('whois-json lookup failed:', error);
        }

        // If whois-json fails or returns empty data, try native whois
        if (!whoisData || Object.keys(whoisData).length === 0) {
            const rawWhois = await nativeWhoisLookup(domain);
            whoisData = parseRawWhois(rawWhois);
        }

        // Get DNS information
        const dnsInfo = await getDnsInfo(domain);

        // Format the WHOIS data
        const formattedData = {
            'Domain Name': whoisData.domainName || domain,
            'Registrar': whoisData.registrar || whoisData.Registrar || 'N/A',
            'Creation Date': whoisData.creationDate || whoisData['Creation Date'] || 'N/A',
            'Updated Date': whoisData.updatedDate || whoisData['Updated Date'] || 'N/A',
            'Expiration Date': whoisData.expirationDate || whoisData['Expiration Date'] || 'N/A',
            'Name Servers': whoisData.nameServers || whoisData['Name Servers'] || 
                          (dnsInfo?.nameServers?.join(', ') || 'N/A'),
            'Status': Array.isArray(whoisData.status) ? whoisData.status.join(', ') : 
                     (whoisData.status || whoisData.Status || 'N/A'),
            'DNSSEC': whoisData.dnssec || whoisData.DNSSEC || 'N/A',
            'IP Addresses': dnsInfo?.ipAddresses?.join(', ') || 'N/A',
            'MX Records': dnsInfo?.mxRecords?.join(', ') || 'N/A',
            'TXT Records': dnsInfo?.txtRecords?.join(', ') || 'N/A'
        };

        res.json({
            success: true,
            whoisData: formattedData
        });
    } catch (error) {
        console.error('Error performing WHOIS lookup:', error);
        res.status(500).json({
            success: false,
            error: 'Error performing WHOIS lookup',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router; 