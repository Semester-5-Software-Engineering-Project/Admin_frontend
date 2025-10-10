import apiClient from '@/lib/axios';
import type { ApiResponse } from '@/types';

const DEBUG_MODULES = process.env.NEXT_PUBLIC_DEBUG_MODULES === 'true';

// Fetch total modules count
export async function fetchModuleCount(): Promise<number> {
  if (DEBUG_MODULES) console.log('[modulesAPI] fetchModuleCount: request -> /modules/count');
  try {
    const { data } = await apiClient.get<unknown>('/modules/count');
    if (DEBUG_MODULES) console.log('[modulesAPI] fetchModuleCount: raw response', data);

    const parseCount = (val: unknown): number | undefined => {
      if (typeof val === 'number') return val;
      if (typeof val === 'object' && val !== null && 'totalCount' in val) {
        const maybe = (val as { totalCount?: unknown }).totalCount;
        if (typeof maybe === 'number') return maybe;
      }
      return undefined;
    };

    const direct = parseCount(data);
    if (typeof direct === 'number') return direct;

    if (typeof data === 'object' && data !== null && 'data' in data) {
      const wrappedData = (data as ApiResponse<unknown> | { data?: unknown }).data;
      const inner = parseCount(wrappedData);
      if (typeof inner === 'number') return inner;
    }

    if (DEBUG_MODULES) console.warn('[modulesAPI] fetchModuleCount: unexpected shape', data);
    throw new Error('Unexpected module count response shape');
  } catch (err) {
    if (DEBUG_MODULES) console.error('[modulesAPI] fetchModuleCount: error', err);
    throw err;
  }
}

// Last-month modules growth percentage
// Primary path: /growthmodule/last-month per backend sample; includes fallback variant
export async function fetchModuleGrowthPercentLastMonth(): Promise<number> {
  const tryExtract = (data: unknown): number | undefined => {
    if (data && typeof data === 'object' && 'growthPercent' in data) {
      const raw = (data as { growthPercent?: unknown }).growthPercent;
      if (typeof raw === 'number') return raw;
      if (typeof raw === 'string') {
        const parsed = parseFloat(raw);
        if (!Number.isNaN(parsed)) return parsed;
      }
    }
    if (data && typeof data === 'object' && 'data' in data) {
      const wrapped = (data as ApiResponse<unknown> | { data?: unknown }).data as unknown;
      return tryExtract(wrapped);
    }
    return undefined;
  };

  const paths = ['/modules/growthmodule/last-month', '/modules/growth/last-month'];
  let lastErr: unknown = null;
  for (const p of paths) {
    try {
      const res = await apiClient.get<unknown>(p);
      const percent = tryExtract(res.data);
      if (typeof percent === 'number') return percent;
    } catch (e) {
      lastErr = e;
    }
  }
  if (lastErr) throw lastErr;
  throw new Error('Unexpected modules growth response shape');
}
