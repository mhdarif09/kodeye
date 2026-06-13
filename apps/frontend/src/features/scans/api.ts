import { apiClient } from '../../lib/api-client';
import type {
  Finding,
  FindingQuery,
  ScanJob,
  ScanLog,
  ScanQuery,
} from './types';

function queryString(query: object): string {
  const parameters = new URLSearchParams();
  Object.entries(query).forEach(([key, value]: [string, unknown]) => {
    if (typeof value === 'string' && value) parameters.set(key, value);
  });
  const value = parameters.toString();
  return value ? `?${value}` : '';
}

export const scansApi = {
  createScan: (repositoryId: string, body: { branch?: string } = {}) =>
    apiClient<ScanJob>(`/repositories/${repositoryId}/scans`, {
      authenticated: true,
      body,
      method: 'POST',
    }),
  getScan: (id: string) =>
    apiClient<ScanJob>(`/scans/${id}`, { authenticated: true }),
  getScanFindings: (id: string, query: FindingQuery = {}) =>
    apiClient<Finding[]>(`/scans/${id}/findings${queryString(query)}`, {
      authenticated: true,
    }),
  getScanLogs: (id: string) =>
    apiClient<ScanLog[]>(`/scans/${id}/logs`, { authenticated: true }),
  listScans: (query: ScanQuery = {}) =>
    apiClient<ScanJob[]>(`/scans${queryString(query)}`, {
      authenticated: true,
    }),
};
