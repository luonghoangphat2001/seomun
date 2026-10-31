<?php

namespace App\Constants;

/**
 * Webhook API Error Codes
 *
 * Format: {CATEGORY}{3-digit-number}
 *
 * Categories:
 *   AUTH  — Authentication / authorization errors
 *   VAL   — Validation / input errors
 *   ORD   — Order business logic errors
 *   DES   — Design file errors
 *   ERP   — ERP sync errors
 *   SYS   — Internal / unexpected errors
 */
class WebhookErrorCode
{
    // ─── AUTH ────────────────────────────────────────────────────────────────────
    /** Missing or invalid X-API-Key header */
    public const AUTH001 = 'AUTH001';

    /** API key does not match any active customer */
    public const AUTH002 = 'AUTH002';

    // ─── VAL ─────────────────────────────────────────────────────────────────────
    /** Required field missing or invalid format */
    public const VAL001 = 'VAL001';

    /** order_code / item_code not found in system */
    public const VAL002 = 'VAL002';

    /** size_option_id not found */
    public const VAL003 = 'VAL003';

    // ─── ORD ─────────────────────────────────────────────────────────────────────
    /** Order not found by external_order_id */
    public const ORD001 = 'ORD001';

    /** Order cannot be updated — status is not pending */
    public const ORD002 = 'ORD002';

    /** Order cannot be approved — status is not pending */
    public const ORD003 = 'ORD003';

    /** Order is already assigned to a group */
    public const ORD004 = 'ORD004';

    /** One or more order IDs not found */
    public const ORD005 = 'ORD005';

    /** Order cannot be rejected — status does not allow rejection */
    public const ORD006 = 'ORD006';

    /** No order group found for the given external order IDs */
    public const ORD007 = 'ORD007';

    /** Order group has already been synced to ERP successfully */
    public const ORD008 = 'ORD008';

    // ─── DES ─────────────────────────────────────────────────────────────────────
    /** Design file cannot be updated — order is not in an updatable status */
    public const DES001 = 'DES001';

    /** Design file URL is unreachable or download failed */
    public const DES002 = 'DES002';

    // ─── ERP ─────────────────────────────────────────────────────────────────────
    /** ERP sync failed — see message for details */
    public const ERP001 = 'ERP001';

    // ─── SYS ─────────────────────────────────────────────────────────────────────
    /** Unexpected internal server error */
    public const SYS001 = 'SYS001';

    /**
     * Return a structured error payload for use in responseError().
     */
    public static function make(string $code, string $message): array
    {
        return [
            'error_code' => $code,
            'message' => $message,
        ];
    }
}
