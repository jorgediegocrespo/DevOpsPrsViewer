import type { AzureProject, RawPullRequest, Thread } from '../types';

function authHeader(pat: string): HeadersInit {
  return { Authorization: `Basic ${btoa(`:${pat}`)}` };
}

async function adoFetch<T>(url: string, pat: string): Promise<T> {
  const res = await fetch(url, { headers: authHeader(pat) });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Azure DevOps API error ${res.status}: ${text || res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchAllProjects(org: string, pat: string): Promise<AzureProject[]> {
  const projects: AzureProject[] = [];
  let skip = 0;
  const top = 100;

  while (true) {
    const data = await adoFetch<{ value: AzureProject[]; count: number }>(
      `https://dev.azure.com/${org}/_apis/projects?$top=${top}&$skip=${skip}&api-version=7.0`,
      pat
    );
    projects.push(...data.value);
    if (data.value.length < top) break;
    skip += top;
  }

  return projects.sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchProjectPRs(
  org: string,
  project: string,
  pat: string
): Promise<RawPullRequest[]> {
  const data = await adoFetch<{ value: RawPullRequest[] }>(
    `https://dev.azure.com/${org}/${encodeURIComponent(project)}/_apis/git/pullrequests?searchCriteria.status=active&$top=500&api-version=7.0`,
    pat
  );
  return data.value;
}

export async function fetchPRThreads(
  org: string,
  project: string,
  repoId: string,
  prId: number,
  pat: string
): Promise<Thread[]> {
  const data = await adoFetch<{ value: Thread[] }>(
    `https://dev.azure.com/${org}/${encodeURIComponent(project)}/_apis/git/repositories/${repoId}/pullRequests/${prId}/threads?api-version=7.0`,
    pat
  );
  return data.value;
}
