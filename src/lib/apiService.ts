import { apiClient, apiEndpoints } from './api';
import type { Machine, ChangeLog } from './mockData';

// API Service Functions
export const apiService = {
  // Get all machines
  async getMachines(): Promise<Machine[]> {
    try {
      return await apiClient.get<Machine[]>(apiEndpoints.machines);
    } catch (error) {
      console.error('Failed to fetch machines:', error);
      throw new Error('Failed to load machines');
    }
  },

  // Get change logs for a specific machine
  async getMachineChangeLogs(machineId: string): Promise<ChangeLog[]> {
    try {
      return await apiClient.get<ChangeLog[]>(apiEndpoints.machineChangeLogs(machineId));
    } catch (error) {
      console.error(`Failed to fetch change logs for machine ${machineId}:`, error);
      throw new Error('Failed to load change logs');
    }
  },

  // Get all change logs
  async getAllChangeLogs(): Promise<ChangeLog[]> {
    try {
      return await apiClient.get<ChangeLog[]>(apiEndpoints.changeLogs);
    } catch (error) {
      console.error('Failed to fetch all change logs:', error);
      throw new Error('Failed to load change logs');
    }
  },

  // Get reports
  async getReports(): Promise<any> {
    try {
      return await apiClient.get<any>(apiEndpoints.reports);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      throw new Error('Failed to load reports');
    }
  },

  // Create a new machine
  async createMachine(machine: Omit<Machine, 'id'>): Promise<Machine> {
    try {
      return await apiClient.post<Machine>(apiEndpoints.machines, machine);
    } catch (error) {
      console.error('Failed to create machine:', error);
      throw new Error('Failed to create machine');
    }
  },

  // Update a machine
  async updateMachine(machineId: string, updates: Partial<Machine>): Promise<Machine> {
    try {
      return await apiClient.put<Machine>(`${apiEndpoints.machines}/${machineId}`, updates);
    } catch (error) {
      console.error(`Failed to update machine ${machineId}:`, error);
      throw new Error('Failed to update machine');
    }
  },

  // Delete a machine
  async deleteMachine(machineId: string): Promise<void> {
    try {
      await apiClient.delete<void>(`${apiEndpoints.machines}/${machineId}`);
    } catch (error) {
      console.error(`Failed to delete machine ${machineId}:`, error);
      throw new Error('Failed to delete machine');
    }
  },
};
