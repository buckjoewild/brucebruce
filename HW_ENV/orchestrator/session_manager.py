"""
Session Manager
===============

Per-player telnet session management.
Each player connection gets an isolated session with its own state.
Sessions are ephemeral (live as long as connection is open).
State is managed in mode_state.py (persistent across reconnects).
"""

import asyncio
from typing import Optional, Dict, Callable, Any
from datetime import datetime
from dataclasses import dataclass


@dataclass
class TelnetSession:
    """A single player's telnet session."""
    player_name: str
    connected_at: datetime
    last_activity: datetime
    reader: Optional[asyncio.StreamReader] = None
    writer: Optional[asyncio.StreamWriter] = None
    
    def mark_activity(self):
        """Update last activity timestamp."""
        self.last_activity = datetime.utcnow()
    
    def is_alive(self, timeout_seconds: int = 300) -> bool:
        """Check if session is still alive."""
        if not self.writer:
            return False
        if self.writer.is_closing():
            return False
        idle = (datetime.utcnow() - self.last_activity).total_seconds()
        return idle < timeout_seconds


class SessionManager:
    """
    Manages active telnet sessions.
    One session per connected player.
    """
    
    def __init__(self):
        # player_name -> TelnetSession
        self._sessions: Dict[str, TelnetSession] = {}
        
    def create_session(
        self,
        player_name: str,
        reader: asyncio.StreamReader,
        writer: asyncio.StreamWriter,
    ) -> TelnetSession:
        """Create a new session for a player."""
        session = TelnetSession(
            player_name=player_name,
            connected_at=datetime.utcnow(),
            last_activity=datetime.utcnow(),
            reader=reader,
            writer=writer,
        )
        self._sessions[player_name] = session
        return session
    
    def get_session(self, player_name: str) -> Optional[TelnetSession]:
        """Get a player's active session."""
        return self._sessions.get(player_name)
    
    def close_session(self, player_name: str):
        """Close a player's session."""
        session = self._sessions.pop(player_name, None)
        if session and session.writer:
            session.writer.close()
    
    def get_active_sessions(self) -> Dict[str, TelnetSession]:
        """Get all active sessions."""
        # Clean up dead sessions
        dead = [
            name for name, sess in self._sessions.items()
            if not sess.is_alive()
        ]
        for name in dead:
            self.close_session(name)
        
        return dict(self._sessions)
    
    async def send_to_player(self, player_name: str, message: str) -> bool:
        """
        Send a message to a player.
        Returns True if sent, False if player not connected.
        """
        session = self.get_session(player_name)
        if not session or not session.writer:
            return False
        
        try:
            session.writer.write((message + "\n").encode())
            await session.writer.drain()
            session.mark_activity()
            return True
        except Exception:
            self.close_session(player_name)
            return False
    
    async def broadcast(self, message: str, exclude: Optional[str] = None):
        """Send a message to all connected players."""
        for player_name in list(self._sessions.keys()):
            if exclude and player_name == exclude:
                continue
            await self.send_to_player(player_name, message)


# Global instance
_manager: Optional[SessionManager] = None


def get_session_manager() -> SessionManager:
    """Get the global session manager."""
    global _manager
    if _manager is None:
        _manager = SessionManager()
    return _manager


if __name__ == "__main__":
    print("=" * 60)
    print("SESSION MANAGER DEMO (non-async)")
    print("=" * 60)
    print()
    
    mgr = get_session_manager()
    
    # Simulate sessions (without actual asyncio)
    print("Create mock sessions...")
    
    class MockWriter:
        def __init__(self, name):
            self.name = name
            self.messages = []
            self._closing = False
        
        def write(self, data):
            self.messages.append(data)
        
        async def drain(self):
            pass
        
        def is_closing(self):
            return self._closing
        
        def close(self):
            self._closing = True
    
    class MockReader:
        async def readline(self):
            return b"test\n"
    
    # Create sessions
    reader1, reader2 = MockReader(), MockReader()
    writer1, writer2 = MockWriter("you"), MockWriter("bruce")
    
    sess1 = mgr.create_session("you", reader1, writer1)
    sess2 = mgr.create_session("bruce", reader2, writer2)
    
    print(f"✓ 'you' session created at {sess1.connected_at}")
    print(f"✓ 'bruce' session created at {sess2.connected_at}")
    print()
    
    # Check active sessions
    print("Active sessions:")
    for name, sess in mgr.get_active_sessions().items():
        print(f"  {name}: {sess.player_name} (idle check passes)")
    print()
    
    # Close a session
    print("Close 'you' session...")
    mgr.close_session("you")
    print(f"  Active: {list(mgr.get_active_sessions().keys())}")
    print()
    
    print("=" * 60)
