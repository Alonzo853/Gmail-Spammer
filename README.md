# Gmail-Spammer
Gmail spammer made by Alonzo

# Instractions
1. open the folder in CMD

2. write EXACTLY:
npm install

3. Open the .env file inside the folder and change the values 
A: Put your Gmail
B: Put your Gmail app's ID/Password
C: Put the Gmail of who you are trying to send it to

4. run (In the folder's CMD) EXACTLY:
node send-loop.js 

If you did everything correctly, you should now start to see:
email 1- sent
email 2- sent
etc...

To create an app in gmail:

in the browser, go to: https://myaccount.google.com
Go to: security tab https://myaccount.google.com/security
Click 2 step verification & Set it up, if already set up: put your password
In the App passwords page: Under Select app pick Mail
Under Select device pick something (or choose Other and name it).
Click Generate. Google will show a 16-character password once — copy it now.
Paste that 16-character value into your .env as APP_PASSWORD


# IMPORTNET

**You must have 2-Step Verification enabled; otherwise the App passwords option won’t appear.**

**App passwords won’t be available if your account is managed by a work/school Google Workspace admin who has disabled them, if you’re on Google’s Advanced Protection program, or if your 2FA is set up only with security keys in some configurations. If you don't see the option, one of those is likely the cause.**

**Google shows the app password only once after generation. If you lose it, revoke and generate a new one.**
