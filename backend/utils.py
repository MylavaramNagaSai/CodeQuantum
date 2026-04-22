import bcrypt
import random
import string
import smtplib
import os
import mimetypes
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from datetime import datetime

# --- Security Setup ---
def hash_password(password: str):
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password=pwd_bytes, salt=salt)
    return hashed_password.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str):
    password_byte_enc = plain_password.encode('utf-8')
    hashed_password_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_byte_enc, hashed_password_bytes)

def generate_otp():
    # Generates exactly 8 characters: uppercase, lowercase, numbers, and symbols
    characters = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(random.choice(characters) for i in range(8))

# --- Email Setup ---
GMAIL_ADDRESS = "mylavaramnagasaei@gmail.com"
GMAIL_APP_PASSWORD = "dhkm wplz nrwd eqqj"

# ✨ UPGRADED: Now accepts the dynamic IP address
def send_otp_email(receiver_email: str, otp: str, ip_address: str):
    subject = "CodeQuantum Email Verification"

    # The HTML Email Template
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
    </head>
    <body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f3f4f6; padding: 40px 20px; margin: 0;">
        <div style="max-width: 550px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            
            <div style="background-color: #e6f9f0; padding: 15px; border-radius: 12px; text-align: center; margin-bottom: 10px;">
                <h2 style="margin: 0; color: #111827; font-size: 22px;">🚀 CodeQuantum</h2>
            </div>
            <p style="text-align: center; color: #6b7280; font-size: 13px; margin-bottom: 30px; letter-spacing: 0.5px;">Learn &bull; Build &bull; Master Coding</p>

            <p style="font-size: 16px; color: #374151; margin-bottom: 10px;">Hello 👋,</p>
            <p style="font-size: 16px; color: #374151; margin-bottom: 30px;">Your CodeQuantum verification code is:</p>

            <div style="background-color: #e6f9f0; padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #111827;">{otp}</span>
            </div>

            <p style="font-size: 15px; color: #374151; margin-bottom: 25px;">This OTP is valid for <strong>60 seconds.</strong>.</p>

            <div style="border: 1px solid #e5e7eb; padding: 16px; border-radius: 12px; background-color: #f9fafb; margin-bottom: 30px;">
                <p style="margin: 0; font-size: 14px; color: #4b5563;">Login attempt from IP: <strong>{ip_address}</strong></p>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

            <div style="text-align: center; font-size: 13px; color: #9ca3af; line-height: 1.6;">
                <p style="margin: 5px 0;">Crafted with ❤️ by <strong style="color: #3b82f6;">MylavaramSai</strong>.</p>
                <p style="margin: 5px 0;">If this wasn't you, ignore this email.</p>
                <p style="margin: 5px 0;">&copy; 2026 CodeQuantum Team.</p>
            </div>
        </div>
    </body>
    </html>
    """

    msg = MIMEMultipart()
    msg['From'] = f"CodeQuantum Team <{GMAIL_ADDRESS}>"
    msg['To'] = receiver_email
    msg['Subject'] = subject
    
    msg.attach(MIMEText(html_body, 'html'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()  
        server.login(GMAIL_ADDRESS, GMAIL_APP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"✅ SUCCESS: Beautiful HTML email sent to {receiver_email}")
    except Exception as e:
        print(f"❌ ERROR: Failed to send email. Details: {e}")



# --- BUG REPORT EMAIL WITH INLINE IMAGE & IP ADDRESS ---

def send_bug_confirmation_email(user_email: str, bug_title: str, bug_desc: str, time_occurred: str, browser_info: str, ip_address: str, attachment_path: str = None):
    
    SENDER_EMAIL = "mylavaramnagasaei@gmail.com" 
    SENDER_PASSWORD = "tyee lsbs kybt ypwf"
    ADMIN_EMAIL = "mylavaramnagasaei@gmail.com"

    msg = MIMEMultipart('related')
    msg['From'] = f"CodeQuantum Support <{SENDER_EMAIL}>"
    msg['To'] = user_email 
    msg['Bcc'] = ADMIN_EMAIL 
    msg['Subject'] = f"CodeQuantum Bug Report Received: {bug_title}"

    inline_image_html = ""
    if attachment_path and os.path.exists(attachment_path):
        inline_image_html = f"""
        <tr>
            <td style="padding: 0 40px 30px 40px; text-align: center;">
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #5f6368; text-align: left;"><strong>Attached Screenshot:</strong></p>
                <img src="cid:bug_screenshot_img" alt="Bug Screenshot" style="max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #dadce0;">
            </td>
        </tr>
        """

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f6f8; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
                        
                        <tr>
                            <td align="center" style="background-color: #e8f5e9; padding: 30px 20px; border-bottom: 1px solid #dcedc8;">
                                <h1 style="margin: 0; color: #1b5e20; font-size: 26px; font-weight: bold;">🚀 CodeQuantum</h1>
                                <p style="margin: 8px 0 0 0; color: #558b2f; font-size: 14px; font-weight: 500;">Learn • Build • Master Coding</p>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding: 40px 40px 20px 40px;">
                                <p style="margin: 0 0 20px 0; font-size: 16px; color: #3c4043;">Hello 👋,</p>
                                <p style="margin: 0 0 30px 0; font-size: 16px; color: #3c4043; line-height: 1.6;">
                                    We have successfully received your bug report. Thank you for helping us improve CodeQuantum! Here is a copy of your submission:
                                </p>

                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #e8f0fe; border-radius: 10px; padding: 25px;">
                                    <tr>
                                        <td>
                                            <h3 style="margin: 0 0 10px 0; color: #1a73e8; font-size: 18px;">{bug_title}</h3>
                                            <p style="margin: 0; font-size: 15px; color: #3c4043; line-height: 1.6; white-space: pre-wrap;">{bug_desc}</p>
                                        </td>
                                    </tr>
                                </table>

                                <p style="margin: 30px 0 0 0; font-size: 16px; color: #3c4043; line-height: 1.6;">
                                    Our engineering team has been notified and is looking into it.
                                </p>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding: 0 40px 30px 40px;">
                                <div style="background-color: #f8f9fa; border: 1px solid #f1f3f4; border-radius: 8px; padding: 15px; font-size: 13px; color: #5f6368; line-height: 1.5;">
                                    <strong>Status:</strong> Open<br>
                                    <strong>Reported at:</strong> {time_occurred}<br>
                                    <strong>Device Info:</strong> {browser_info}<br>
                                    <strong>IP Address:</strong> {ip_address}
                                </div>
                            </td>
                        </tr>

                        {inline_image_html}

                        <tr>
                            <td align="center" style="padding: 25px; background-color: #ffffff; border-top: 1px solid #f1f3f4;">
                                <p style="margin: 0 0 8px 0; font-size: 12px; color: #80868b;">
                                    Crafted with ❤️ by <strong style="color: #1a73e8;">Mylavaram Sai</strong>.
                                </p>
                                <p style="margin: 0 0 8px 0; font-size: 12px; color: #80868b;">
                                    If this wasn't you, ignore this email.
                                </p>
                                <p style="margin: 0; font-size: 12px; color: #bdc1c6;">
                                    © 2026 CodeQuantum Team.
                                </p>
                            </td>
                        </tr>
                        
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    
    msg.attach(MIMEText(html_body, 'html'))

    if attachment_path and os.path.exists(attachment_path):
        try:
            mime_type, _ = mimetypes.guess_type(attachment_path)
            mime_type = mime_type or 'application/octet-stream'
            maintype, subtype = mime_type.split('/', 1)

            with open(attachment_path, 'rb') as f:
                file_data = f.read()

            attachment = MIMEBase(maintype, subtype)
            attachment.set_payload(file_data)
            encoders.encode_base64(attachment)
            
            filename = os.path.basename(attachment_path)
            attachment.add_header('Content-Disposition', f'attachment; filename="{filename}"')
            attachment.add_header('Content-ID', '<bug_screenshot_img>')
            attachment.add_header('X-Attachment-Id', 'bug_screenshot_img')
            
            msg.attach(attachment)
            print(f"Attached file: {filename} embedded inline.")
        except Exception as attach_err:
            print(f"Failed to attach image inline: {attach_err}")

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.send_message(msg, to_addrs=[user_email, ADMIN_EMAIL])
        server.quit()
        print(f"Bug email with inline image sent successfully!")
    except Exception as e:
        print(f"Failed to send bug email: {e}")