<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .container {
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 30px;
            margin: 20px 0;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2c3e50;
            padding-bottom: 20px;
        }

        .header h1 {
            color: #2c3e50;
            margin: 0;
            font-size: 24px;
        }

        .content {
            background-color: #fff;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }

        .content p {
            margin: 10px 0;
        }

        .details {
            background-color: #f0f0f0;
            padding: 15px;
            border-left: 4px solid #2c3e50;
            margin: 20px 0;
            border-radius: 3px;
        }

        .details-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #ddd;
        }

        .details-row:last-child {
            border-bottom: none;
        }

        .details-label {
            font-weight: bold;
            color: #2c3e50;
            flex: 0 0 40%;
        }

        .details-value {
            color: #555;
        }

        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 14px;
            color: #666;
        }

        .highlight {
            background-color: #fff3cd;
            padding: 15px;
            border-left: 4px solid #ffc107;
            margin: 20px 0;
            border-radius: 3px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>📋 Transcript of Records Ready</h1>
        </div>

        <div class="content">
            <p>Dear {{ $studentName }},</p>

            <p>We are pleased to inform you that your <strong>Transcript of Records (TOR)</strong> is now <strong>ready
                    for pickup</strong>.</p>

            <div class="details">
                <div class="details-row">
                    <span class="details-label">Student ID:</span>
                    <span class="details-value">{{ $studentId }}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Full Name:</span>
                    <span class="details-value">{{ $studentName }}</span>
                </div>
                <div class="details-row">
                    <span class="details-label">Course:</span>
                    <span class="details-value">{{ $torRequest->course }}</span>
                </div>
                @if($torRequest->remarks)
                    <div class="details-row">
                        <span class="details-label">Remarks:</span>
                        <span class="details-value">{{ $torRequest->remarks }}</span>
                    </div>
                @endif
            </div>

            <div class="highlight">
                <strong>⏰ Next Steps:</strong>
                <p>Please visit the registrar's office at your earliest convenience to collect your TOR. Make sure to
                    bring your student ID or any valid identification.</p>
            </div>

            <p>If you have any questions or concerns, please contact the registrar's office.</p>

            <p>Thank you for using our TOR request system.</p>

            <p>Best regards,<br>
                <strong>Registrar's Office</strong>
            </p>
        </div>

        <div class="footer">
            <p>This is an automated email. Please do not reply directly to this message.</p>
            <p>&copy; {{ date('Y') }} Registrar's Office. All rights reserved.</p>
        </div>
    </div>
</body>

</html>