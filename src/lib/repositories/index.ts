/**
 * Downtown Perks Data Repositories
 * Single source of truth for all data access
 */

import { base44 } from '@/api/base44Client';
import type { SharedMapItem } from '../contracts';
import { mapMixedEntitiesToSharedItems } from '../mappers';

// ── MAP REPOSITORY ──────────────────────────────────────────────────
export const mapRepository = {
  /**
   * Get all map items (unified feed)
   */
  async getAllMapItems(options?: {
    districts?: string[];
    categories?: string[];
    statuses?: string[];
    limit?: number;
  }): Promise<SharedMapItem[]> {
    try {
      // Call the unified getSharedMapFeed function
      const response = await base44.functions.invoke('getSharedMapFeed', {
        filters: {
          districts: options?.districts,
          categories: options?.categories,
          statuses: options?.statuses,
        },
        limit: options?.limit || 1000,
      });
      return response.data?.items || [];
    } catch (error) {
      console.error('Error fetching map items:', error);
      return [];
    }
  },

  /**
   * Search map items by query
   */
  async searchMapItems(query: string, options?: { limit?: number }): Promise<SharedMapItem[]> {
    try {
      const response = await base44.functions.invoke('getSharedMapFeed', {
        search: query,
        limit: options?.limit || 50,
      });
      return response.data?.items || [];
    } catch (error) {
      console.error('Error searching map items:', error);
      return [];
    }
  },

  /**
   * Get map item by ID and type
   */
  async getMapItem(id: string): Promise<SharedMapItem | null> {
    try {
      const items = await base44.entities.SharedMapItem.filter({ entity_id: id });
      return items?.[0] || null;
    } catch (error) {
      console.error('Error fetching map item:', error);
      return null;
    }
  },

  /**
   * Get items by entity type
   */
  async getMapItemsByType(type: string, options?: { limit?: number }): Promise<SharedMapItem[]> {
    try {
      const items = await base44.entities.SharedMapItem.filter({ entity_type: type }, undefined, options?.limit || 100);
      return items || [];
    } catch (error) {
      console.error('Error fetching map items by type:', error);
      return [];
    }
  },
};

// ── RESIDENT REPOSITORY ────────────────────────────────────────────
export const residentRepository = {
  /**
   * Get resident profile
   */
  async getResidentProfile() {
    try {
      const user = await base44.auth.me();
      if (!user) return null;
      return user;
    } catch (error) {
      console.error('Error fetching resident profile:', error);
      return null;
    }
  },

  /**
   * Get resident's saved items
   */
  async getSavedItems(residentEmail: string): Promise<SharedMapItem[]> {
    try {
      const saves = await base44.entities.SaveAction.filter(
        { resident_id: residentEmail },
        '-created_at',
        100
      );

      if (!saves || saves.length === 0) return [];

      // Fetch the actual map items by entity_id
      const itemIds = saves.map((s) => s.entity_id);
      const items = await base44.entities.SharedMapItem.filter({
        entity_id: { $in: itemIds },
      });

      return items || [];
    } catch (error) {
      console.error('Error fetching saved items:', error);
      return [];
    }
  },

  /**
   * Save an item
   */
  async saveItem(entityId: string, entityType: string) {
    try {
      const user = await base44.auth.me();
      if (!user) throw new Error('User not authenticated');

      await base44.entities.SaveAction.create({
        resident_id: user.email,
        entity_id: entityId,
        entity_type: entityType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving item:', error);
      throw error;
    }
  },

  /**
   * Unsave an item
   */
  async unsaveItem(entityId: string) {
    try {
      const user = await base44.auth.me();
      if (!user) throw new Error('User not authenticated');

      const saves = await base44.entities.SaveAction.filter({
        resident_id: user.email,
        entity_id: entityId,
      });

      if (saves && saves.length > 0) {
        await base44.entities.SaveAction.delete(saves[0].id);
      }
    } catch (error) {
      console.error('Error unsaving item:', error);
      throw error;
    }
  },

  /**
   * Log analytics signal
   */
  async logSignal(signal: {
    source_type: string;
    action_type: string;
    entity_id?: string;
    entity_type?: string;
    campaign_id?: string;
  }) {
    try {
      await base44.entities.AnalyticsSignal.create({
        timestamp: new Date().toISOString(),
        source_type: signal.source_type,
        action_type: signal.action_type,
        ...signal,
      });
    } catch (error) {
      console.error('Error logging signal:', error);
      // Silent fail for analytics
    }
  },
};

// ── PARTNER REPOSITORY ─────────────────────────────────────────────
export const partnerRepository = {
  /**
   * Get partner campaigns with aggregated metrics
   */
  async getPartnerCampaigns(partnerId: string): Promise<any[]> {
    try {
      const campaigns = await base44.entities.Campaign.filter(
        { brand_id: partnerId, status: 'active' },
        '-start_date',
        50
      );
      return campaigns || [];
    } catch (error) {
      console.error('Error fetching partner campaigns:', error);
      return [];
    }
  },

  /**
   * Get campaign metrics (placeholder for aggregation)
   */
  async getCampaignMetrics(campaignId: string) {
    try {
      // Aggregate from AnalyticsSignal
      const signals = await base44.entities.AnalyticsSignal.filter(
        { campaign_id: campaignId },
        undefined,
        1000
      );

      const metrics = {
        impressions: signals?.filter((s) => s.action_type === 'impression').length || 0,
        scans: signals?.filter((s) => s.action_type === 'scan').length || 0,
        visits: signals?.filter((s) => s.action_type === 'visit').length || 0,
        redemptions: signals?.filter((s) => s.action_type === 'redemption').length || 0,
      };

      return metrics;
    } catch (error) {
      console.error('Error fetching campaign metrics:', error);
      return { impressions: 0, scans: 0, visits: 0, redemptions: 0 };
    }
  },
};