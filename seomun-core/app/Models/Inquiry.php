<?php

namespace App\Models;

use App\Contracts\NotifiableSubject;
use App\Enums\InquiryCategory;
use App\Enums\InquiryStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Traits\LogsActivity;

class Inquiry extends Model implements NotifiableSubject
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected $fillable = [
        'user_id',
        'product_id',
        'category',
        'title',
        'content',
        'order_number',
        'contact',
        'manager_name',
        'status',
        'replied_by',
        'reply_contact_phone',
        'reply_content',
        'is_edited_reply',
    ];

    protected $casts = [
        'category' => InquiryCategory::class,
        'status' => InquiryStatus::class,
    ];

    /**
     * Get the user that owns the inquiry.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the product that this inquiry is about.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the comments for the inquiry.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(InquiryComment::class)->orderBy('created_at');
    }

    public function notificationDeliveries(): MorphMany
    {
        return $this->morphMany(NotificationDelivery::class, 'subject');
    }

    /**
     * Get the attachments for the inquiry.
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(InquiryAttachment::class);
    }

    /**
     * Get the internal memos for the inquiry.
     */
    public function internalMemos(): HasMany
    {
        return $this->hasMany(InquiryInternalMemo::class)->orderByDesc('created_at');
    }

    public function repliedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'replied_by');
    }

    /**
     * Scope a query to filter by category.
     */
    public function scopeOfCategory($query, ?string $category)
    {
        if ($category) {
            return $query->where('category', $category);
        }

        return $query;
    }

    /**
     * Scope a query to filter by status.
     */
    public function scopeOfStatus($query, ?string $status)
    {
        if ($status) {
            return $query->where('status', $status);
        }

        return $query;
    }

    /**
     * Scope a query to search by title or content.
     */
    public function scopeSearch($query, ?string $search)
    {
        if ($search) {
            return $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        return $query;
    }

    /**
     * Scope a query to order by latest first.
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    /**
     * Inquiry new (status pending)
     *
     * @return bool
     */
    public function isPending()
    {
        return $this->status === InquiryStatus::PENDING;
    }

    /**
     * Get formatted inquiry number (e.g. 2026-115).
     */
    public function getInquiryNumberAttribute(): ?string
    {
        if (! $this->id || ! $this->created_at) {
            return null;
        }

        $year = $this->created_at->format('Y');

        return "{$year}-{$this->id}";
    }

    /**
     * Configure activity log options for inquiry audit logs.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('inquiry')
            ->logOnly([
                'title',
                'content',
                'order_number',
                'contact',
                'status',
                'replied_by',
                'reply_contact_phone',
                'reply_content',
                'is_edited_reply',
            ])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn (string $eventName) => "Inquiry has been {$eventName}");
    }

    public function tapActivity(Activity $activity): void
    {
        // You can extend later to include IP, reason, etc.
    }

    // NotifiableSubject interface implementations
    public function getNotificationReference(): string
    {
        return $this->order_number ?? ('INQ-' . $this->id);
    }
    public function getNotificationMeta(): array
    {
        return ['inquiry_id' => $this->id, 'order_number' => $this->order_number];
    }
    public function getNotificationPhone(): ?string
    {
        return $this->user?->mobile ?? $this->user?->phone ?? null;
    }

    public function getNotificationEmail(): ?string
    {
        return $this->user?->email ?? null;
    }
    public function getNotificationName(): string
    {
        return $this->user?->name ?? '';
    }

    public function getNotificationUserId(): ?int
    {
        return $this->user_id ? (int) $this->user_id : null;
    }
}
