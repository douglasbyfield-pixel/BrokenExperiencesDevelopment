import { useMutation } from '@tanstack/react-query';
import type { ReportCreate, ReportResponse } from '../types';
import { apiClient } from '@/lib/axios';


export function useCreateReport() {
  return useMutation<ReportResponse, Error, ReportCreate>({
    mutationFn: async (data: ReportCreate) => {
      const formData = new FormData();
      
      // Add basic report data
      formData.append('description', data.description);
      formData.append('categories', JSON.stringify(data.categories));
      
      if (data.latitude) {
        formData.append('latitude', data.latitude);
      }
      
      if (data.longitude) {
        formData.append('longitude', data.longitude);
      }
      
      if (data.priority) {
        formData.append('priority', data.priority);
      }
      
      // Add images if provided
      if (data.images && data.images.length > 0) {
        data.images.forEach((image) => {
          formData.append('images', image);
        });
      }

      const response = await apiClient.post<ReportResponse>(`/report`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

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
