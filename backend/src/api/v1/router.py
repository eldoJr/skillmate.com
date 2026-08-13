from fastapi import APIRouter
from src.api.v1.endpoints import auth, users, listings, skills, messages, reviews, notifications, portfolio, skill_gap, roadmap, mentor, matching, recommendation, proposal, resume, search, company, certificates

api_router = APIRouter()

api_router.include_router(auth.router,              prefix="/auth",           tags=["Auth"])
api_router.include_router(users.router,             prefix="/users",          tags=["Users"])
api_router.include_router(listings.router,          prefix="/listings",       tags=["Listings"])
api_router.include_router(skills.router,            prefix="/skills",         tags=["Skills"])
api_router.include_router(messages.router,          prefix="/messages",       tags=["Messages"])
api_router.include_router(reviews.router,           prefix="/reviews",        tags=["Reviews"])
api_router.include_router(notifications.router,     prefix="/notifications",  tags=["Notifications"])
api_router.include_router(portfolio.router,         prefix="/portfolio",      tags=["Portfolio"])
api_router.include_router(skill_gap.router,         prefix="/skill-gap",      tags=["Skill Gap"])
api_router.include_router(roadmap.router,           prefix="/roadmap",        tags=["Roadmap"])
api_router.include_router(mentor.router,            prefix="/mentor",         tags=["Mentor"])
api_router.include_router(matching.router,          prefix="/matching",       tags=["Matching"])
api_router.include_router(recommendation.router,    prefix="/recommendations",tags=["Recommendations"])
api_router.include_router(proposal.router,          prefix="/proposals",      tags=["Proposals"])
api_router.include_router(resume.router,            prefix="/resume",         tags=["Resume"])
api_router.include_router(search.router,            prefix="/search",         tags=["Search"])
api_router.include_router(company.router,           prefix="/company",        tags=["Company"])
api_router.include_router(certificates.router,      prefix="/certificates",   tags=["Certificates"])
