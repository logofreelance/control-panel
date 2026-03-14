/**
 * _core/config/messages.ts
 * 
 * Common toast/notification messages
 */

export const MESSAGES = {
    success: {
        created: 'Created successfully',
        updated: 'Changes saved',
        deleted: 'Deleted successfully',
        saved: 'Saved',
    },

    error: {
        generic: 'Something went wrong',
        network: 'Connection error',
        notFound: 'Not found',
        unauthorized: 'Unauthorized',
        validation: 'Please check your input',
        required: 'This field is required',
    },

    confirm: {
        delete: 'Are you sure you want to delete this?',
        discard: 'Discard unsaved changes?',
        archive: 'Archive this item?',
    },
};
