const org = import.meta.env.VITE_ADO_ORG as string | undefined;
const pat = import.meta.env.VITE_ADO_PAT as string | undefined;

const missing: string[] = [];
if (!org) missing.push('VITE_ADO_ORG');
if (!pat) missing.push('VITE_ADO_PAT');

export const CONFIG_ERROR =
  missing.length > 0
    ? `Missing required environment variable(s): ${missing.join(', ')}. Add them to your .env file and restart the dev server.`
    : null;

export const ORG = org ?? '';
export const PAT = pat ?? '';
export const ADO_BASE = `https://dev.azure.com/${ORG}`;
