from fastapi import APIRouter
from src.api.v1.endpoints import auth, users, listings, skills, messages, reviews, notifications, portfolio

api_router = APIRouter()

api_router.include_router(auth.router,          prefix="/auth",          tags=["Auth"])
api_router.include_router(users.router,         prefix="/users",         tags=["Users"])
api_router.include_router(listings.router,      prefix="/listings",      tags=["Listings"])
api_router.include_router(skills.router,        prefix="/skills",        tags=["Skills"])
api_router.include_router(messages.router,      prefix="/messages",      tags=["Messages"])
api_router.include_router(reviews.router,       prefix="/reviews",       tags=["Reviews"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(portfolio.router,     prefix="/portfolio",     tags=["Portfolio"])
