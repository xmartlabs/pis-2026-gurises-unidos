# pis-2026-gurises-unidos

## Correr la app

Next.js 16 + TypeScript + Tailwind. Requiere Node 24.

```bash
npm install
npm run dev      # http://localhost:3000
```

La app queda corriendo en **http://localhost:3000** (`dev`, `start` y Docker usan el mismo puerto).

Otros scripts: `npm run build`, `npm start` (sirve el build en el mismo puerto), `npm run lint`.

### Con Docker

```bash
docker build -t pis-app .
docker run -p 3000:3000 pis-app   # http://localhost:3000
```

Para usar otro puerto, cambiá el lado izquierdo: `-p 8080:3000` → http://localhost:8080.

## Base de datos (desarrollo local)

Postgres corre siempre en Docker, nunca instalado nativo en el sistema.

```bash
cp .env.example .env          # completar POSTGRES_PASSWORD con cualquier valor
docker compose up -d db       # levanta Postgres en :5432 (solo accesible desde localhost)
npx prisma migrate dev        # crea las tablas a partir de prisma/schema.prisma
npx prisma db seed            # carga datos de prueba ficticios
```

`migrate dev` corre el seed automáticamente la primera vez. Para volver a cargarlo sin tocar el
schema: `npx prisma db seed`. Para empezar de cero (borra los datos locales): `npx prisma migrate reset`.

### Ver los datos

```bash
npx prisma studio   # http://localhost:5555
```

### Si cambiás el modelo

Editá `prisma/schema.prisma` y corré:

```bash
npx prisma migrate dev --name describe-the-change
```

Esto genera el SQL versionado en `prisma/migrations/`. Ese archivo se commitea junto con el cambio
en `schema.prisma`, en el mismo PR.

## Deploy

Hay dos workflows, los dos **buildean la imagen en GitHub Actions**, la publican en GHCR y después
entran por SSH a la VM para bajarla y levantarla:

- `Deploy staging`: automático, se dispara al mergear a `staging`.
- `Deploy main`: **manual**. Producción se deploya cuando el equipo decide, no como efecto colateral
  de mergear la PR de promoción. Actions → _Deploy main_ → _Run workflow_ (rama `main`), o
  `gh workflow run deploy-main.yml --ref main`.

```
Actions (runner 4 cores / 16 GB):  docker build → push a ghcr.io/xmartlabs/pis-2026-gurises-unidos
VM (159.89.90.10):                 docker compose pull → up -d
```

La VM no compila nada: el `next build` en el droplet lo dejaba sin RAM y tumbaba hasta sshd.
Cada imagen se tagea con el SHA del commit y con el nombre de la rama.

| Rama      | URL                   | Directorio en la VM | Compose project |
| --------- | --------------------- | ------------------- | --------------- |
| `staging` | `http://<IP_VM>:3001` | `/srv/pis-staging`  | `pis-staging`   |
| `main`    | `http://<IP_VM>:3000` | `/srv/pis-main`     | `pis-main`      |

Los dos entornos son clones y _compose projects_ separados, así que un deploy de uno no toca al otro.
El contenedor siempre escucha 3000 adentro; el puerto de afuera lo pasa el workflow.

El package de GHCR es privado (la org no permite hacerlo público), así que el workflow hace
`docker login ghcr.io` en la VM con el `GITHUB_TOKEN` del run y un `docker logout` al terminar. Es
efímero: no queda ningún PAT guardado en la VM. Para un `docker pull` a mano hay que loguearse con un
PAT propio de `read:packages`.

Requiere en el repo (Settings → Secrets and variables → Actions): los secrets `SSH_HOST` y
`SSH_KEY`, y la variable `SSH_USER` (si no está, el workflow usa `deploy`). El usuario va como
_variable_ y no como secret a propósito: como secret, GitHub lo enmascara y los logs quedan con
`/srv/pis-***` en vez de la ruta real.

### Ver logs y estado en la VM

```bash
cd /srv/pis-staging
COMPOSE_PROJECT_NAME=pis-staging docker compose logs -f
COMPOSE_PROJECT_NAME=pis-staging docker compose ps
```

### Deploy a mano

