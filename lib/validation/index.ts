/**
 * Main validation index - maintains backward compatibility
 * This file re-exports all schemas from the modular structure
 * allowing existing imports to continue working unchanged
 */

// Re-export from specific modules to avoid conflicts
export * from "./schemas/common";

// Post-related exports
export * from "./schemas/post";

// Comment-related exports
export * from "./schemas/comment";

// User-related exports
export * from "./schemas/user";

// Activity-related exports
export * from "./schemas/activity";

// Notification-related exports
export * from "./schemas/notification";
