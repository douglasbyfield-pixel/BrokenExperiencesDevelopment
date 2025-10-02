import { Resend } from 'resend';
import nodemailer from 'nodemailer';

const resend = new Resend('re_4GVnYGhL_9BDPvtDJGPUVtRiZuaX6RsH1');

// Create Ethereal Email transporter for testing
let testTransporter: any = null;

interface EmailData {
	to: string;
	subject: string;
	html: string;
}

/**
 * Get or create Ethereal test transporter
 */
async function getTestTransporter() {
	if (!testTransporter) {
		const testAccount = await nodemailer.createTestAccount();
		testTransporter = nodemailer.createTransport({
			host: 'smtp.ethereal.email',
			port: 587,
			secure: false,
			auth: {
				user: testAccount.user,
				pass: testAccount.pass,
			},
		});
		console.log('🧪 Ethereal Email Test Account Created:');
		console.log('📧 View emails at: https://ethereal.email/');
		console.log('👤 Username:', testAccount.user);
		console.log('🔑 Password:', testAccount.pass);
	}
	return testTransporter;
}

/**
 * Send email using either Resend (production) or Ethereal (testing)
 */
export async function sendEmail(data: EmailData): Promise<boolean> {
	const isProduction = process.env.NODE_ENV === 'production';
	
	try {
		if (isProduction) {
			// Use Resend for production
			const emailData = await resend.emails.send({
				from: 'BrokenExperiences <onboarding@resend.dev>',
				to: data.to,
				subject: data.subject,
				html: data.html,
			});

			console.log('📧 Email sent via Resend:', emailData.data?.id);
			return true;
		} else {
			// Use Ethereal for testing
			const transporter = await getTestTransporter();
			const info = await transporter.sendMail({
				from: 'BrokenExperiences <test@brokenexperiences.com>',
				to: data.to,
				subject: data.subject,
				html: data.html,
			});

			console.log('🧪 Test email sent!');
			console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
			console.log('📬 To view: https://ethereal.email/');
			return true;
		}
	} catch (error) {
		console.error('Failed to send email:', error);
		return false;
	}
}

/**
 * Send notification about a new issue/experience
 */
export async function sendNewIssueNotification(experience: {
	id: string;
	title: string;
	description: string;
	address?: string;
	reportedBy: { name: string; email: string };
}) {
	const emailHtml = `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>New Issue Reported</title>
		</head>
		<body style="margin: 0; padding: 20px; background-color: #f3f4f6; font-family: Arial, sans-serif;">
			<div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
				<div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
					<h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">✅ Issue Successfully Reported</h1>
				</div>
				
				<div style="padding: 30px;">
					<div style="background: #f8fafc; padding: 25px; border-radius: 8px; border-left: 4px solid #3b82f6; margin-bottom: 25px;">
						<h2 style="color: #1f2937; margin: 0 0 15px 0; font-size: 20px;">${experience.title}</h2>
						<p style="color: #4b5563; margin: 0 0 15px 0; line-height: 1.6;">${experience.description}</p>
						
						${experience.address ? `
						<div style="margin: 15px 0; padding: 10px; background: white; border-radius: 6px;">
							<strong style="color: #374151;">📍 Location:</strong>
							<span style="color: #6b7280;">${experience.address}</span>
						</div>
						` : ''}
						
						<div style="margin: 15px 0; padding: 10px; background: white; border-radius: 6px;">
							<strong style="color: #374151;">👤 Reported by:</strong>
							<span style="color: #6b7280;">${experience.reportedBy.name} (${experience.reportedBy.email})</span>
						</div>
					</div>
					
					<div style="text-align: center; margin-top: 30px;">
						<a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/shared/experience/${experience.id}" 
						   style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; transition: background-color 0.3s;">
							🔍 View Issue Details
						</a>
					</div>
					
					<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
						<p>Thank you for reporting this issue! We'll review it and update you on any progress.</p>
						<p style="margin-top: 10px;">This confirmation was sent automatically by BrokenExperiences</p>
					</div>
				</div>
			</div>
		</body>
		</html>
	`;

	return await sendEmail({
		to: experience.reportedBy.email, // Send to the user who created the issue
		subject: `✅ Issue Reported: ${experience.title}`,
		html: emailHtml
	});
}

/**
 * Get users who should receive notifications about new issues
 */
export async function getNotificationRecipients(): Promise<string[]> {
	// For now, return admin emails
	// Later, you could query users who have enabled email notifications
	return [
		'admin@brokenexperiences.com',
		// Add more admin emails as needed
	];
}