Como usuario `deploy` (si lo corrés como `root`, los archivos quedan de root y el deploy automático
después falla):

```bash
sudo -iu deploy
cd /srv/pis-staging && git pull --ff-only && ./deploy.sh staging 3001 staging
```

El tercer argumento es el tag de la imagen: un SHA de commit, o `staging`/`main` para la última de
esa rama. `deploy.sh` no actualiza el clon — eso lo hace el workflow antes de invocarlo, así un clon
viejo no puede hacer fallar el deploy con un `deploy.sh: No such file or directory`.

### Rollback

Volver a una imagen anterior no requiere rebuildear: se levanta el tag de ese commit.

```bash
sudo -iu deploy
/srv/pis-main/deploy.sh main 3000 <sha-anterior>
```

Ojo: el próximo deploy automático vuelve a poner la punta de la rama. Para que el rollback quede,
hay que revertir el commit en la rama.

### Base de datos

El servicio `db` ya está en `docker-compose.yml` (agregado junto con el modelo de datos):

```
services:
  web:
    image: ghcr.io/xmartlabs/pis-2026-gurises-unidos:${TAG:-main}
    ports:
      - "${PORT:-3000}:3000"
    env_file: .env
    depends_on:
      - db
    restart: unless-stopped
  db:
    image: postgres:17-alpine
    env_file: .env
    environment:
      POSTGRES_DB: app
    ports:
      - "127.0.0.1:5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped
volumes:
  pgdata:
```

El volumen queda prefijado por el compose project (`pis-staging_pgdata` vs `pis-main_pgdata`), así que
staging y prod tienen bases separadas sin configurar nada. En local, `db` publica el puerto atado a
`127.0.0.1` para que Prisma se conecte desde fuera del contenedor sin exponerlo a la red; en la VM
ese mismo binding alcanza para que solo el propio servidor pueda acceder, nunca internet.

**2. Un `.env` por entorno, a mano en la VM, nunca en el repo:**

```bash
# /srv/pis-staging/.env   (y otro, con otra password, en /srv/pis-main)
POSTGRES_PASSWORD=<distinta por entorno>
DATABASE_URL=postgresql://postgres:<pass>@db:5432/app
```

Sobrevive a los deploys: `git reset --hard` no toca archivos no trackeados. Agregar `.env` al
`.gitignore` para que nadie lo comitee.

**3. Migraciones.** Es la decisión de fondo, no el compose. Lo más simple es correrlas al arrancar el
contenedor (`prisma migrate deploy && node server.js` como comando), así deploy y migración van
juntos y no hay que acordarse. El costo: una migración que falla deja el contenedor reiniciándose en
loop. La alternativa es un paso aparte en el workflow, antes del `up -d`.

**4. RAM.** El droplet tiene 961 MiB. Postgres junto a Next entra, pero justo: conviene agregar swap
antes, o subir el droplet.

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

**5. Backups.** Un cron con `docker exec <contenedor-db> pg_dump` a un archivo fuera del volumen. Sin
esto, un `docker volume rm` de más es pérdida total.

## Estilo de código

- Todo en **inglés**: nombres de variables, funciones, tipos, archivos y strings internos, y también
  los mensajes de commit, los títulos de PR y los nombres de rama.
- **Sin comentarios largos.** El código se explica solo; si hace falta un párrafo, el problema es el
  código. Un comentario corto solo cuando explica un _por qué_ que no se lee en el código.
- Convenciones de nombres:

| Qué                 | Convención   | Ejemplo                                  |
| ------------------- | ------------ | ---------------------------------------- |
| Funciones y métodos | `camelCase`  | `getUserById`, `sendInvite`              |
| Variables           | `camelCase`  | `userId`, `pendingItems`                 |
| Constantes          | `MAYUSCULAS` | `MAX_RETRIES`, `API_BASE_URL`            |
| Archivos            | `kebab-case` | `project-carousel.tsx`, `area-chart.tsx` |

## Ramas

```
feature/*  →  development  →  staging  →  main
                                           ↓
                                    release-please
                                    (tag + CHANGELOG)
```

