from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json

app = FastAPI()

queue = []
listeners = []

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def notify_listeners():
    data = json.dumps({"queue": queue})
    for listener in listeners:
        await listener.put(data)

@app.get("/queue")
async def get_queue():
    return {"queue": queue}

@app.post("/join")
async def join_queue(payload: dict):
    name = payload.get("username", "").strip()
    if name and name not in queue:
        queue.append(name)
        await notify_listeners()
    return {"queue": queue}

@app.post("/finish")
async def finish_game():
    if queue:
        player = queue.pop(0)
        queue.append(player)
        await notify_listeners()
    return {"queue": queue}

@app.get("/events")
async def events(request: Request):
    q = asyncio.Queue()
    listeners.append(q)

    async def event_generator():
        try:
            while True:
                if await request.is_disconnected():
                    break
                data = await q.get()
                yield f"data: {data}\n\n"
        finally:
            listeners.remove(q)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
