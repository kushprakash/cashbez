<?php

namespace App\Services;

use App\Models\LeadActivity;
use App\Models\Lead;
use Illuminate\Http\Request;

class LeadActivityService
{
    /**
     * Log an automatic lead activity
     */
    public static function logActivity($leadId, $activityType, $details, $userId = null, $adminId = null, $nextFollowup = null, $extraData = [])
    {
        try {
            // Get current user if not provided
            if (!$userId && auth()->check()) {
                $userId = auth()->id();
            }

            // Get admin_id from request if available
            if (!$adminId && request()->has('admin')) {
                $adminId = request()->get('admin')->id ?? null;
            }

            $activityData = [
                'lead_id' => $leadId,
                'user_id' => $userId,
                'activity_type' => $activityType,
                'details' => $details,
                'next_followup' => $nextFollowup,
                'admin_id' => $adminId,
                'created_by' => $userId,
            ];

            // Merge extra followup data if provided
            if (!empty($extraData)) {
                $allowedFields = ['followup_type_id', 'followup_status_id', 'lead_status_id', 'followup_time', 'followup_notes'];
                foreach ($allowedFields as $field) {
                    if (isset($extraData[$field])) {
                        $activityData[$field] = $extraData[$field];
                    }
                }
            }

            return LeadActivity::create($activityData);
        } catch (\Exception $e) {
            // Log error but don't break the main process
            \Log::error('Failed to log lead activity: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Log lead creation
     */
    public static function logLeadCreated($leadId, $leadData, $userId = null, $adminId = null)
    {
        $details = "Lead created with name: {$leadData['name']}";
        if (isset($leadData['priority'])) {
            $details .= ", Priority: {$leadData['priority']}";
        }
        if (isset($leadData['phone'])) {
            $details .= ", Phone: {$leadData['phone']}";
        }
        if (isset($leadData['email'])) {
            $details .= ", Email: {$leadData['email']}";
        }

        return self::logActivity($leadId, 'lead_created', $details, $userId, $adminId);
    }

    /**
     * Log lead update
     */
    public static function logLeadUpdated($leadId, $oldData, $newData, $userId = null, $adminId = null)
    {
        $changes = [];
        
        // Track specific field changes
        $fieldsToTrack = ['name', 'phone', 'email', 'priority', 'status_id', 'assigned_user_id', 'source_id'];
        
        foreach ($fieldsToTrack as $field) {
            if (isset($oldData[$field]) && isset($newData[$field]) && $oldData[$field] != $newData[$field]) {
                $changes[] = "{$field}: '{$oldData[$field]}' → '{$newData[$field]}'";
            }
        }

        if (!empty($changes)) {
            $details = "Lead updated. Changes: " . implode(', ', $changes);
            return self::logActivity($leadId, 'lead_updated', $details, $userId, $adminId);
        }

        return null;
    }

    /**
     * Log lead assignment
     */
    public static function logLeadAssigned($leadId, $fromUserId, $toUserId, $reason = null, $userId = null, $adminId = null)
    {
        $details = "Lead assigned from User ID {$fromUserId} to User ID {$toUserId}";
        if ($reason) {
            $details .= ". Reason: {$reason}";
        }

        return self::logActivity($leadId, 'lead_assigned', $details, $userId, $adminId);
    }

    /**
     * Log lead status change
     */
    public static function logStatusChanged($leadId, $oldStatus, $newStatus, $userId = null, $adminId = null)
    {
        $details = "Lead status changed from '{$oldStatus}' to '{$newStatus}'";
        return self::logActivity($leadId, 'status_changed', $details, $userId, $adminId);
    }

    /**
     * Log followup created
     */
    public static function logFollowupCreated($leadId, $followupData, $userId = null, $adminId = null)
    {
        $details = "Follow-up scheduled for " . date('Y-m-d', strtotime($followupData['followup_date']));
        if (isset($followupData['notes']) && $followupData['notes']) {
            $details .= ". Notes: {$followupData['notes']}";
        }

        $nextFollowup = $followupData['followup_date'] ?? null;
        
        // Update the lead's followup_date to reflect the latest activity
        try {
            $lead = \App\Models\Lead::find($leadId);
            if ($lead) {
                $lead->update(['followup_date' => $nextFollowup]);
            }
        } catch (\Exception $e) {
            \Log::error('Failed to update lead followup_date: ' . $e->getMessage());
        }

        // Build extra data for activity logging
        $extraData = [
            'followup_type_id' => $followupData['followup_type_id'] ?? null,
            'followup_status_id' => $followupData['followup_status_id'] ?? null,
            'lead_status_id' => $followupData['lead_status_id'] ?? null,
            'followup_time' => $followupData['followup_time'] ?? null,
            'followup_notes' => $followupData['notes'] ?? null,
        ];
        
        return self::logActivity($leadId, 'followup_created', $details, $userId, $adminId, $nextFollowup, $extraData);
    }

    /**
     * Log followup completed
     */
    public static function logFollowupCompleted($leadId, $followupData, $userId = null, $adminId = null)
    {
        $details = "Follow-up completed";
        if (isset($followupData['notes']) && $followupData['notes']) {
            $details .= ". Notes: {$followupData['notes']}";
        }

        return self::logActivity($leadId, 'followup_completed', $details, $userId, $adminId);
    }

    /**
     * Log lead closed/won
     */
    public static function logLeadClosed($leadId, $reason = null, $userId = null, $adminId = null)
    {
        $details = "Lead closed/won";
        if ($reason) {
            $details .= ". Reason: {$reason}";
        }

        return self::logActivity($leadId, 'lead_closed', $details, $userId, $adminId);
    }

    /**
     * Log lead lost
     */
    public static function logLeadLost($leadId, $reason = null, $userId = null, $adminId = null)
    {
        $details = "Lead marked as lost";
        if ($reason) {
            $details .= ". Reason: {$reason}";
        }

        return self::logActivity($leadId, 'lead_lost', $details, $userId, $adminId);
    }

    /**
     * Log custom field update
     */
    public static function logCustomFieldUpdated($leadId, $fieldName, $oldValue, $newValue, $userId = null, $adminId = null)
    {
        $details = "Custom field '{$fieldName}' updated from '{$oldValue}' to '{$newValue}'";
        return self::logActivity($leadId, 'custom_field_updated', $details, $userId, $adminId);
    }

    /**
     * Log communication/call
     */
    public static function logCommunication($leadId, $type, $details, $userId = null, $adminId = null)
    {
        $activityDetails = "Communication - {$type}: {$details}";
        return self::logActivity($leadId, 'communication', $activityDetails, $userId, $adminId);
    }

    /**
     * Get activity timeline for a lead
     */
    public static function getLeadTimeline($leadId)
    {
        return LeadActivity::where('lead_id', $leadId)
            ->with(['user', 'createdBy', 'followupType', 'followupStatus', 'leadStatus'])
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
