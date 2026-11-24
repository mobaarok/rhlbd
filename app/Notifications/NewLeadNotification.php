<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * E-mail sent to the business address (config('site.email')) whenever a
 * visitor submits an inquiry or a contact message.
 *
 * Usage:
 *   Notification::route('mail', config('site.email'))
 *       ->notify(new NewLeadNotification('New inquiry', ['Name: Jane'], url('/admin/inquiries')));
 *
 * Locally MAIL_MAILER=log, so the e-mail is written to storage/logs/laravel.log.
 */
class NewLeadNotification extends Notification
{
    use Queueable;

    /**
     * @param  array<int, string>  $lines  Each line becomes a paragraph in the e-mail
     */
    public function __construct(
        public string $subject,
        public array $lines,
        public string $actionUrl,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)->subject($this->subject)->greeting($this->subject);

        foreach ($this->lines as $line) {
            $mail->line($line);
        }

        return $mail->action('Open admin panel', $this->actionUrl);
    }
}
