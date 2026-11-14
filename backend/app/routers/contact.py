from fastapi import APIRouter, BackgroundTasks
from app.schemas.user import ContactMessage
from app.core.email import send_contact_form_notification
from app.config import settings
import json
import os
from datetime import datetime

router = APIRouter(prefix="/contact", tags=["Contact"])

ADMIN_EMAIL = getattr(settings, "ADMIN_EMAIL", settings.MAIL_USERNAME) or settings.MAIL_USERNAME
CONTACT_LOG = "contact_messages.json"


@router.post("/submit")
async def submit_contact(
    payload: ContactMessage,
    background_tasks: BackgroundTasks
):
    # 1. Log message to JSON file (never lose a lead)
    _log_contact_message(payload)
    
    # 2. Send notification email to admin in background
    background_tasks.add_task(
        send_contact_form_notification,
        ADMIN_EMAIL,
        payload.name,
        payload.email,
        payload.subject,
        payload.message
    )
    
    return {"message": "Message received. We'll get back to you shortly."}


def _log_contact_message(payload: ContactMessage):
    messages = []
    if os.path.exists(CONTACT_LOG):
        try:
            with open(CONTACT_LOG, "r") as f:
                messages = json.load(f)
        except Exception:
            messages = []
    
    messages.append({
        "name": payload.name,
        "email": payload.email,
        "subject": payload.subject,
        "message": payload.message,
        "received_at": datetime.utcnow().isoformat()
    })
    
    with open(CONTACT_LOG, "w") as f:
        json.dump(messages, f, indent=2)