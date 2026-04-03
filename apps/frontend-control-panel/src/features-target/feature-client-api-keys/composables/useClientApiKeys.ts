/**
 * feature-client-api-keys - useClientApiKeys
 *
 * Composable untuk CRUD operations pada API Keys.
 * Menggunakan backend routes yang benar (/api/api-keys).
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/modules/_core";
import { CLIENT_API_ROUTES } from "../api/routes";
import type { ClientApiKey } from "../types";

export function useClientApiKeys(targetId?: string) {
  const { addToast } = useToast();
  const [keys, setKeys] = useState<ClientApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Ref for stable toast reference
  const toastRef = useRef(addToast);
  const hasDataRef = useRef(false);

  useEffect(() => {
    toastRef.current = addToast;
  }, [addToast]);

  const fetchKeys = useCallback(async () => {
    if (!targetId) return;
    if (!hasDataRef.current) {
      setLoading(true);
    }

    try {
      const res = await fetch(CLIENT_API_ROUTES.apiKeys.list, {
        headers: { "x-target-id": targetId as string },
      });
      const data = await res.json();

      if (data.status === "success") {
        setKeys(data.data || []);
        hasDataRef.current = true;
      } else {
        toastRef.current(data.message || "Failed to fetch API keys", "error");
      }
    } catch (err) {
      toastRef.current("Failed to fetch API keys", "error");
    }

    setLoading(false);
  }, [targetId]);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const createKey = async (name: string): Promise<string | null> => {
    if (!targetId) return null;
    setSubmitting(true);

    try {
      const res = await fetch(CLIENT_API_ROUTES.apiKeys.create, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-target-id": targetId as string,
        },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (data.status === "success") {
        toastRef.current("API Key created successfully", "success");
        fetchKeys();
        return data.data?.key || null;
      } else {
        toastRef.current(data.message || "Failed to create API key", "error");
        return null;
      }
    } catch (err) {
      toastRef.current("Failed to create API key", "error");
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteKey = async (id: string) => {
    if (!targetId) return;
    setSubmitting(true);

    try {
      const res = await fetch(CLIENT_API_ROUTES.apiKeys.delete(id), {
        method: "DELETE",
        headers: { "x-target-id": targetId as string },
      });

      const data = await res.json();

      if (data.status === "success") {
        toastRef.current("API Key deleted successfully", "success");
        fetchKeys();
      } else {
        toastRef.current(data.message || "Failed to delete API key", "error");
      }
    } catch (err) {
      toastRef.current("Failed to delete API key", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleKey = async (id: string, isActive: boolean) => {
    if (!targetId) return;
    setSubmitting(true);

    try {
      const res = await fetch(CLIENT_API_ROUTES.apiKeys.toggle(id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-target-id": targetId as string,
        },
        body: JSON.stringify({ isActive }),
      });

      const data = await res.json();

      if (data.status === "success") {
        toastRef.current("API Key status updated", "success");
        fetchKeys();
      } else {
        toastRef.current(data.message || "Failed to update API key", "error");
      }
    } catch (err) {
      toastRef.current("Failed to update API key", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    keys,
    loading,
    submitting,
    createKey,
    deleteKey,
    toggleKey,
    refetch: fetchKeys,
  };
}
