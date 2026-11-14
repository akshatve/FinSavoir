from app.database import SessionLocal
from app.models.user import User, OTPVerification

db = SessionLocal()

# Delete all users and OTPs
db.query(User).delete()
db.query(OTPVerification).delete()
db.commit()

print("Database cleaned! All users and OTPs deleted.")
db.close()