@echo off
rem Regenere assets\CV_Ago_Ezoolim-Ela_EN.pdf a partir de cv\index-en.html (Edge en mode headless).
setlocal
set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
set "ICI=%~dp0"
set "PROFIL=%TEMP%\edge-cv-profil-en"
set "SORTIE=%ICI%..\assets\CV_Ago_Ezoolim-Ela_EN.pdf"
"%EDGE%" --headless=new --user-data-dir="%PROFIL%" --virtual-time-budget=8000 --no-pdf-header-footer --print-to-pdf="%SORTIE%" "file:///%ICI:\=/%index-en.html"
if exist "%SORTIE%" (echo PDF genere : %SORTIE%) else (echo Echec : PDF non genere.)
endlocal
pause
