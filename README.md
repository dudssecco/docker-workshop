# Desafio Docker - Lista de Tarefas

Voce recebeu um projeto com **frontend** (React) e **backend** (Node.js + Express) prontos.
Seu objetivo eh usar Docker para colocar tudo para rodar: backend, frontend e banco de dados PostgreSQL.

O desafio tem **4 etapas**. Tente completar todas em 2 horas!

---

## Estrutura do Projeto

```
Workshop/
├── frontend/    <-- App React (porta 3000)
├── backend/     <-- API Express (porta 8000)
└── README.md    <-- Voce esta aqui
```

### O que o backend espera:

| Variavel de ambiente | Descricao             | Valor padrao |
| -------------------- | --------------------- | ------------ |
| `PORT`               | Porta do servidor     | `8000`       |
| `DB_HOST`            | Host do PostgreSQL    | `localhost`  |
| `DB_PORT`            | Porta do PostgreSQL   | `5432`       |
| `DB_USER`            | Usuario do banco      | `postgres`   |
| `DB_PASSWORD`        | Senha do banco        | `postgres`   |
| `DB_NAME`            | Nome do banco de dados| `tododb`     |

### O que o frontend espera:

| Variavel de ambiente  | Descricao          | Valor padrao            |
| --------------------- | ------------------ | ----------------------- |
| `REACT_APP_API_URL`   | URL da API backend | `http://localhost:8000` |

---

## Etapa 1 - Dockerizando o Backend (30 min)

**Objetivo:** Criar um Dockerfile para o backend e rodar com Docker.

**O que voce precisa fazer:**

1. Crie um arquivo chamado `Dockerfile` dentro da pasta `backend/`
2. O Dockerfile deve:
   - Usar a imagem `node:20-alpine` como base
   - Definir o diretorio de trabalho como `/app`
   - Copiar os arquivos de dependencias e instalar com `npm install`
   - Copiar o restante do codigo
   - Expor a porta `8000`
   - Definir o comando para iniciar: `npm start`
3. Faca o build da imagem com `docker build`
4. Rode o container com `docker run`

**Como saber se deu certo:**
- No terminal, voce deve ver: `Backend rodando na porta 8000`
- O backend vai tentar conectar no banco e falhar - **isso eh esperado!** Vamos resolver na proxima etapa.

**Comandos uteis:**
```bash
docker build -t <nome-da-imagem> .
docker run -p <porta-host>:<porta-container> <nome-da-imagem>
```

---

## Etapa 2 - Subindo o Banco de Dados (30 min)

**Objetivo:** Rodar o PostgreSQL em um container e conectar ao backend.

**O que voce precisa fazer:**

1. Suba um container PostgreSQL usando a imagem `postgres:16-alpine`
   - Use `-e` para definir as variaveis: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
   - Exponha a porta `5432`
2. Agora voce precisa que o backend **consiga se comunicar** com o banco. Para isso:
   - Crie uma **network** do Docker
   - Conecte **ambos os containers** nessa mesma network
   - Use a flag `-e` no backend para apontar o `DB_HOST` para o **nome do container** do banco

**Como saber se deu certo:**
- O backend deve logar: `Banco de dados conectado e tabela criada!`
- Acesse `http://localhost:8000/health` e veja `{"status":"ok"}`
- Teste criar uma tarefa:
  ```bash
  curl -X POST http://localhost:8000/tasks \
    -H "Content-Type: application/json" \
    -d '{"title": "Minha primeira tarefa"}'
  ```

**Comandos uteis:**
```bash
docker network create <nome-da-rede>
docker run --network <nome-da-rede> --name <nome> ...
```

---

## Etapa 3 - Dockerizando o Frontend (20 min)

**Objetivo:** Criar um Dockerfile para o frontend e rodar com Docker.

**O que voce precisa fazer:**

1. Crie um arquivo chamado `Dockerfile` dentro da pasta `frontend/`
2. O Dockerfile eh muito parecido com o do backend, mas:
   - A porta exposta eh `3000`
   - O comando de iniciar tambem eh `npm start`
3. Faca o build e rode o container
   - Passe a variavel de ambiente `REACT_APP_API_URL` apontando para o backend

**Como saber se deu certo:**
- Acesse `http://localhost:3000` no navegador
- Voce deve ver a interface da Lista de Tarefas
- Adicione uma tarefa e veja se ela aparece na lista!

---

## Etapa 4 - Docker Compose (40 min)

**Objetivo:** Criar um `docker-compose.yml` que sobe tudo com um unico comando.

**O que voce precisa fazer:**

1. Pare todos os containers que estao rodando
2. Crie um arquivo `docker-compose.yml` na **raiz do projeto** (fora das pastas frontend/backend)
3. Defina 3 servicos:
   - `db` - PostgreSQL (use a imagem diretamente, sem Dockerfile)
   - `backend` - Build a partir da pasta `./backend`
   - `frontend` - Build a partir da pasta `./frontend`
4. Configure:
   - As variaveis de ambiente de cada servico
   - As portas expostas
   - Use `depends_on` para definir a ordem de inicializacao
   - **Bonus:** Use um `volume` para persistir os dados do banco

**Como saber se deu certo:**
- Rode `docker compose up --build` e todos os 3 servicos devem subir
- Acesse `http://localhost:3000` e a aplicacao deve funcionar completa
- Adicione tarefas, marque como concluidas, remova... tudo deve funcionar!

**Comandos uteis:**
```bash
docker compose up --build
docker compose down
docker compose logs -f
```

---

## Dicas Gerais

- **Leia os erros!** O Docker da mensagens bem claras sobre o que esta errado
- Sempre verifique se nao tem containers antigos rodando na mesma porta: `docker ps`
- Para parar tudo de uma vez: `docker stop $(docker ps -q)`
- Se algo nao funciona, veja os logs: `docker logs <nome-do-container>`
- O `.dockerignore` ja esta configurado para nao copiar `node_modules` para dentro da imagem

## Bonus

Terminou tudo? Tente esse desafio extra:

- Adicione um **healthcheck** no docker-compose para o banco de dados