| Rama          | Para qué                                                                   | Quién la escribe       |
| ------------- | -------------------------------------------------------------------------- | ---------------------- |
| `development` | Integración diaria. Es la rama **default**: toda PR de feature apunta acá. | PRs desde `feature/*`  |
| `staging`     | Pre-producción / QA. Se llena promoviendo `development` entero.            | PR desde `development` |
| `main`        | Producción. Acá corre release-please.                                      | PR desde `staging`     |

Nadie pushea directo a ninguna de las tres. Siempre PR.

## Flujo de trabajo

```bash
# 1. Partir siempre de development actualizado
git checkout development
git pull

# 2. Rama nueva
git checkout -b feat/google-login

# 3. Commitear
git add .
git commit -m "feat(auth): add google login"

# 4. Pushear y abrir la PR
git push -u origin feat/google-login
gh pr create --base development
```

### Nombres de rama

`<tipo>/<descripcion-corta-en-kebab-case>`

```
feat/google-login
fix/user-list-timeout
chore/update-deps
docs/contributing-guide
refactor/extract-http-client
```

## Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/). No es cosmético: release-please
lee el historial de `main` para decidir el número de versión y generar el CHANGELOG. Un commit mal
escrito es una línea que falta en el changelog.

```
<tipo>(<scope opcional>): <descripción en inglés, minúscula, imperativo, sin punto final>
```

| Tipo       | Cuándo                                   | Efecto en la versión      |
| ---------- | ---------------------------------------- | ------------------------- |
| `feat`     | Funcionalidad nueva                      | **minor** (1.2.0 → 1.3.0) |
| `fix`      | Corrección de bug                        | **patch** (1.2.0 → 1.2.1) |
| `perf`     | Mejora de performance                    | patch                     |
| `refactor` | Reescritura sin cambio de comportamiento | ninguno                   |
| `docs`     | Solo documentación                       | ninguno                   |
| `test`     | Solo tests                               | ninguno                   |
| `chore`    | Build, deps, config, CI                  | ninguno                   |
| `style`    | Formato, espacios, punto y coma          | ninguno                   |

### Ejemplos válidos

```
feat(auth): add google login
fix(api): fix timeout on the user list
docs: document the branching flow
chore(deps): update dependencies
refactor(db): extract connection logic into a module
test(auth): cover the expired token case
perf(users): paginate the user query
```

### Breaking changes

Dos formas, ambas suben la **major** (1.2.0 → 2.0.0):

```
feat(api)!: rename `user_id` to `userId`
```

o con footer:

```
feat(api): rename the user_id field

BREAKING CHANGE: clients reading `user_id` stop working.
```

### Ejemplos inválidos

| Mal                   | Por qué                    | Bien                             |
| --------------------- | -------------------------- | -------------------------------- |
| `Add login`           | Sin tipo                   | `feat(auth): add login`          |
| `fix: Fix the bug.`   | Mayúscula y punto final    | `fix: fix the user list timeout` |
| `feat: agregar login` | En español                 | `feat(auth): add login`          |
| `feat: changes`       | No dice nada               | `feat(auth): add refresh token`  |
| `WIP`                 | No es un commit publicable | Squashealo antes de la PR        |
| `Feat: something`     | Tipo capitalizado          | `feat: something`                |

## Pull Requests

**El título de la PR es lo que termina en el historial.** Las PRs a `development` se mergean con
squash, así que los commits individuales desaparecen y sobrevive solo el título. Por eso hay un
check automático (`Conventional commit`) que lo valida y bloquea el merge si está mal.

El título sigue exactamente las mismas reglas que un commit:

```
feat(auth): add google login
```

Las PRs de promoción también:

```
chore: promote development to staging
chore: promote staging to main
```

### Requisitos para mergear

Los tres cumplen lo mismo:

- 2 approvals de otras personas (no podés auto-aprobarte)
- El check `Conventional commit` en verde
- Todas las conversaciones resueltas
- Tu rama actualizada respecto de la base (ver más abajo)
- Los approvals se invalidan si pusheás commits nuevos: hay que pedir re-review

### Qué difiere entre ramas

