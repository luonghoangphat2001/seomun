<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\VirtualAccount;
use App\Services\VirtualAccountService;
use Illuminate\Http\Request;

class VirtualAccountController extends Controller
{
    public function __construct(
        protected VirtualAccountService $virtualAccountService,
    ) {}
    
}
