import { apiClient, ApiClientError, getApiUrl } from '../../lib/api-client';
import { getAccessToken } from '../../lib/auth-token';
import type { ApiErrorResponse } from '../../types/api';
import type { ReportData } from './types';

export type ReportFormat = 'html' | 'json' | 'pdf';

export const reportsApi = {
  get: (scanId: string) =>
    apiClient<ReportData>(`/scans/${scanId}/report`, { authenticated: true }),
  download: async (scanId: string, format: ReportFormat): Promise<Blob> => {
    const response = await fetch(
      getApiUrl(`/scans/${scanId}/report/${format}`),
      {
        headers: { Authorization: `Bearer ${getAccessToken() ?? ''}` },
      },
    );
    if (!response.ok) {
      let message = `Unable to generate ${format.toUpperCase()} report.`;
      try {
        const error = (await response.json()) as ApiErrorResponse;
        message = error.message || message;
      } catch {
        // Non-JSON errors still use the clear fallback message.
      }
      throw new ApiClientError(message, response.status);
    }
    return response.blob();
  },
};
