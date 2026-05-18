/**
 * Base44 API Wrapper
 * Centralized API calls for all Base44 functions
 */

import { base44 } from '@/api/base44Client';

export const base44Api = {
  /**
   * Invoke a backend function with error handling
   */
  async invoke<T = any>(functionName: string, payload: any): Promise<{ data: T; error?: string }> {
    try {
      const response = await base44.functions.invoke(functionName, payload);
      if (response && typeof response === 'object' && 'data' in response) {
        return {
          data: response.data as T,
        };
      }
      return {
        data: response as T,
      };
    } catch (error: any) {
      console.error(`Error calling ${functionName}:`, error);
      return {
        data: null as any,
        error: error.message || 'Unknown error',
      };
    }
  },

  /**
   * Get shared map feed
   */
  async getSharedMapFeed(options?: {
    query?: string;
    search?: string;
    district?: string;
    filters?: { districts?: string[]; categories?: string[]; types?: string[]; statuses?: string[] };
    limit?: number;
  }) {
    return this.invoke('getSharedMapFeed', {
      query: options?.query || options?.search,
      search: options?.search || options?.query,
      district: options?.district,
      filters: options?.filters,
      limit: options?.limit || 1000,
    });
  },

  /**
   * Track a user action
   */
  async trackAction(action: {
    type: string;
    entity_id: string;
    entity_type: string;
    metadata?: Record<string, any>;
  }) {
    return this.invoke('trackUserAction', {
      action_type: action.type,
      entity_id: action.entity_id,
      entity_type: action.entity_type,
      metadata: action.metadata,
    });
  },

  /**
   * Log analytics event
   */
  async logEvent(event: {
    name: string;
    properties?: Record<string, any>;
  }) {
    try {
      base44.analytics.track({
        eventName: event.name,
        properties: event.properties,
      });
    } catch (error) {
      console.error('Error logging event:', error);
    }
  },
};
