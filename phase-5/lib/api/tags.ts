// lib/api/tags.ts

import apiClient from './client';
import { Tag } from '@/types/todo';

/**
 * Create a new tag or get existing tag with same name
 */
export async function createTag(name: string): Promise<Tag> {
  const response = await apiClient.post<Tag>('/tags/', { name });
  return response.data;
}

/**
 * Get all tags for the authenticated user
 */
export async function getTags(includeCount: boolean = false): Promise<Tag[]> {
  const response = await apiClient.get<Tag[]>(`/tags/${includeCount ? '?include_count=true' : ''}`);
  return response.data;
}

/**
 * Search tags by name with autocomplete
 */
export async function searchTags(query: string, limit: number = 10): Promise<Tag[]> {
  const response = await apiClient.get<Tag[]>(`/tags/search?query=${encodeURIComponent(query)}&limit=${limit}`);
  return response.data;
}

/**
 * Get a specific tag by ID
 */
export async function getTag(id: number): Promise<Tag> {
  const response = await apiClient.get<Tag>(`/tags/${id}/`);
  return response.data;
}

/**
 * Delete a tag (removes from all todos)
 */
export async function deleteTag(id: number): Promise<void> {
  await apiClient.delete(`/tags/${id}/`);
}
