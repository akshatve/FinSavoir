from datetime import datetime
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.config import settings

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_otp_email(email: str, otp: str):
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center;">
        <h2 style="color: #2563eb;">Welcome to FinSavoir</h2>
        <p>Your verification code is:</p>
        <h1 style="font-size: 40px; letter-spacing: 5px; color: #1e293b; background: #f1f5f9; padding: 10px; border-radius: 8px;">{otp}</h1>
        <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes.</p>
    </div>
    """
    
    message = MessageSchema(
        subject="FinSavoir - Your Verification Code",
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )
    
    fm = FastMail(conf)
    await fm.send_message(message)





async def send_newsletter_notification(admin_email: str, subscriber_email: str):
    """Notify the admin that a new user requested access."""
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 12px;">
        <div style="background: white; padding: 32px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <h2 style="color: #2563eb; margin-top: 0;">New Access Request</h2>
            <p style="color: #374151; font-size: 16px;">A new user has requested access to FinSavoir:</p>
            <div style="background: #eff6ff; padding: 16px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0;">
                <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1e3a8a;">{subscriber_email}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">Requested at: {datetime.utcnow().strftime('%B %d, %Y at %H:%M UTC')}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            <p style="color: #9ca3af; font-size: 12px;">This notification was sent automatically by FinSavoir's newsletter system.</p>
        </div>
    </div>
    """
    
    message = MessageSchema(
        subject=f"New Access Request: {subscriber_email}",
        recipients=[admin_email],
        body=html,
        subtype=MessageType.html
    )
    
    fm = FastMail(conf)
    await fm.send_message(message)





async def send_contact_form_notification(
    admin_email: str,
    name: str,
    sender_email: str,
    subject: str,
    message: str
):
    """Send the contact form submission to the admin."""
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 12px;">
        <div style="background: white; padding: 32px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <h2 style="color: #2563eb; margin-top: 0;">New Contact Form Submission</h2>
            
            <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
                <tr>
                    <td style="padding: 10px 0; font-weight: bold; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; width: 100px;">From</td>
                    <td style="padding: 10px 0; color: #111827; font-size: 15px;">{name} &lt;{sender_email}&gt;</td>
                </tr>
                <tr>
                    <td style="padding: 10px 0; font-weight: bold; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; border-top: 1px solid #f3f4f6;">Subject</td>
                    <td style="padding: 10px 0; color: #111827; font-size: 15px; border-top: 1px solid #f3f4f6;">{subject}</td>
                </tr>
            </table>

            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0;">
                <p style="margin: 0 0 8px 0; font-weight: bold; color: #1e3a8a; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Message</p>
                <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">{message}</p>
            </div>

            <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
                Submitted at {datetime.utcnow().strftime('%B %d, %Y at %H:%M UTC')} via finsavoir.com contact form.
            </p>
        </div>
    </div>
    """
    
    msg = MessageSchema(
        subject=f"Contact Form: {subject}",
        recipients=[admin_email],
        body=html,
        subtype=MessageType.html
    )
    
    fm = FastMail(conf)
    await fm.send_message(msg)





async def send_password_reset_email(email: str, reset_link: str, user_email: str):
    """Send password reset link to the user."""
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
        <div style="background: white; padding: 40px 32px; border-radius: 12px; border: 1px solid #e5e7eb;">
            <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #00296b; margin: 0; font-size: 24px;">FinSavoir</h1>
            </div>

            <h2 style="color: #111827; margin-top: 0; font-size: 20px;">Reset your password</h2>

            <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                Hi,
            </p>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                We received a request to reset the password for the FinSavoir account associated with
                <strong>{user_email}</strong>.
            </p>

            <div style="text-align: center; margin: 32px 0;">
                <a href="{reset_link}"
                   style="display: inline-block; background: #00296b; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px;">
                    Reset Password →
                </a>
            </div>

            <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">
                This link will expire in <strong>1 hour</strong>. It can only be used once.
            </p>

            <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">
                If you didn't request this, you can safely ignore this email. Your password will not
                be changed unless you click the link above and set a new one.
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 28px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                Sent at {datetime.utcnow().strftime('%B %d, %Y at %H:%M UTC')} by FinSavoir.<br>
                If the button doesn't work, copy this link into your browser:<br>
                <span style="word-break: break-all; color: #6b7280;">{reset_link}</span>
            </p>
        </div>
    </div>
    """

    message = MessageSchema(
        subject="Reset your FinSavoir password",
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)