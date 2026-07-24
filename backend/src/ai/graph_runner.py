import json
from typing import AsyncGenerator, Any
from langgraph.graph import StateGraph
from src.ai.graph_state import AgentState


async def run_graph(
    graph: StateGraph,
    initial_state: AgentState,
) -> AgentState:
    """Run a compiled LangGraph graph to completion and return final state."""
    compiled = graph.compile()
    result = await compiled.ainvoke(initial_state)
    return result


async def stream_graph(
    graph: StateGraph,
    initial_state: AgentState,
) -> AsyncGenerator[str, None]:
    """
    Stream a LangGraph graph as Server-Sent Events.
    Each yielded string is a complete SSE line ready to send to the client.
    """
    compiled = graph.compile()
    async for event in compiled.astream(initial_state):
        for node_name, node_output in event.items():
            messages = node_output.get("messages", [])
            for msg in messages:
                content = msg.content if hasattr(msg, "content") else str(msg)
                if content:
                    data = json.dumps({"node": node_name, "content": content})
                    yield f"data: {data}\n\n"
    yield "data: [DONE]\n\n"
