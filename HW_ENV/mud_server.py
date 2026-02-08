"""
HW_ENV MUD Server
=================

Telnet server for the sealed habitat.
Each player gets an isolated session with mode/build governance.

Listen: localhost:5555
Commands: /plan, /build on, /consent yes, etc.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

import asyncio
import json
from typing import Optional, Tuple
from orchestrator import (
    get_manager, Mode, get_gate, get_session_manager, get_parser
)
from hw_env import log_event


class MUDServer:
    """Telnet MUD server with mode-based governance."""
    
    def __init__(self, host: str = "localhost", port: int = 5555):
        self.host = host
        self.port = port
        self.session_mgr = get_session_manager()
        self.parser = get_parser()
    
    async def start(self):
        """Start the telnet server."""
        server = await asyncio.start_server(
            self._handle_connection,
            self.host,
            self.port
        )
        
        print(f"🌐 HW_ENV MUD Server listening on {self.host}:{self.port}")
        print(f"📋 Event log: {Path(__file__).parent / 'evidence' / 'event_log.jsonl'}")
        print()
        
        async with server:
            await server.serve_forever()
    
    async def _handle_connection(
        self,
        reader: asyncio.StreamReader,
        writer: asyncio.StreamWriter
    ):
        """Handle a single player connection."""
        addr = writer.get_extra_info('peername')
        print(f"→ Connection from {addr}")
        
        player_name = None
        
        try:
            # Greeting
            greeting = (
                "\n=== HW_ENV MUD ===\n"
                "An honest ASCII world for you and bruce™\n"
                "Commands: /plan, /build on, /consent yes, dev status\n"
                "Type 'help' for more.\n"
                "\n"
            )
            writer.write(greeting.encode())
            await writer.drain()
            
            # Get player name
            writer.write(b"Enter your name: ")
            await writer.drain()
            
            line = await asyncio.wait_for(reader.readline(), timeout=30.0)
            player_name = line.decode().strip()
            
            if not player_name:
                writer.write(b"Invalid name.\n")
                writer.close()
                return
            
            # Create session
            session = self.session_mgr.create_session(player_name, reader, writer)
            print(f"  Player: {player_name}")
            
            log_event({
                "actor": player_name,
                "event_type": "telnet_connected",
                "addr": str(addr),
            })
            
            # Welcome message
            welcome = f"\nWelcome, {player_name}! Type 'help' or press Enter.\n"
            await self.session_mgr.send_to_player(player_name, welcome)
            
            # Main loop
            while True:
                try:
                    # Read command with timeout
                    line = await asyncio.wait_for(
                        reader.readline(),
                        timeout=300.0  # 5 minute idle timeout
                    )
                    
                    if not line:
                        # Connection closed
                        break
                    
                    command = line.decode().strip()
                    
                    if not command:
                        continue
                    
                    # Handle special commands
                    if command.lower() == "help":
                        help_text = (
                            "Commands:\n"
                            "  /plan <text>       - Log your intention\n"
                            "  /build on          - Arm for building\n"
                            "  /consent yes       - Give explicit consent\n"
                            "  /consent no        - Deny consent\n"
                            "  /build off         - Disarm\n"
                            "  build <verb> ...   - Execute build (requires arm+consent)\n"
                            "  dev status         - Show mode/arm/consent state\n"
                            "  dev log tail [n]   - Show last n events\n"
                            "  quit               - Disconnect\n"
                        )
                        await self.session_mgr.send_to_player(player_name, help_text)
                        continue
                    
                    if command.lower() == "quit":
                        await self.session_mgr.send_to_player(player_name, "Goodbye!")
                        break
                    
                    # Parse command
                    result = self.parser.parse(player_name, command)
                    
                    # Send response
                    response = result.get("response", "")
                    if response:
                        await self.session_mgr.send_to_player(player_name, response)
                
                except asyncio.TimeoutError:
                    await self.session_mgr.send_to_player(
                        player_name,
                        "Connection idle timeout."
                    )
                    break
        
        except Exception as e:
            print(f"  Error: {e}")
            if player_name:
                log_event({
                    "actor": player_name,
                    "event_type": "telnet_error",
                    "error": str(e),
                })
        
        finally:
            if player_name:
                print(f"✗ {player_name} disconnected")
                self.session_mgr.close_session(player_name)
                log_event({
                    "actor": player_name,
                    "event_type": "telnet_disconnected",
                })
            else:
                writer.close()


async def main():
    """Run the server."""
    server = MUDServer(host="127.0.0.1", port=5555)
    await server.start()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n\nServer stopped.")
