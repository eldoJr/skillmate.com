from typing import Annotated, Any
from typing_extensions import TypedDict
from langgraph.graph.message import add_messages


class AgentState(TypedDict):
    """Shared state schema for all Skillmate LangGraph agents."""
    messages: Annotated[list, add_messages]
    user_id: str
    context: dict[str, Any]   # injected profile, skills, roadmap, etc.
    output: str | None        # final structured output when applicable
