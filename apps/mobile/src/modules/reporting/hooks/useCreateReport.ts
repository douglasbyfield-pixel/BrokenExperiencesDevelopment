import { useMutation } from '@tanstack/react-query';
import type { ReportCreate, ReportResponse } from '../types';
import { apiClient } from '@/lib/axios';

export function useCreateReport() {
  return useMutation<ReportResponse, Error, ReportCreate>({
    mutationFn: async (data: ReportCreate) => {
      const response = await apiClient.post<ReportResponse>('/report', data);

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to create report');
      }

      return response.data;
    },
    onError: (error) => {
      console.error('Error creating report:', error);
    },
  });
}