|                      | `development` | `staging` y `main` |
| -------------------- | ------------- | ------------------ |
| **Merge method**     | Squash        | Merge commit       |
| **Historial lineal** | Obligatorio   | No                 |

La razón es release-please. En `development` queremos historial limpio: una feature = un commit, y
los `wip`/`arreglo typo`/`ahora sí` de la rama de trabajo se colapsan en el título de la PR.

Pero al promover a `staging` y `main`, un squash colapsaría _todas_ las features del ciclo en un
único commit. release-please leería un solo `chore: promover staging a main` y el CHANGELOG saldría
vacío. Con merge commit, cada `feat:` y `fix:` que entró por squash a `development` llega intacto a
`main` y aparece como su propia línea en el changelog. Eso también es por qué `main` y `staging` no
exigen historial lineal: un merge commit es, por definición, no lineal.

### "Require branches to be up to date" (strict)

Está activo en `development` y `staging`. Significa que si la base avanzó desde que abriste tu PR, GitHub no te
deja mergear hasta que la actualices:

```bash
git checkout feat/my-branch
git fetch origin
git rebase origin/development
git push --force-with-lease
```

Usá `--force-with-lease`, nunca `--force`: si alguien más pusheó a tu rama, aborta en vez de
pisarle el trabajo.

El costo es real — cada merge en `development` desactualiza las PRs abiertas, y con varias en vuelo
te toca rebasear seguido. El beneficio es que el CI corre sobre el código que efectivamente va a
quedar en la rama, no sobre una versión vieja que pasaba en aislamiento pero rompe al combinarse.
Con el equipo laburando en paralelo, es la única forma de que "el check está verde" signifique algo.

## Promover a staging y main

```bash
gh pr create --base staging --head development --title "chore: promote development to staging"
gh pr create --base main    --head staging     --title "chore: promote staging to main"
```

Mergealas con **merge commit**, no squash. Mergear a `main` no deploya: producción sale corriendo el
workflow `Deploy main` a mano.

## Releases

Los hace [release-please](https://github.com/googleapis/release-please) leyendo los commits de
`main`. El ciclo:

1. Mergeás `staging → main`. El workflow `Release Please` abre (o actualiza) una PR
   `chore(main): release X.Y.Z` con el `CHANGELOG.md` y el bump de `version` en `package.json`.
   El número sale de los tipos de commit: un `feat` sube la minor, un `fix`/`perf` la patch.
2. Esa PR se revisa como cualquier otra — 2 approvals. Se puede editar el CHANGELOG antes de mergear.
3. Al mergearla, release-please crea el tag `vX.Y.Z` y el GitHub Release.

Mergear la PR de release tampoco deploya: producción sigue saliendo con `Deploy main` a mano.

La config vive en `release-please-config.json` y la versión actual en `.release-please-manifest.json`
(la fuente de verdad; `package.json` la sigue).

### Por qué `main` no tiene status checks required

El workflow usa el `GITHUB_TOKEN` del run, y las PRs creadas con ese token no disparan otros
workflows: el check `Conventional commit` nunca correría sobre la PR de release y la dejaría
bloqueada para siempre. Como era el único check, en el ruleset de `main` está apagada la regla
_Require status checks to pass_ entera (GitHub no acepta la lista vacía), y con ella el _strict_ de
ramas actualizadas. `main` solo recibe la PR de promoción desde `staging` y la de release-please, y
sigue exigiendo 2 approvals, conversaciones resueltas y merge commit. En `development` y `staging`
no cambia nada: ahí se validan los títulos que arman el CHANGELOG.

## Reviews

- Toda PR necesita 2 approvals.
- Los approvals se invalidan al pushear commits nuevos.
- Hay que resolver todas las conversaciones antes de mergear.
- Si pedís cambios, dejá claro qué es bloqueante y qué es sugerencia.

## Notas

- El borrado automático de ramas al mergear está **desactivado**: en las PRs de promoción la rama
  _head_ es `staging`, y GitHub la borraba al mergear `staging → main`. Las ramas de feature se
  borran a mano después de mergear.
- El check de título corre con `pull_request_target`, así que se re-evalúa cuando editás el título
  de la PR (a diferencia de `pull_request`, que no se dispara con ese evento).
