<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * An e-mail address subscribed to the newsletter.
 *
 * @property int $id
 * @property string $email
 */
#[Fillable(['email'])]
class Subscriber extends Model
{
    //
}
