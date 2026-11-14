from fastapi import APIRouter, BackgroundTasks, HTTPException
from app.schemas.user import NewsletterSubscribe
from app.core.email import send_newsletter_notification
from app.config import settings
import json
import os
from datetime import datetime

router = APIRouter(prefix="/newsletter", tags=["Newsletter"])

# Admin email to receive notifications
# Add ADMIN_EMAIL=your_email@gmail.com to your .env file
ADMIN_EMAIL = getattr(settings, "ADMIN_EMAIL", settings.MAIL_USERNAME)

# Path to store subscriber emails (simple JSON file)
SUBSCRIBERS_FILE = "subscribers.json"


def _save_subscriber(email: str):
    """Append subscriber email to a JSON file."""
    subscribers = []
    if os.path.exists(SUBSCRIBERS_FILE):
        try:
            with open(SUBSCRIBERS_FILE, "r") as f:
                subscribers = json.load(f)
        except Exception:
            subscribers = []
    
    # Avoid duplicates
    if any(s["email"] == email for s in subscribers):
        return False
    
    subscribers.append({
        "email": email,
        "subscribed_at": datetime.utcnow().isoformat()
    })
    
    with open(SUBSCRIBERS_FILE, "w") as f:
        json.dump(subscribers, f, indent=2)
    
    return True


@router.post("/subscribe")
async def subscribe(
    payload: NewsletterSubscribe,
    background_tasks: BackgroundTasks
):
    # Save to local file
    is_new = _save_subscriber(payload.email)
    
    if not is_new:
        raise HTTPException(status_code=400, detail="You're already on the list.")
    
    # Send notification email to admin (in background)
    background_tasks.add_task(
        send_newsletter_notification,
        ADMIN_EMAIL,
        payload.email
    )
    
    return {"message": "Request received. We'll be in touch!"}