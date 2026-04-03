/**
 * feature-client-api-keys - useCorsDomains
 *
 * Composable untuk CRUD operations pada CORS Domains.
 * Menggunakan backend routes yang benar (/api/cors).
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/modules/_core";
import { CLIENT_API_ROUTES } from "../api/routes";
import type { CorsDomain } from "../types";

export function useCorsDomains(targetId?: string) {
  const { addToast } = useToast();
  const [domains, setDomains] = useState<CorsDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Ref for stable toast reference
  const toastRef = useRef(addToast);
  const hasDataRef = useRef(false);

  useEffect(() => {
    toastRef.current = addToast;
  }, [addToast]);

  const fetchDomains = useCallback(async () => {
    if (!targetId) return;
    if (!hasDataRef.current) {
      setLoading(true);
    }

    try {
      const res = await fetch(CLIENT_API_ROUTES.cors.list, {
        headers: { "x-target-id": targetId as string },
      });
      const data = await res.json();

      if (data.status === "success") {
        setDomains(data.data || []);
        hasDataRef.current = true;
      } else {
        toastRef.current(
          data.message || "Failed to fetch CORS domains",
          "error",
        );
      }
    } catch (err) {
      toastRef.current("Failed to fetch CORS domains", "error");
    }

    setLoading(false);
  }, [targetId]);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const createDomain = async (
    domainUrl: string,
    description?: string,
  ): Promise<boolean> => {
    if (!targetId) return false;
    setSubmitting(true);

    try {
      const res = await fetch(CLIENT_API_ROUTES.cors.create, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-target-id": targetId as string,
        },
        body: JSON.stringify({ domain_url: domainUrl, description }),
      });

      const data = await res.json();

      if (data.status === "success") {
        toastRef.current("CORS domain added successfully", "success");
        fetchDomains();
        return true;
      } else {
        toastRef.current(data.message || "Failed to add CORS domain", "error");
        return false;
      }
    } catch (err) {
      toastRef.current("Failed to add CORS domain", "error");
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteDomain = async (id: string) => {
    if (!targetId) return;
    setSubmitting(true);

    try {
      const res = await fetch(CLIENT_API_ROUTES.cors.delete(id), {
        method: "DELETE",
        headers: { "x-target-id": targetId as string },
      });

      const data = await res.json();

      if (data.status === "success") {
        toastRef.current("CORS domain deleted successfully", "success");
        fetchDomains();
      } else {
        toastRef.current(
          data.message || "Failed to delete CORS domain",
          "error",
        );
      }
    } catch (err) {
      toastRef.current("Failed to delete CORS domain", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDomain = async (id: string, isActive: boolean) => {
    if (!targetId) return;
    setSubmitting(true);

    try {
      const res = await fetch(CLIENT_API_ROUTES.cors.toggle(id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-target-id": targetId as string,
        },
        body: JSON.stringify({ isActive }),
      });

      const data = await res.json();

      if (data.status === "success") {
        toastRef.current("CORS domain status updated", "success");
        fetchDomains();
      } else {
        toastRef.current(
          data.message || "Failed to update CORS domain",
          "error",
        );
      }
    } catch (err) {
      toastRef.current("Failed to update CORS domain", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    domains,
    loading,
    submitting,
    createDomain,
    deleteDomain,
    toggleDomain,
    refetch: fetchDomains,
  };
}
