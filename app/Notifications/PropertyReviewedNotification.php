<?php

namespace App\Notifications;

use App\Models\Property;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * E-mail to a property owner after the admin approved or rejected
 * the listing they submitted.
 *
 * Locally MAIL_MAILER=log, so the e-mail is written to storage/logs/laravel.log.
 */
class PropertyReviewedNotification extends Notification
{
    use Queueable;

    public function __construct(public Property $property, public bool $approved) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        if ($this->approved) {
            return (new MailMessage)
                ->subject('Your property is now live')
                ->greeting('Good news!')
                ->line("Your listing \"{$this->property->title}\" was approved and is now visible on our website.")
                ->action('View your listing', route('properties.show', $this->property));
        }

        return (new MailMessage)
            ->subject('Your property needs some changes')
            ->greeting('Hello!')
            ->line("Your listing \"{$this->property->title}\" was not approved yet.")
            ->line('Reason: '.$this->property->rejection_reason)
            ->line('Please edit the listing and submit it again.')
            ->action('Edit your listing', route('owner.properties.edit', $this->property));
    }
}
