"use strict";
// Core schemas for AI-powered UI generation
// These types define the contract between AI and UI runtime
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLM_PROVIDERS = exports.UI_INTENTS = exports.UI_PRIMITIVES = void 0;
// Validation schemas
exports.UI_PRIMITIVES = [
    'text', 'card', 'table', 'chart', 'form', 'list'
];
exports.UI_INTENTS = [
    'summary', 'analysis', 'data', 'insight', 'action'
];
exports.LLM_PROVIDERS = ['ollama', 'openai', 'anthropic'];
