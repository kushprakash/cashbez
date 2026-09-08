<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UsersSeeder extends Seeder
{
    public function run()
    {
        DB::table('users')->insert([
            [
                'id' => 1,
                'mid' => 'CW0000001',
                'mkey' => 'cNGHE78SD3Qo1qBO91w28vtddB1JAuXo',
                'admin_mid' => '2',
                'mobile' => '9835153380',
                'name' => 'Lov Prakash',
                'email' => 'lovprakash03@gmail.com',
                'email_verified_at' => 0,
                'aadhar_verified_at' => 0,
                'password' => '$2y$12$BFTJm07B/nd5co3FVwBoxucGup9xFNS4SmL5vXh22uUXBKx9Esq4.',
                'aadhar_number' => null,
                'aadhar_data' => null,
                'role' => '1',
                'root' => '',
                'refer_by' => null,
                'status' => 1,
                'remember_token' => 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjgwMDAvYXBpL3ZlcmlmeS1vdHAiLCJpYXQiOjE3NTIyOTg3ODMsImV4cCI6MTc1MjMwMjM4MywibmJmIjoxNzUyMjk4NzgzLCJqdGkiOiJPeHZMRXp0TDJUd2JKaWZoIiwic3ViIjoiMSIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.tayj0BkV2wNrE3tpkKg1lqkn9b1DXvhiaygrwpEZYKI',
                'created_at' => '2025-07-05 02:33:32',
                'updated_at' => '2025-07-12 00:09:44'
            ],
            [
                'id' => 3,
                'mid' => 'CW0000002',
                'mkey' => 'cNGHE78SD3Qo1qBO9145654alkklsd1536w3465',
                'admin_mid' => '2',
                'mobile' => '7255818469',
                'name' => 'Kush Prakash',
                'email' => 'kushprakash92@gmail.com',
                'email_verified_at' => 0,
                'aadhar_verified_at' => 0,
                'password' => '$2y$12$BFTJm07B/nd5co3FVwBoxucGup9xFNS4SmL5vXh22uUXBKx9Esq4.',
                'aadhar_number' => null,
                'aadhar_data' => null,
                'role' => '2',
                'root' => '',
                'refer_by' => null,
                'status' => 1,
                'remember_token' => 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOi8vMTI3LjAuMC4xOjgwMDAvYXBpL3ZlcmlmeS1vdHAiLCJpYXQiOjE3NTE4OTYyNDcsImV4cCI6MTc1MTg5OTg0NywibmJmIjoxNzUxODk2MjQ3LCJqdGkiOiJmUHpBbU9oZEJ1eUN1VDJIIiwic3ViIjoiMyIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.scMjwIl0KOpEXvIp9oygXzs3S-JW9w_lchH-2Ev_GiQ',
                'created_at' => '2025-07-05 02:33:32',
                'updated_at' => '2025-07-07 10:35:56'
            ],
            [
                'id' => 10,
                'mid' => 'CW0000003',
                'mkey' => 'SzXhZTNTd7o7iq3ajvv4kXqNRseOaE42',
                'admin_mid' => 'CW0000002',
                'mobile' => '9939527762',
                'name' => 'Sonu Kumar Singh',
                'email' => 'sonu.enexa@gmail.com',
                'email_verified_at' => 0,
                'aadhar_verified_at' => 0,
                'password' => '$2y$12$JVzEsujc2PGyeR3CjZN50utjsV0/Nx01CqBbZBBryFopyt4.kMM42',
                'aadhar_number' => '965874123652',
                'aadhar_data' => null,
                'role' => '5',
                'root' => ',CW0000002',
                'refer_by' => 'CW0000002',
                'status' => 1,
                'remember_token' => null,
                'created_at' => '2025-07-07 11:10:25',
                'updated_at' => '2025-07-07 20:37:19'
            ],
            [
                'id' => 11,
                'mid' => 'CW0000004',
                'mkey' => '6ejhBwsO1KrCzj7VGkuYigrNwtNJt0Sc',
                'admin_mid' => 'CW0000002',
                'mobile' => '7903891905',
                'name' => 'Satyendra Kumar',
                'email' => 'satyendra.kumar033@gmail.com',
                'email_verified_at' => 0,
                'aadhar_verified_at' => 0,
                'password' => '$2y$12$JomJf1Pddv1grxQRn.JkvuKNEjrDCmU.jfP3OmcIkK3OU/EJ52b8W',
                'aadhar_number' => '854796321452',
                'aadhar_data' => null,
                'role' => '5',
                'root' => ',CW0000002',
                'refer_by' => 'CW0000002',
                'status' => 1,
                'remember_token' => null,
                'created_at' => '2025-07-07 20:38:52',
                'updated_at' => '2025-07-07 20:38:52'
            ]
        ]);
    }
}
