# Habilitar Apps Script API
> [https://script.google.com/home/usersettings](app-script-usersettings)

## ▶️ Clasp

```shell
npm install -g @google/clasp
clasp login --no-localhost # Login in Google
clasp clone <PROJECT_ID> # Clone project
clasp create --title "<PROJECT_NAME>" --type standalone # Create new project
clasp status
clasp push
clasp pull
clasp open # Open in web editor
clasp deploy --description "<DEPLOY_DESCRIPTION>"
```

## ▶️ Configurar nuevo proyecto

```shell
npm init -y
npm i -D typescript @types/google-apps-script esbuild cpx
npm i -D eslint prettier @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-config-prettier eslint-plugin-prettier
npm i -D esbuild
npm i -D gas-local ts-node # Google mocks
```

## ▶️ Compilar

```shell
npm run build
```


```
https://script.google.com/macros/s/fake/exec?action=search
https://script.google.com/macros/s/fake/exec?action=save
https://script.google.com/macros/s/fake/exec?action=update&gmailMessageId=baecc41e-655a-47d6-ab9e-22d58b06dc4a&category=TAXI&amount=12.5&comments=Prueba
```

