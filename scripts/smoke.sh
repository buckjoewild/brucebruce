#!/bin/bash
set -e

echo "=== HARRIS WILDLANDS SMOKE TEST ==="
echo ""

echo "[1/4] Running test suite..."
python -m pytest 07_HARRIS_WILDLANDS/orchestrator/tests/ -q --tb=short
echo "PASS: All tests passed"
echo ""

echo "[2/4] Starting server in background..."
MUD_BRUCE_AUTOPILOT=false python server.py &
SERVER_PID=$!
sleep 3

if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "FAIL: Server did not start"
    exit 1
fi
echo "PASS: Server started (PID=$SERVER_PID)"
echo ""

echo "[3/4] Testing unauthenticated raw text rejected..."
RESULT=$(python3 -c "
import asyncio, websockets, json, sys
async def test():
    try:
        ws = await asyncio.wait_for(websockets.connect('ws://localhost:5000/ws'), timeout=5)
        banner = await asyncio.wait_for(ws.recv(), timeout=5)
        await ws.send('raw text without json')
        resp = await asyncio.wait_for(ws.recv(), timeout=5)
        data = json.loads(resp)
        if data.get('type') == 'error':
            print('PASS')
        else:
            print('FAIL: expected error, got ' + data.get('type', ''))
        await ws.close()
    except Exception as e:
        print('FAIL: ' + str(e))
asyncio.run(test())
" 2>/dev/null)
echo "Raw text rejection: $RESULT"

echo ""
echo "[3b/4] Testing proper join handshake works..."
RESULT=$(python3 -c "
import asyncio, websockets, json
async def test():
    try:
        ws = await asyncio.wait_for(websockets.connect('ws://localhost:5000/ws'), timeout=5)
        banner = await asyncio.wait_for(ws.recv(), timeout=5)
        await ws.send(json.dumps({'type':'join','name':'SmokeTest'}))
        resp = await asyncio.wait_for(ws.recv(), timeout=5)
        data = json.loads(resp)
        if 'Welcome' in data.get('text', ''):
            print('PASS')
        else:
            print('FAIL: ' + data.get('text', ''))
        await ws.close()
    except Exception as e:
        print('FAIL: ' + str(e))
asyncio.run(test())
" 2>/dev/null)
echo "Join handshake: $RESULT"

echo ""
echo "[3c/4] Testing duplicate name rejected..."
RESULT=$(python3 -c "
import asyncio, websockets, json
async def test():
    try:
        ws1 = await asyncio.wait_for(websockets.connect('ws://localhost:5000/ws'), timeout=5)
        await asyncio.wait_for(ws1.recv(), timeout=5)
        await ws1.send(json.dumps({'type':'join','name':'DupeTest'}))
        await asyncio.wait_for(ws1.recv(), timeout=5)
        await asyncio.wait_for(ws1.recv(), timeout=5)

        ws2 = await asyncio.wait_for(websockets.connect('ws://localhost:5000/ws'), timeout=5)
        await asyncio.wait_for(ws2.recv(), timeout=5)
        await ws2.send(json.dumps({'type':'join','name':'DupeTest'}))
        resp = await asyncio.wait_for(ws2.recv(), timeout=5)
        data = json.loads(resp)
        if data.get('type') == 'error' and 'already in use' in data.get('text', ''):
            print('PASS')
        else:
            print('FAIL: ' + data.get('text', ''))
        await ws1.close()
        await ws2.close()
    except Exception as e:
        print('FAIL: ' + str(e))
asyncio.run(test())
" 2>/dev/null)
echo "Duplicate name: $RESULT"

echo ""
echo "[4/4] Cleaning up..."
kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true
echo "Server stopped"

echo ""
echo "=== SMOKE TEST COMPLETE ==="
