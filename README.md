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

## Deploy

Automático: mergear a `staging` o a `main` dispara el workflow `Deploy`, que entra por SSH a la VM,
actualiza el clon de esa rama y levanta el contenedor con `docker compose up -d --build`.

| Rama | URL | Directorio en la VM | Compose project |
|---|---|---|---|
| `staging` | `http://<IP_VM>:3001` | `/srv/pis-staging` | `pis-staging` |
| `main` | `http://<IP_VM>:3000` | `/srv/pis-main` | `pis-main` |

Los dos entornos son clones y *compose projects* separados, así que un deploy de uno no toca al otro.
El contenedor siempre escucha 3000 adentro; el puerto de afuera lo pasa el workflow.

Requiere tres secrets en el repo (Settings → Secrets and variables → Actions): `SSH_HOST`,
`SSH_USER`, `SSH_KEY`.

### Ver logs y estado en la VM

```bash
cd /srv/pis-staging
COMPOSE_PROJECT_NAME=pis-staging docker compose logs -f
COMPOSE_PROJECT_NAME=pis-staging docker compose ps
```

### Deploy a mano

```bash
/srv/pis-staging/deploy.sh staging 3001
/srv/pis-main/deploy.sh main 3000
```

### Rollback

```bash
cd /srv/pis-main
git reset --hard <sha-anterior>
COMPOSE_PROJECT_NAME=pis-main PORT=3000 docker compose up -d --build
```

Ojo: el próximo deploy automático vuelve a poner la punta de la rama. Para que el rollback quede,
hay que revertir el commit en la rama.

## Ramas

```
feature/*  →  development  →  staging  →  main
                                           ↓
                                    release-please
                                    (tag + CHANGELOG)
```

| Rama | Para qué | Quién la escribe |
|---|---|---|
| `development` | Integración diaria. Es la rama **default**: toda PR de feature apunta acá. | PRs desde `feature/*` |
| `staging` | Pre-producción / QA. Se llena promoviendo `development` entero. | PR desde `development` |
| `main` | Producción. Acá corre release-please. | PR desde `staging` |

Nadie pushea directo a ninguna de las tres. Siempre PR.

## Flujo de trabajo

```bash
# 1. Partir siempre de development actualizado
git checkout development
git pull

# 2. Rama nueva
git checkout -b feat/login-con-google

# 3. Commitear
git add .
git commit -m "feat(auth): agregar login con Google"

# 4. Pushear y abrir la PR
git push -u origin feat/login-con-google
gh pr create --base development
```

### Nombres de rama

`<tipo>/<descripcion-corta-en-kebab-case>`

```
feat/login-con-google
fix/timeout-en-listado
chore/actualizar-deps
docs/guia-de-contribucion
refactor/extraer-cliente-http
```

## Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/). No es cosmético: release-please
lee el historial de `main` para decidir el número de versión y generar el CHANGELOG. Un commit mal
escrito es una línea que falta en el changelog.

```
<tipo>(<scope opcional>): <descripción en minúscula, imperativo, sin punto final>
```

| Tipo | Cuándo | Efecto en la versión |
|---|---|---|
| `feat` | Funcionalidad nueva | **minor** (1.2.0 → 1.3.0) |
| `fix` | Corrección de bug | **patch** (1.2.0 → 1.2.1) |
| `perf` | Mejora de performance | patch |
| `refactor` | Reescritura sin cambio de comportamiento | ninguno |
| `docs` | Solo documentación | ninguno |
| `test` | Solo tests | ninguno |
| `chore` | Build, deps, config, CI | ninguno |
| `style` | Formato, espacios, punto y coma | ninguno |

### Ejemplos válidos

```
feat(auth): agregar login con Google
fix(api): corregir timeout en el listado de usuarios
docs: documentar el flujo de ramas
chore(deps): actualizar dependencias
refactor(db): extraer la lógica de conexión a un módulo
test(auth): cubrir el caso de token expirado
perf(listado): paginar la consulta de usuarios
```

### Breaking changes

Dos formas, ambas suben la **major** (1.2.0 → 2.0.0):

```
feat(api)!: renombrar el campo `user_id` a `userId`
```

o con footer:

```
feat(api): renombrar el campo user_id

BREAKING CHANGE: los clientes que lean `user_id` dejan de funcionar.
```

### Ejemplos inválidos

| Mal | Por qué | Bien |
|---|---|---|
| `Agregar login` | Sin tipo | `feat(auth): agregar login` |
| `fix: Corregir el bug.` | Mayúscula y punto final | `fix: corregir el timeout del listado` |
| `feat: cambios` | No dice nada | `feat(auth): agregar refresh token` |
| `WIP` | No es un commit publicable | Squashealo antes de la PR |
| `Feat: algo` | Tipo capitalizado | `feat: algo` |

## Pull Requests

**El título de la PR es lo que termina en el historial.** Las PRs a `development` se mergean con
squash, así que los commits individuales desaparecen y sobrevive solo el título. Por eso hay un
check automático (`Conventional commit`) que lo valida y bloquea el merge si está mal.

El título sigue exactamente las mismas reglas que un commit:

```
feat(auth): agregar login con Google
```

Las PRs de promoción también:

```
chore: promover development a staging
chore: promover staging a main
```

### Requisitos para mergear

Los tres cumplen lo mismo:

- 1 approval de otra persona (no podés auto-aprobarte)
- El check `Conventional commit` en verde
- Todas las conversaciones resueltas
- Tu rama actualizada respecto de la base (ver más abajo)
- Los approvals se invalidan si pusheás commits nuevos: hay que pedir re-review

### Qué difiere entre ramas

| | `development` | `staging` y `main` |
|---|---|---|
| **Merge method** | Squash | Merge commit |
| **Historial lineal** | Obligatorio | No |

La razón es release-please. En `development` queremos historial limpio: una feature = un commit, y
los `wip`/`arreglo typo`/`ahora sí` de la rama de trabajo se colapsan en el título de la PR.

Pero al promover a `staging` y `main`, un squash colapsaría *todas* las features del ciclo en un
único commit. release-please leería un solo `chore: promover staging a main` y el CHANGELOG saldría
vacío. Con merge commit, cada `feat:` y `fix:` que entró por squash a `development` llega intacto a
`main` y aparece como su propia línea en el changelog. Eso también es por qué `main` y `staging` no
exigen historial lineal: un merge commit es, por definición, no lineal.

### "Require branches to be up to date" (strict)

Está activo en las tres ramas. Significa que si la base avanzó desde que abriste tu PR, GitHub no te
deja mergear hasta que la actualices:

```bash
git checkout feat/mi-rama
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
gh pr create --base staging --head development --title "chore: promover development a staging"
gh pr create --base main    --head staging     --title "chore: promover staging a main"
```

Mergealas con **merge commit**, no squash.

## Reviews

- Toda PR necesita 1 approval.
- Los approvals se invalidan al pushear commits nuevos.
- Hay que resolver todas las conversaciones antes de mergear.
- Si pedís cambios, dejá claro qué es bloqueante y qué es sugerencia.

## Notas

- El borrado automático de ramas al mergear está **desactivado**: en las PRs de promoción la rama
  *head* es `staging`, y GitHub la borraba al mergear `staging → main`. Las ramas de feature se
  borran a mano después de mergear.
- El check de título corre con `pull_request_target`, así que se re-evalúa cuando editás el título
  de la PR (a diferencia de `pull_request`, que no se dispara con ese evento).
