<?php

namespace Database\Seeders;

use App\Models\TORRequest;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TORRequestSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database with sample TOR requests.
     */
    public function run(): void
    {
        // Get all student users
        $students = User::where('role', 'student')->get();
        
        if ($students->isEmpty()) {
            $this->command->info('No student users found. Please seed student users first.');
            return;
        }

        // Sample data for TOR requests
        $sampleRequests = [
            [
                'full_name' => 'John Michael Santos',
                'birthplace' => 'Manila, Philippines',
                'birthdate' => '2000-05-15',
                'permanent_address' => '123 Main Street, Manila, Philippines',
                'course' => 'Bachelor of Science in Computer Science',
                'degree' => 'Bachelor',
                'purpose' => 'Employment',
                'status' => 'pending',
                'remarks' => 'Urgent request for job application',
            ],
            [
                'full_name' => 'Maria Cruz Reyes',
                'birthplace' => 'Cebu, Philippines',
                'birthdate' => '2001-08-22',
                'permanent_address' => '456 Oak Avenue, Cebu, Philippines',
                'course' => 'Bachelor of Science in Information Technology',
                'degree' => 'Bachelor',
                'purpose' => 'Graduate School Application',
                'status' => 'pending',
                'remarks' => 'For MA program enrollment',
            ],
            [
                'full_name' => 'Antonio Dela Cruz',
                'birthplace' => 'Davao, Philippines',
                'birthdate' => '1999-12-10',
                'permanent_address' => '789 Pine Road, Davao, Philippines',
                'course' => 'Bachelor of Science in Information Systems',
                'degree' => 'Bachelor',
                'purpose' => 'Professional License Exam',
                'status' => 'approved',
                'remarks' => 'Ready for pickup - Available Monday-Friday',
            ],
            [
                'full_name' => 'Rosa Fernandez Garcia',
                'birthplace' => 'Quezon City, Philippines',
                'birthdate' => '2000-03-18',
                'permanent_address' => '321 Elm Street, Quezon City, Philippines',
                'course' => 'Bachelor of Science in Civil Engineering',
                'degree' => 'Bachelor',
                'purpose' => 'Job Application',
                'status' => 'approved',
                'remarks' => 'Document ready for release',
            ],
            [
                'full_name' => 'Pedro Villegas Mendoza',
                'birthplace' => 'Iloilo, Philippines',
                'birthdate' => '2002-07-25',
                'permanent_address' => '654 Maple Drive, Iloilo, Philippines',
                'course' => 'Bachelor of Science in Education',
                'degree' => 'Bachelor',
                'purpose' => 'Employment',
                'status' => 'processing',
                'remarks' => 'Under review - expected completion in 3 days',
            ],
            [
                'full_name' => 'Angela Marie Lim',
                'birthplace' => 'Makati, Philippines',
                'birthdate' => '2001-01-30',
                'permanent_address' => '987 Birch Lane, Makati, Philippines',
                'course' => 'Bachelor of Science in Nursing',
                'degree' => 'Bachelor',
                'purpose' => 'Board Exam Application',
                'status' => 'approved',
                'remarks' => 'Ready for pickup',
            ],
        ];

        // Create TOR requests for each student
        foreach ($students as $index => $student) {
            $requestData = $sampleRequests[$index % count($sampleRequests)];
            
            TORRequest::create([
                'user_id' => $student->id,
                'full_name' => $student->first_name . ' ' . $student->last_name,
                'birthplace' => $requestData['birthplace'],
                'birthdate' => $requestData['birthdate'],
                'permanent_address' => $requestData['permanent_address'],
                'student_id' => $student->student_id,
                'course' => $requestData['course'],
                'degree' => $requestData['degree'],
                'purpose' => $requestData['purpose'],
                'status' => $requestData['status'],
                'remarks' => $requestData['remarks'],
                'approved_by' => $requestData['status'] === 'approved' ? User::where('role', 'admin')->first()->id : null,
                'approved_at' => $requestData['status'] === 'approved' ? now() : null,
            ]);
        }

        $this->command->info('TOR requests seeded successfully!');
    }
}