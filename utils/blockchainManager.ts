import { BlockchainRecord, CertificateData } from '../types';

export const generateCertificateHash = async (cert: CertificateData): Promise<string> => {
  const dataString = `${cert.id}:${cert.studentName}:${cert.courseName}:${cert.issueDate}:${cert.grade}:DSH_ISSUER`;
  const encoder = new TextEncoder();
  const data = encoder.encode(dataString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `0x${hashHex}`;
};

export const getExplorerLink = (record: BlockchainRecord): string => {
  switch (record.network) {
    case 'Polygon': return `https://polygonscan.com/tx/${record.txHash}`;
    case 'Ethereum': return `https://etherscan.io/tx/${record.txHash}`;
    case 'BNB Chain': return `https://bscscan.com/tx/${record.txHash}`;
    case 'Solana': return `https://explorer.solana.com/tx/${record.txHash}`;
    default: return '#';
  }
};
