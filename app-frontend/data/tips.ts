import { TipItem } from '@/types';

export const tips: TipItem[] = [
  {
    id: '1',
    title: 'Check URLs Carefully',
    content:
      'Always check the URL before entering any information. Phishing sites often use URLs that look similar to legitimate websites but with slight variations or misspellings.',
    category: 'phishing',
    icon: 'alert-triangle',
  },
  {
    id: '2',
    title: 'Beware of Urgent Requests',
    content:
      'Be suspicious of messages that create a sense of urgency or fear. Scammers often use urgency to pressure you into taking action without thinking.',
    category: 'scam',
    icon: 'shield',
  },
  {
    id: '3',
    title: 'Use Strong, Unique Passwords',
    content:
      'Create strong, unique passwords for each of your online accounts. Consider using a password manager to generate and store complex passwords securely.',
    category: 'general',
    icon: 'key',
  },
  {
    id: '4',
    title: 'Enable Two-Factor Authentication',
    content:
      'Whenever possible, enable two-factor authentication (2FA) on your accounts for an extra layer of security beyond just your password.',
    category: 'general',
    icon: 'lock',
  },
  {
    id: '5',
    title: 'Don\'t Click Suspicious Links',
    content:
      'Avoid clicking on links in emails or messages from unknown senders. Hover over links to preview the URL before clicking.',
    category: 'phishing',
    icon: 'link',
  },
  {
    id: '6',
    title: 'Be Wary of "Too Good to Be True" Offers',
    content:
      'If something sounds too good to be true, it probably is. Be skeptical of offers for free products, unrealistic discounts, or unexpected winnings.',
    category: 'scam',
    icon: 'gift',
  },
  {
    id: '7',
    title: 'Keep Software Updated',
    content:
      'Regularly update your devices, apps, and software to ensure you have the latest security patches and protections against vulnerabilities.',
    category: 'general',
    icon: 'refresh-cw',
  },
  {
    id: '8',
    title: 'Verify the Sender',
    content:
      'Check the sender\'s email address carefully. Scammers often use addresses that look legitimate but have subtle differences. Call the company directly if you\'re unsure.',
    category: 'phishing',
    icon: 'user-check',
  },
];

export const getTipsByCategory = (category: 'phishing' | 'scam' | 'general') => {
  return tips.filter((tip) => tip.category === category);
};

export const getAllTips = () => {
  return tips;
};

export const getTipById = (id: string) => {
  return tips.find((tip) => tip.id === id);
};