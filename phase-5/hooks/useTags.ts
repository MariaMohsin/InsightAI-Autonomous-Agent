// hooks/useTags.ts

import { useState, useEffect } from 'react';
import { getTags, createTag, deleteTag as deleteTagApi } from '@/lib/api/tags';
import { Tag } from '@/types/todo';
import toast from 'react-hot-toast';

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch tags on mount
  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setIsLoading(true);
      const data = await getTags();
      setTags(data);
    } catch (error: any) {
      console.error('Failed to fetch tags:', error);
      setTags([]);
      toast.error('Failed to load tags');
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = async (name: string) => {
    try {
      const newTag = await createTag(name);
      // Check if tag already exists in local state
      const exists = tags.some(t => t.id === newTag.id);
      if (!exists) {
        setTags((prev) => [...prev, newTag]);
      }
      return newTag;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to create tag';
      toast.error(message);
      throw error;
    }
  };

  const deleteTag = async (id: number) => {
    try {
      await deleteTagApi(id);
      setTags((prev) => prev.filter((tag) => tag.id !== id));
      toast.success('Tag deleted');
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to delete tag';
      toast.error(message);
      throw error;
    }
  };

  return {
    tags,
    isLoading,
    fetchTags,
    addTag,
    deleteTag,
  };
}
