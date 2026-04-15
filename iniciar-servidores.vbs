Set WShell = CreateObject("WScript.Shell")

' ── SW Game (localhost:3000) ─────────────────
WShell.Run "cmd /c node ""C:\Users\jschl\Desktop\Claude\Output\sw-game\server.js""", 0, False

' Esperar 2 segundos antes de arrancar N8N
WScript.Sleep 2000

' ── N8N (localhost:5678) ─────────────────────
WShell.Run "cmd /c ""C:\Users\jschl\AppData\Roaming\npm\n8n.cmd"" start", 0, False
