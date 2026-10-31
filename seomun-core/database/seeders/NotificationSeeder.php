<?php

namespace Database\Seeders;

use App\Models\NotificationHistory;
use App\Models\NotificationTemplate;
use App\Models\User;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $adminUser = User::first();

        $templatesData = [
            [
                'name' => 'Order Shipped - Email & SMS',
                'template_number' => 'NT-ORDER-SHIPPED',
                'channel_configs' => [
                    'email' => [
                        'title' => 'Your order has been shipped',
                        'body' => 'Dear {customer_name}, your order {order_number} has been shipped.',
                        'sender_email_address' => 'no-reply@example.com',
                        'variables' => ['customer_name', 'order_number'],
                    ],
                    'sms' => [
                        'content' => '[Seomun Core] {customer_name}, your order {order_number} has been shipped.',
                        'sender_number' => '01000000000',
                        'variables' => ['customer_name', 'order_number'],
                    ],
                ],
                'usage_status' => 'enabled',
            ],
            [
                'name' => 'Password Reset - Email',
                'template_number' => 'NT-PASSWORD-RESET',
                'channel_configs' => [
                    'email' => [
                        'title' => 'Password reset request',
                        'body' => 'Click the link below to reset your password for {email}.',
                        'sender_email_address' => 'no-reply@example.com',
                        'variables' => ['email'],
                    ],
                ],
                'usage_status' => 'enabled',
            ],
            [
                'name' => 'Monthly Report - Email (Disabled)',
                'template_number' => 'NT-MONTHLY-REPORT',
                'channel_configs' => [
                    'email' => [
                        'title' => 'Your monthly report is ready',
                        'body' => 'Dear {customer_name}, your monthly report is ready for download.',
                        'sender_email_address' => 'reports@example.com',
                        'variables' => ['customer_name'],
                    ],
                ],
                'usage_status' => 'disabled',
            ],
        ];

        $templates = [];

        foreach ($templatesData as $data) {
            $templates[] = NotificationTemplate::updateOrCreate(
                ['template_number' => $data['template_number']],
                [
                    'name' => $data['name'],
                    'channel_configs' => $data['channel_configs'],
                    'usage_status' => $data['usage_status'],
                    'created_by' => $adminUser?->id,
                ]
            );
        }

        // Create some history records for testing list & filters
        if (count($templates) > 0) {
            /** @var NotificationTemplate $orderTemplate */
            $orderTemplate = $templates[0];

            NotificationHistory::create([
                'notification_template_id' => $orderTemplate->id,
                'notification_type' => 'email',
                'recipient_name' => 'John Doe',
                'recipient_contact' => 'john@example.com',
                'message_title' => 'Your order has been shipped',
                'message_content' => 'Dear John Doe, your order #10001 has been shipped.',
                'sending_result' => 'success',
                'failure_reason' => null,
                'sender_id' => $adminUser?->id,
                'sent_at' => now()->subDay(),
                'meta' => [
                    'order_number' => '10001',
                    'customer_name' => 'John Doe',
                ],
            ]);

            NotificationHistory::create([
                'notification_template_id' => $orderTemplate->id,
                'notification_type' => 'sms',
                'recipient_name' => 'Jane Smith',
                'recipient_contact' => '01012345678',
                'message_title' => null,
                'message_content' => '[Seomun Core] Jane Smith, your order #10002 has been shipped.',
                'sending_result' => 'failure',
                'failure_reason' => 'Invalid phone number',
                'sender_id' => $adminUser?->id,
                'sent_at' => now()->subHours(12),
                'meta' => [
                    'order_number' => '10002',
                    'customer_name' => 'Jane Smith',
                ],
            ]);
        }
    }
}
