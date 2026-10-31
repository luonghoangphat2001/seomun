<?php

namespace App\Contracts;

/**
 * Represents the subject of a notification — the entity (order, member, inquiry, etc.)
 * that provides context for routing and logging the notification.
 *
 * Implementing this interface allows non-Order entities to be used as notification subjects
 * in BaseNotificationService without needing a dummy Order object.
 */
interface NotifiableSubject
{
    /**
     * A unique reference number used for logging (e.g. order number, member ID, inquiry ID).
     */
    public function getNotificationReference(): string;

    /**
     * Key-value metadata to store in NotificationHistory.meta (e.g. ['order_number' => 'ORD-123']).
     * Defaults to ['reference' => getNotificationReference()] if not overridden.
     *
     * @return array<string, mixed>
     */
    public function getNotificationMeta(): array;

    /**
     * Fallback phone number when no recipientOverride is provided.
     */
    public function getNotificationPhone(): ?string;

    public function getNotificationEmail(): ?string;

    /**
     * Fallback recipient name when no recipientOverride is provided.
     */
    public function getNotificationName(): string;

    /**
     * The user (member) ID associated with this notification subject.
     * Used for logging Client/Member ID in notification history.
     */
    public function getNotificationUserId(): ?int;
}
