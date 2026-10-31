<?php

namespace App\Enums;

enum OrderItemDesignWorkflowStatus: string
{
    case PendingAssignment = 'pending_assignment';
    case Assigned = 'assigned';
    case InProgress = 'in_progress';
    case CustomerReview = 'customer_review';
    case RevisionRequested = 'revision_requested';
    case CustomerApproved = 'customer_approved';
}
