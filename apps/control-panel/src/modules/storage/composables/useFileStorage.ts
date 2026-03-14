'use client';

/**
 * useFileStorage - Composable for file storage operations
 * Handles file listing, upload, download, and delete
 * PURE DI: Uses @cp/storage-manager labels and API from local api/
 */

import { useState, useCallback } from 'react';
import { STORAGE_LABELS } from '@cp/storage-manager';
import { useToast } from '@/modules/_core';
import { API } from '../api';
import type { StorageItem, FileStorageStats, ApiResponse } from '../types';
import { fetchWithCsrf } from '@/lib/csrf';

const MSG = STORAGE_LABELS.messages;

export function useFileStorage() {
    const { addToast } = useToast();
    const [files, setFiles] = useState<StorageItem[]>([]);
    const [stats, setStats] = useState<FileStorageStats | null>(null);
    const [currentPath, setCurrentPath] = useState('/');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const fetchFiles = useCallback(async (path = '/') => {
        setLoading(true);
        try {
            const [statsRes, filesRes] = await Promise.all([
                fetch(API.fileStats),
                fetch(`${API.files}?path=${path}`)
            ]);

            const [statsData, filesData]: [ApiResponse<FileStorageStats>, ApiResponse<StorageItem[]>] =
                await Promise.all([statsRes.json(), filesRes.json()]);

            if (statsData.status === 'success' && statsData.data) {
                setStats(statsData.data);
            }

            if (filesData.status === 'success') {
                setFiles(filesData.data || []);
            }

            setCurrentPath(path);
        } catch {
            addToast(MSG.loadFilesFailed, 'error');
        }
        setLoading(false);
    }, [addToast]);

    const uploadFile = useCallback(async (file: File) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('path', currentPath);

            const res = await fetchWithCsrf(API.upload, {
                method: 'POST',
                body: formData
            });

            const data = await res.json();
            if (data.status === 'success') {
                addToast(MSG.uploadSuccess, 'success');
                await fetchFiles(currentPath);
                setUploading(false);
                return true;
            } else {
                addToast(data.message || MSG.uploadFailed, 'error');
            }
        } catch {
            addToast(MSG.uploadFailed, 'error');
        }
        setUploading(false);
        return false;
    }, [currentPath, addToast, fetchFiles]);

    const createFolder = useCallback(async (name: string) => {
        try {
            const res = await fetchWithCsrf(API.folders, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, parentPath: currentPath })
            });

            const data = await res.json();
            if (data.status === 'success') {
                addToast(MSG.folderCreated, 'success');
                await fetchFiles(currentPath);
                return true;
            } else {
                addToast(data.message || MSG.folderCreateFailed, 'error');
            }
        } catch {
            addToast(MSG.folderCreateFailed, 'error');
        }
        return false;
    }, [currentPath, addToast, fetchFiles]);

    const deleteItem = useCallback(async (id: number) => {
        try {
            const res = await fetchWithCsrf(API.deleteFile(id), { method: 'DELETE' });
            const data = await res.json();

            if (data.status === 'success') {
                addToast(MSG.itemDeleted, 'success');
                await fetchFiles(currentPath);
                return true;
            } else {
                addToast(data.message || MSG.deleteFailed, 'error');
            }
        } catch {
            addToast(MSG.deleteFailed, 'error');
        }
        return false;
    }, [currentPath, addToast, fetchFiles]);

    const navigateTo = useCallback((path: string) => {
        fetchFiles(path);
    }, [fetchFiles]);

    return {
        files,
        stats,
        currentPath,
        loading,
        uploading,
        fetchFiles,
        uploadFile,
        createFolder,
        deleteItem,
        navigateTo,
        getDownloadUrl: API.download,
    };
}
