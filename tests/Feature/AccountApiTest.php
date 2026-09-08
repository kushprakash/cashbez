<?php

namespace Tests\Feature;

use App\Models\Account;
use App\Models\Passbook;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class AccountApiTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
    }

    /** @test */
    public function test_user_can_get_accounts()
    {
        // Create test accounts
        Account::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'Test Account',
            'number' => '1234567890',
            'balance' => 1000.00
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->getJson('/api/accounts');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'accounts' => [
                        '*' => [
                            'id',
                            'name',
                            'number',
                            'balance',
                            'available_balance'
                        ]
                    ]
                ]
            ]);
    }

    /** @test */
    public function test_user_can_create_account()
    {
        $accountData = [
            'user_id' => $this->user->id,
            'name' => 'New Account',
            'number' => '9876543210',
            'initial_balance' => 500.00
        ];

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/accounts', $accountData);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'account' => [
                        'id',
                        'name',
                        'number',
                        'balance'
                    ]
                ]
            ]);

        $this->assertDatabaseHas('accounts', [
            'user_id' => $this->user->id,
            'name' => 'New Account',
            'number' => '9876543210'
        ]);
    }

    /** @test */
    public function test_user_can_create_transaction()
    {
        $account = Account::factory()->create([
            'user_id' => $this->user->id,
            'balance' => 1000.00
        ]);

        $transactionData = [
            'account_id' => $account->id,
            'description' => 'Test transaction',
            'type' => 'DR',
            'amount' => 100.00
        ];

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/passbook/transaction', $transactionData);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'transaction' => [
                        'id',
                        'description',
                        'type',
                        'amount',
                        'balance'
                    ]
                ]
            ]);

        $this->assertDatabaseHas('passbooks', [
            'account_id' => $account->id,
            'description' => 'Test transaction',
            'type' => 'DR',
            'amount' => 100.00
        ]);
    }
}
