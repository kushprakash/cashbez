<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Email;
use App\Models\EmailRecipient;
use App\Models\EmailThread;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class EmailSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get some users for testing
        $users = User::limit(5)->get();
        
        if ($users->count() < 2) {
            $this->command->error('Need at least 2 users in the database to create sample emails');
            return;
        }

        $sender = $users->first();
        $recipients = $users->skip(1);

        // Sample emails data
        $emailsData = [
            [
                'subject' => 'Welcome to our CRM system',
                'body' => '<p>Dear team,</p><p>Welcome to our new CRM system! This email system will help us communicate more effectively and manage our customer relationships better.</p><p>Best regards,<br>Admin Team</p>',
                'priority' => 'high',
                'is_important' => true
            ],
            [
                'subject' => 'Weekly team meeting reminder',
                'body' => '<p>Hi everyone,</p><p>Just a friendly reminder about our weekly team meeting scheduled for tomorrow at 10:00 AM in the conference room.</p><p>Agenda:</p><ul><li>Project updates</li><li>New client requirements</li><li>Q&A session</li></ul><p>See you there!</p>',
                'priority' => 'normal',
                'is_important' => false
            ],
            [
                'subject' => 'New lead assignment',
                'body' => '<p>Hello,</p><p>A new lead has been assigned to you. Please review the details and follow up within 24 hours.</p><p>Lead details:</p><ul><li>Company: Tech Solutions Inc.</li><li>Contact: John Smith</li><li>Email: john@techsolutions.com</li><li>Phone: +1-555-0123</li></ul><p>Thanks!</p>',
                'priority' => 'high',
                'is_important' => true
            ],
            [
                'subject' => 'Monthly sales report',
                'body' => '<p>Team,</p><p>Please find attached the monthly sales report for review. Key highlights:</p><ul><li>Total sales: $125,000</li><li>New customers: 15</li><li>Conversion rate: 12%</li></ul><p>Great work everyone!</p>',
                'priority' => 'normal',
                'is_important' => false
            ],
            [
                'subject' => 'System maintenance notification',
                'body' => '<p>Dear users,</p><p>We will be performing scheduled maintenance on the CRM system this weekend from 2:00 AM to 6:00 AM.</p><p>During this time, the system will be unavailable. We apologize for any inconvenience.</p><p>IT Team</p>',
                'priority' => 'low',
                'is_important' => false
            ]
        ];

        DB::beginTransaction();
        
        try {
            foreach ($emailsData as $index => $emailData) {
                // Create email
                $email = Email::create([
                    'sender_id' => $sender->id,
                    'subject' => $emailData['subject'],
                    'body' => $emailData['body'],
                    'is_draft' => false,
                    'sent_at' => now()->subDays(rand(0, 7))->subHours(rand(0, 23)),
                    'priority' => $emailData['priority'],
                    'has_attachments' => false,
                    'email_type' => 'internal'
                ]);

                // Create recipients
                foreach ($recipients->take(rand(1, 3)) as $recipient) {
                    EmailRecipient::create([
                        'email_id' => $email->id,
                        'user_id' => $recipient->id,
                        'recipient_type' => 'to',
                        'folder_type' => 'inbox',
                        'is_read' => rand(0, 1),
                        'is_starred' => $emailData['is_important'] ? rand(0, 1) : false,
                        'read_at' => rand(0, 1) ? now()->subHours(rand(1, 24)) : null
                    ]);
                }
            }

            // Create some drafts
            for ($i = 0; $i < 3; $i++) {
                Email::create([
                    'sender_id' => $sender->id,
                    'subject' => 'Draft email ' . ($i + 1),
                    'body' => '<p>This is a draft email that hasn\'t been sent yet...</p>',
                    'is_draft' => true,
                    'priority' => 'normal',
                    'has_attachments' => false,
                    'email_type' => 'internal'
                ]);
            }

            // Create a thread with replies
            $originalEmail = Email::create([
                'sender_id' => $recipients->first()->id,
                'subject' => 'Project discussion',
                'body' => '<p>Hi team,</p><p>I wanted to discuss the upcoming project timeline. When can we schedule a meeting?</p>',
                'is_draft' => false,
                'sent_at' => now()->subDays(2),
                'priority' => 'normal',
                'has_attachments' => false,
                'email_type' => 'internal'
            ]);

            // Create thread
            $thread = EmailThread::create([
                'subject' => $originalEmail->subject,
                'participants' => [$originalEmail->sender_id, $sender->id],
                'last_email_id' => $originalEmail->id,
                'last_activity_at' => $originalEmail->sent_at
            ]);

            $originalEmail->update(['thread_id' => $thread->id]);

            // Add recipient for original email
            EmailRecipient::create([
                'email_id' => $originalEmail->id,
                'user_id' => $sender->id,
                'recipient_type' => 'to',
                'folder_type' => 'inbox',
                'is_read' => true,
                'read_at' => now()->subDays(2)->addHours(1)
            ]);

            // Create reply
            $replyEmail = Email::create([
                'sender_id' => $sender->id,
                'subject' => 'Re: ' . $originalEmail->subject,
                'body' => '<p>Hi,</p><p>Sure! How about Thursday at 2 PM? That works for me.</p><p>Thanks!</p>',
                'is_draft' => false,
                'sent_at' => now()->subDays(1),
                'reply_to_id' => $originalEmail->id,
                'thread_id' => $thread->id,
                'priority' => 'normal',
                'has_attachments' => false,
                'email_type' => 'internal'
            ]);

            // Add recipient for reply
            EmailRecipient::create([
                'email_id' => $replyEmail->id,
                'user_id' => $recipients->first()->id,
                'recipient_type' => 'to',
                'folder_type' => 'inbox',
                'is_read' => false
            ]);

            // Update thread
            $thread->update([
                'last_email_id' => $replyEmail->id,
                'last_activity_at' => $replyEmail->sent_at
            ]);

            DB::commit();
            
            $this->command->info('Email seeder completed successfully!');
            $this->command->info('Created sample emails, drafts, and a conversation thread.');
            
        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Error seeding emails: ' . $e->getMessage());
        }
    }
}
