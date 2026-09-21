@echo off
rem Regenere assets\CV_Ago_Ezoolim-Ela.pdf a partir de cv\index.html (Edge en mode headless).
rem Usage : double-cliquer sur ce fichier, ou l'executer depuis le dossier cv\.
setlocal
set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
set "ICI=%~dp0"
set "PROFIL=%TEMP%\edge-cv-profil"
set "SORTIE=%ICI%..\assets\CV_Ago_Ezoolim-Ela.pdf"
"%EDGE%" --headless=new --user-data-dir="%PROFIL%" --virtual-time-budget=8000 --no-pdf-header-footer --print-to-pdf="%SORTIE%" "file:///%ICI:\=/%index.html"
if exist "%SORTIE%" (echo PDF genere : %SORTIE%) else (echo Echec : PDF non genere. Verifier qu'Edge est installe et que la connexion internet est active pour les polices.)
endlocal
pause
