const API_BASE_URL = 'http://localhost:3001/api';

export interface Entity {
  id: string;
  type: string;
  patterns: string[][];
  className: string;
}

export interface Environment {
  id: string;
  type: string;
  patterns: string[];
}

export interface GuardianTrait {
  id: string;
  type: string;
  values: string[];
}

export const api = {
  async getEntities(): Promise<Entity[]> {
    const response = await fetch(`${API_BASE_URL}/entities`);
    if (!response.ok) throw new Error('Failed to fetch entities');
    return response.json();
  },

  async getEnvironments(): Promise<Environment[]> {
    const response = await fetch(`${API_BASE_URL}/environments`);
    if (!response.ok) throw new Error('Failed to fetch environments');
    return response.json();
  },

  async getGuardianTraits(): Promise<GuardianTrait[]> {
    const response = await fetch(`${API_BASE_URL}/guardian-traits`);
    if (!response.ok) throw new Error('Failed to fetch guardian traits');
    return response.json();
  }
}; 