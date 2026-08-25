from textblob import TextBlob
from ..models.feedback import CategoryEnum

BUG_KEYWORDS = ["crash", "bug", "error", "broken", "not working", "fails", "freeze", "glitch"]
FEATURE_KEYWORDS = ["add", "feature", "would be nice", "please support", "suggest", "wish", "could you"]
COMPLAINT_KEYWORDS = ["slow", "bad", "worst", "disappointed", "annoying", "unhappy", "poor"]
PRAISE_KEYWORDS = ["great", "love", "awesome", "excellent", "amazing", "thank you", "good job"]


def categorize_feedback(message: str) -> CategoryEnum:
    text = message.lower()

    if any(k in text for k in BUG_KEYWORDS):
        return CategoryEnum.BUG
    if any(k in text for k in FEATURE_KEYWORDS):
        return CategoryEnum.FEATURE_REQUEST
    if any(k in text for k in COMPLAINT_KEYWORDS):
        return CategoryEnum.COMPLAINT
    if any(k in text for k in PRAISE_KEYWORDS):
        return CategoryEnum.PRAISE

    # fallback: sentiment polarity when no keyword matches
    polarity = TextBlob(message).sentiment.polarity
    if polarity > 0.2:
        return CategoryEnum.PRAISE
    if polarity < -0.2:
        return CategoryEnum.COMPLAINT
    return CategoryEnum.COMPLAINT  # safest default bucket for ambiguous/neutral text