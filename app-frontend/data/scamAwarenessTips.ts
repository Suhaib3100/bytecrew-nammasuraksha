import { TipData } from '@/components/TipCard';

export const scamAwarenessTips: TipData[] = [
  {
    id: '1',
    title: 'Recognize Urgent Action Requests',
    summary: 'Be wary of messages creating a false sense of urgency to bypass your critical thinking.',
    content: `Scammers often create a false sense of urgency to push you into taking immediate action without thinking critically. They may claim:

- Your account will be closed if you don't verify information immediately
- You've been charged for something you didn't purchase
- There's suspicious activity on your account that needs immediate attention
- You'll miss out on a limited-time offer

Remember: Legitimate organizations don't pressure you to act immediately. If you receive an urgent message:

1. Pause and think before taking any action
2. Contact the organization directly using their official website or phone number (not the one in the message)
3. Never click links in unexpected urgent messages`,
    category: 'general',
  },
  {
    id: '2',
    title: 'Verify Email Sender Addresses',
    summary: 'Always check the actual email address, not just the display name, before trusting a message.',
    content: `Scammers frequently impersonate trusted organizations by using deceptive display names while the actual email address reveals the fraud. Always verify the exact email address before taking any action.

How to spot fake emails:
- Look for slight misspellings (e.g., amazon-support@amazom.com)
- Check for random characters (e.g., paypal@paypal-secure-23x.com)
- Watch for free email domains (e.g., paypal@gmail.com)
- Inspect non-sensical subdomains (e.g., bankofamerica@secure.scammer-site.com)

Best practices:
1. Hover over or tap the sender's name to see the full email address
2. Check the domain after the @ symbol - this should match the official company domain
3. When in doubt, forward suspicious emails to the company's official fraud department`,
    category: 'email',
  },
  {
    id: '3',
    title: 'Inspect URLs Before Clicking',
    summary: 'Check the full website address for misspellings, unusual domains, or suspicious patterns.',
    content: `Phishing links often use URLs that appear legitimate at first glance but contain subtle differences. Before clicking any link:

1. Hover over links (don't click) to preview the destination URL
2. Check for misspelled domains (e.g., amaz0n.com or amazon-secure.com)
3. Be suspicious of URL shorteners (bit.ly, tinyurl, etc.) in unexpected messages
4. Verify the protocol is secure (https://) with a padlock icon for sensitive interactions
5. Watch for IP addresses instead of proper domain names (e.g., http://192.168.1.1/login)

Safe browsing habits:
- Type URLs directly into your browser instead of clicking links
- Bookmark important financial and shopping websites
- Use a password manager that will only fill credentials on legitimate sites
- When in doubt, go to the official site directly instead of following links`,
    category: 'general',
  },
  {
    id: '4',
    title: 'Protect Personal Information',
    summary: 'Legitimate organizations rarely request sensitive information via email, text, or phone calls.',
    content: `Your personal information is valuable to scammers. Legitimate organizations typically don't request sensitive information through unsolicited communications.

Be extremely cautious when asked to provide:
- Social Security numbers
- Account passwords or PINs
- Credit card numbers
- Banking information
- Mother's maiden name or other security questions

Red flags that indicate a scam:
- Unsolicited requests for personal information
- Claims that your account has been compromised
- Offers that seem too good to be true
- Messages with poor grammar or spelling
- Communications threatening negative consequences

If you receive a request for personal information:
1. Contact the organization directly using their official website or phone number
2. Never provide personal information in response to an unsolicited message
3. Report suspicious requests to the appropriate authorities`,
    category: 'general',
  },
  {
    id: '5',
    title: 'Social Media Verification Scams',
    summary: 'Be aware of scams where imposters claim they need to "verify" your accounts with security codes.',
    content: `A common social media scam involves someone asking for a verification code sent to your phone. This is actually an attempt to hijack your account by intercepting two-factor authentication codes.

How the scam works:
1. Someone contacts you claiming to need your help or offering something desirable
2. They say they need to verify you're real by sending a code to your phone
3. When you receive the code (which is actually for your own account), they ask you to share it
4. Once they have the code, they can take over your account

Prevention tips:
- Never share verification codes, one-time passwords, or security codes with anyone
- Remember that legitimate companies will never ask for these codes
- Be wary of sudden messages from friends asking for codes (their account may be compromised)
- Use an authenticator app instead of SMS for two-factor authentication when possible
- If you've been victimized, report it to the platform immediately`,
    category: 'social',
  },
  {
    id: '6',
    title: 'Be Cautious with Payment Methods',
    summary: 'Unusual payment requests like wire transfers, gift cards, or cryptocurrency are red flags for scams.',
    content: `Scammers often request payment through methods that are difficult to trace or reverse. Be extremely cautious when someone asks you to pay using:

- Wire transfers
- Gift cards
- Cryptocurrency
- Money orders
- Cash reload cards
- Payment apps to people you don't know

Legitimate businesses typically accept standard payment methods like credit cards, which offer fraud protection.

Warning signs of payment scams:
- Pressure to pay immediately
- Instructions to tell no one about the transaction
- Requests to make purchases and share the codes from gift cards
- Directions to deposit money into unfamiliar accounts
- Claims that only specific, unusual payment methods are accepted

Protection tips:
1. Use credit cards when possible for better fraud protection
2. Never pay someone you don't know via peer-to-peer payment apps
3. Be especially wary of any request involving gift cards as payment
4. Remember that payments via wire transfer, cryptocurrency, and gift cards are rarely recoverable`,
    category: 'shopping',
  },
  {
    id: '7',
    title: 'Banking Verification Scams',
    summary: 'Your bank will never contact you unexpectedly asking for login credentials or verification codes.',
    content: `Banking scams are particularly dangerous because they target your financial resources directly. Protect yourself by understanding how legitimate banks operate.

Common banking scams:
- Text messages claiming suspicious activity on your account with a link to "verify"
- Phone calls from "bank security" asking for your account details or online banking credentials
- Emails about "locked accounts" requiring immediate action
- Fake bank websites that look nearly identical to the real thing

What legitimate banks will NEVER do:
- Ask for your full PIN or password over the phone or via email
- Request your online banking security codes
- Ask you to move money to a "safe" account
- Send someone to your home to collect cash, cards, or other items
- Request you to purchase items on their behalf

If you're contacted about your bank account:
1. Hang up and call your bank directly using the number on your card
2. Access your account by typing the bank's URL directly into your browser
3. Check your account for unauthorized transactions
4. Report suspicious communications to your bank immediately`,
    category: 'banking',
  },
  {
    id: '8',
    title: 'Romance and Investment Scams',
    summary: 'Be vigilant with online relationships that quickly lead to requests for money or investment opportunities.',
    content: `Romance scams and investment scams often go hand-in-hand, with scammers building trust over time before introducing financial requests.

Signs of a romance scam:
- The relationship develops quickly and intensely
- They always have excuses for why they can't video chat or meet in person
- They claim to work in remote locations (oil rigs, military deployment, international business)
- They have repeated emergencies requiring financial help
- They introduce investment opportunities, especially involving cryptocurrency

How investment scams typically progress:
1. Building trust through regular communication and displays of wealth
2. Mentioning an "exclusive" investment opportunity with guaranteed returns
3. Directing you to a professional-looking but fraudulent investment platform
4. Showing initial "profits" to encourage larger investments
5. Creating reasons why you can't withdraw your money

Protection strategies:
- Research any investment opportunity thoroughly before committing
- Be skeptical of guaranteed high returns with no risk
- Never invest based solely on a recommendation from someone you've met online
- Verify the legitimacy of investment platforms through official channels
- Remember that legitimate investment opportunities don't require urgent action`,
    category: 'social',
  },
  {
    id: '9',
    title: 'Job Offer and Employment Scams',
    summary: 'Be careful with job offers that require upfront payments or seem too good to be true.',
    content: `Employment scams target job seekers with promises of high pay for minimal work or requests for payment before starting.

Red flags in job offers:
- Offers that seem too good to be true (high pay, minimal qualifications)
- Poor grammar and spelling in communications
- Job offers without interviews or proper screening
- Requests for payment for training, equipment, or background checks
- Requests for personal banking information "to set up direct deposit" before employment begins
- Vague job descriptions or company information

Common employment scams:
- Work-from-home schemes requiring upfront purchases
- Mystery shopper positions that involve cashing fraudulent checks
- Data entry jobs with "training fees"
- Reshipping scams (receiving and forwarding packages, often containing stolen goods)
- Fake recruitment for real companies

Protect yourself:
1. Research the company thoroughly (website, reviews, business registrations)
2. Never pay money to secure a job opportunity
3. Be wary of interviews conducted entirely via messaging services
4. Verify job listings directly on official company websites
5. Don't provide Social Security numbers or financial information until you've verified the legitimacy of the employer`,
    category: 'general',
  },
  {
    id: '10',
    title: 'Recognize Phishing Messages',
    summary: 'Learn the common characteristics of phishing attempts to protect yourself proactively.',
    content: `Phishing messages share common characteristics that can help you identify them before becoming a victim.

Visual and content clues in phishing messages:
- Generic greetings ("Dear Customer") instead of your name
- Pressure tactics creating urgency or fear
- Requests for sensitive information
- Grammar and spelling errors
- Mismatched or suspicious email domains
- Strange formatting or design inconsistencies
- Unexpected attachments

Technical indicators of phishing:
- Links that preview to different URLs than what they display
- Shortened URLs that hide the true destination
- Attachments with suspicious file types (.zip, .exe, .js)
- Email headers showing different routing than expected from the legitimate organization

Behavioral defenses against phishing:
1. Pause before taking action on unexpected messages
2. Access accounts directly through official websites or apps, not through links
3. Use multi-factor authentication on all important accounts
4. Keep software and browsers updated with security patches
5. Use security software that can help identify phishing attempts

If you suspect phishing:
- Don't click any links or open attachments
- Report the message to the legitimate organization being impersonated
- Forward email phishing attempts to reportphishing@apwg.org and spam@uce.gov`,
    category: 'email',
  },
];