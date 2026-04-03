/**
 * @repo/frontend-form-utils
 * 
 * Generic form state management hook
 */

import { useState, useCallback, ChangeEvent } from 'react';

export interface UseFormOptions<T> {
    /** Initial form values */
    initialValues: T;
    /** Validation function */
    validate?: (values: T) => Record<string, string>;
    /** Called on successful submit */
    onSubmit?: (values: T) => void | Promise<void>;
}

export interface UseFormReturn<T> {
    // State
    values: T;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    isSubmitting: boolean;
    isDirty: boolean;

    // Field handlers
    handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleBlur: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    setFieldValue: (field: keyof T, value: any) => void;
    setFieldError: (field: keyof T, error: string) => void;
    setFieldTouched: (field: keyof T, touched?: boolean) => void;

    // Form actions
    handleSubmit: (e?: React.FormEvent) => Promise<void>;
    reset: (newValues?: T) => void;
    setValues: React.Dispatch<React.SetStateAction<T>>;

    // Helpers
    getFieldProps: (field: keyof T) => {
        name: string;
        value: any;
        onChange: (e: ChangeEvent<any>) => void;
        onBlur: (e: ChangeEvent<any>) => void;
    };
    hasError: (field: keyof T) => boolean;
}

/**
 * Generic form management hook
 */
export function useForm<T extends Record<string, any>>(
    options: UseFormOptions<T>
): UseFormReturn<T> {
    const { initialValues, validate, onSubmit } = options;

    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [initialState] = useState(initialValues);

    const isDirty = JSON.stringify(values) !== JSON.stringify(initialState);

    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setValues(prev => ({ ...prev, [name]: finalValue }));
    }, []);

    const handleBlur = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
    }, []);

    const setFieldValue = useCallback((field: keyof T, value: any) => {
        setValues(prev => ({ ...prev, [field]: value }));
    }, []);

    const setFieldError = useCallback((field: keyof T, error: string) => {
        setErrors(prev => ({ ...prev, [field as string]: error }));
    }, []);

    const setFieldTouched = useCallback((field: keyof T, isTouched = true) => {
        setTouched(prev => ({ ...prev, [field as string]: isTouched }));
    }, []);

    const handleSubmit = useCallback(async (e?: React.FormEvent) => {
        e?.preventDefault();

        // Validate all fields
        if (validate) {
            const validationErrors = validate(values);
            setErrors(validationErrors);

            // Touch all fields
            const allTouched = Object.keys(values).reduce((acc, key) => {
                acc[key] = true;
                return acc;
            }, {} as Record<string, boolean>);
            setTouched(allTouched);

            if (Object.keys(validationErrors).length > 0) {
                return;
            }
        }

        if (onSubmit) {
            setIsSubmitting(true);
            try {
                await onSubmit(values);
            } finally {
                setIsSubmitting(false);
            }
        }
    }, [values, validate, onSubmit]);

    const reset = useCallback((newValues?: T) => {
        setValues(newValues ?? initialValues);
        setErrors({});
        setTouched({});
        setIsSubmitting(false);
    }, [initialValues]);

    const getFieldProps = useCallback((field: keyof T) => ({
        name: field as string,
        value: values[field],
        onChange: handleChange,
        onBlur: handleBlur,
    }), [values, handleChange, handleBlur]);

    const hasError = useCallback((field: keyof T) => {
        return touched[field as string] && !!errors[field as string];
    }, [touched, errors]);

    return {
        values,
        errors,
        touched,
        isSubmitting,
        isDirty,
        handleChange,
        handleBlur,
        setFieldValue,
        setFieldError,
        setFieldTouched,
        handleSubmit,
        reset,
        setValues,
        getFieldProps,
        hasError,
    };
}
