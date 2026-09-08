<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use App\Models\Billing\UdharEntry;
use App\Models\FcmToken;
use App\Models\NotificationLog;
use App\Services\FcmService;

class ProcessUdharReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'billing:process-udhar-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send FCM reminders for due udhar entries';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today    = Carbon::today();
        $tomorrow = Carbon::tomorrow();

        $entries = UdharEntry::where('status', '!=', 'cleared')
            ->where(function ($q) use ($today, $tomorrow) {
                $q->where(function ($q2) use ($today) {
                    $q2->whereDate('due_date', $today)
                        ->where('reminder_day_sent', 0);
                })->orWhere(function ($q2) use ($tomorrow) {
                    $q2->whereDate('due_date', $tomorrow)
                        ->where('reminder_day_before_sent', 0);
                });
            })->get();

        $fcmService = new FcmService();

        foreach ($entries as $entry) {
            $tokens = FcmToken::where('user_id', $entry->merchant_id)
                ->where('is_active', true)
                ->pluck('token');

            if ($tokens->isEmpty()) {
                continue;
            }

            $isToday = Carbon::parse($entry->due_date)->isToday();

            $data = [
                'type'           => 'udhar_reminder',
                'udhar_entry_id' => (string) $entry->id,
                'customer_name'  => $entry->customer_name,
                'amount'         => (string) $entry->amount,
                'customer_phone' => $entry->customer_phone,
            ];

            $title = "Udhar due — {$entry->customer_name}";
            $body  = "₹{$entry->amount}";

            foreach ($tokens as $token) {
                $fcmService->sendToDevice($token, $title, $body, $data, 'system');
            }

            NotificationLog::create([
                'user_id' => $entry->merchant_id,
                'sent_by' => $entry->merchant_id,
                'title'   => $title,
                'body'    => $body,
                'type'    => 'system',
                'status'  => 'sent',
                'sent_at' => now(),
            ]);

            if ($isToday) {
                $entry->update(['reminder_day_sent' => 1]);
            } else {
                $entry->update(['reminder_day_before_sent' => 1]);
            }
        }

        $this->info('Udhar reminders processed: ' . $entries->count() . ' entries checked.');

        return 0;
    }
}
