<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class StudentUserSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database with student users.
     * Student IDs are 8-digit numeric values.
     */
    public function run(): void
    {
        $students = [
            [
                'first_name' => 'Juan',
                'middle_name' => 'Miguel',
                'last_name' => 'Santos',
                'email' => 'juan.santos@example.com',
                'student_id' => '10001001',
                'contact_number' => '09123456789',
            ],
            [
                'first_name' => 'Maria',
                'middle_name' => 'Cruz',
                'last_name' => 'Reyes',
                'email' => 'maria.reyes@example.com',
                'student_id' => '10001002',
                'contact_number' => '09234567890',
            ],
            [
                'first_name' => 'Antonio',
                'middle_name' => 'Dela',
                'last_name' => 'Cruz',
                'email' => 'antonio.cruz@example.com',
                'student_id' => '10001003',
                'contact_number' => '09345678901',
            ],
            [
                'first_name' => 'Rosa',
                'middle_name' => 'Fernandez',
                'last_name' => 'Garcia',
                'email' => 'rosa.garcia@example.com',
                'student_id' => '10001004',
                'contact_number' => '09456789012',
            ],
            [
                'first_name' => 'Pedro',
                'middle_name' => 'Villegas',
                'last_name' => 'Mendoza',
                'email' => 'pedro.mendoza@example.com',
                'student_id' => '10001005',
                'contact_number' => '09567890123',
            ],
            [
                'first_name' => 'Angela',
                'middle_name' => 'Marie',
                'last_name' => 'Lim',
                'email' => 'angela.lim@example.com',
                'student_id' => '10001006',
                'contact_number' => '09678901234',
            ],
        ];

        foreach ($students as $studentData) {
            User::firstOrCreate(
                ['email' => $studentData['email']],
                [
                    'first_name' => $studentData['first_name'],
                    'middle_name' => $studentData['middle_name'],
                    'last_name' => $studentData['last_name'],
                    'suffix' => null,
                    'password' => Hash::make('password'),
                    'role' => 'student',
                    'student_id' => $studentData['student_id'],
                    'contact_number' => $studentData['contact_number'],
                ]
            );
        }

        $this->command->info('Student users seeded successfully with 8-digit numeric student IDs!');
    }
}
