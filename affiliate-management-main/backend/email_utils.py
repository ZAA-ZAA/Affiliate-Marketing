import smtplib
import os
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta

# SMTP Configuration from environment variables
SMTP_EMAIL = os.environ.get('SMTP_EMAIL', '')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')
SMTP_SENDER_NAME = os.environ.get('SMTP_SENDER_NAME', 'GLEENT Affiliate Program')
SMTP_HOST = 'smtp.gmail.com'
SMTP_PORT = 587

def generate_verification_code():
    """Generate a 6-digit verification code"""
    return ''.join(random.choices(string.digits, k=6))

def get_code_expiry():
    """Get expiry timestamp (10 minutes from now)"""
    return datetime.now() + timedelta(minutes=10)

def send_verification_email(to_email, first_name, verification_code):
    """Send verification code email to user"""
    try:
        if not SMTP_EMAIL or not SMTP_PASSWORD:
            print("SMTP credentials not configured")
            return False, "Email service not configured"
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f'Your Verification Code - {SMTP_SENDER_NAME}'
        msg['From'] = f'{SMTP_SENDER_NAME} <{SMTP_EMAIL}>'
        msg['To'] = to_email
        
        # Plain text version
        text_content = f"""
Hello {first_name},

Thank you for signing up as an affiliate partner!

Your verification code is: {verification_code}

This code will expire in 10 minutes.

If you did not request this code, please ignore this email.

Best regards,
{SMTP_SENDER_NAME}
        """
        
        # HTML version
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .code-box {{ background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }}
        .code {{ font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px; }}
        .footer {{ text-align: center; margin-top: 20px; color: #888; font-size: 12px; }}
        .warning {{ color: #e74c3c; font-size: 14px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Email Verification</h1>
        </div>
        <div class="content">
            <p>Hello <strong>{first_name}</strong>,</p>
            <p>Thank you for signing up as an affiliate partner! Please use the verification code below to complete your registration:</p>
            
            <div class="code-box">
                <p style="margin: 0; color: #666;">Your Verification Code</p>
                <p class="code">{verification_code}</p>
            </div>
            
            <p class="warning">⏰ This code will expire in <strong>10 minutes</strong>.</p>
            
            <p>If you did not request this code, please ignore this email.</p>
            
            <p>Best regards,<br><strong>{SMTP_SENDER_NAME}</strong></p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
        """
        
        # Attach both versions
        part1 = MIMEText(text_content, 'plain')
        part2 = MIMEText(html_content, 'html')
        msg.attach(part1)
        msg.attach(part2)
        
        # Send email
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.sendmail(SMTP_EMAIL, to_email, msg.as_string())
        
        print(f"Verification email sent to {to_email}")
        return True, "Verification email sent successfully"
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"SMTP Authentication Error: {e}")
        return False, "Email authentication failed. Please check SMTP credentials."
    except smtplib.SMTPException as e:
        print(f"SMTP Error: {e}")
        return False, f"Failed to send email: {str(e)}"
    except Exception as e:
        print(f"Error sending email: {e}")
        return False, f"Failed to send email: {str(e)}"
