# Auditoria contra OWASP: Authentication, Authorization, JWT, Forgot Password

> Comparação real (não checklist genérico) entre 5 cheat sheets do OWASP
> Cheat Sheet Series e o estado real de `front/` + `api/`: Authentication,
> Authorization, Authorization Testing Automation, JSON Web Token, Forgot
> Password. Mirror completo, em tom de referência, em 6 páginas de
> `How to Dev/docs-frontend/seguranca/` (`POLITICA-DE-SENHA`,
> `REDEFINICAO-DE-SENHA`, `FORCA-BRUTA-E-BLOQUEIO`, `IDOR-E-AUTORIZACAO`,
> `AUTORIZACAO-AUTOMATIZADA`, `JWT`).

## Achado mais crítico, corrigido em `api/` (com aprovação explícita)

`api/config/initializers/devise.rb` tinha `config.password_length =
6..128` configurado, mas `User` incluía só `:database_authenticatable,
:jwt_authenticatable`, nunca `:validatable` (o único módulo Devise que lê
essa config) — `POST /api/v1/admin/users` direto aceitava senha de 1
caractere, ou uma senha em branco que deixava o usuário sem
`encrypted_password` válido nenhum (o setter do Devise só grava o hash
quando o valor vem preenchido — criar com senha vazia gerava conta
inutilizável, não um erro claro).

Usuário aprovou corrigir só este item na API (dos vários achados,
era o único com risco de segurança real e imediato). Implementado em
`api/app/models/user.rb`, sem trazer o módulo `:validatable` inteiro
(que validaria e-mail junto, fora do pedido):

```ruby
validates :password, presence: true, on: :create
validates :password, length: { within: Devise.password_length }, allow_blank: true
```

`allow_blank: true` preserva "senha em branco na edição = não trocar".
Verificado com `bin/rails runner` antes de considerar pronto: senha em
branco no create rejeitada, senha de 3 caracteres rejeitada, senha real
aceita, senha em branco no update (registro existente) continua válida —
os quatro cenários se comportam exatamente como o `allow_blank`/`on:
:create` prevê. `bin/rails test` (105/105), `bin/rubocop` e `bin/brakeman
--no-pager` (os três gates obrigatórios de `api/CLAUDE.md`) passaram
limpos depois da mudança. `lib/form-limits.ts` e `docs/FORMULARIOS.md`
atualizados pra não afirmar mais que a regra é "inerte" no backend.

## Achado grande: fluxo de "esqueci minha senha" não existe na API

`api/config/routes.rb` desativa `:passwords` do Devise
(`skip: [:registrations, :passwords, :confirmations, :unlocks]`), `User`
não inclui `:recoverable`. O front já tem tela, Zod e mensagem genérica
prontos (`esqueci-senha`, `alterar-senha`) — `services/api-identity.ts`
já documenta a ausência com um stub 501 explícito, não fingindo que
funciona. **Corrigido nesta fase, só no front:** o design de
`alterar-senha` assumia auto-login depois do reset (comentário "já
autentica... entra direto", redirect pro dashboard) — contraria o OWASP
Forgot Password Cheat Sheet direto ("nunca logar automaticamente depois
de reset"). Trocado pra redirecionar pra `/login`, antes mesmo da API
existir, pra não nascer com o contrato errado quando o backend for
implementado. `primeiro-acesso` ficou como estava, de propósito — é
ativação de conta nova via convite de admin, não recuperação de conta
potencialmente comprometida, cenário que o OWASP Forgot Password não
cobre.

## Achados reais menores, todos fora de `front/`

- **Sem log de evento de segurança na API**: `Rails.logger` só é chamado
  em `error_handler.rb` pra erro interno (banco, parse) — nunca pra falha
  de login, bloqueio de rack-attack, ou `CanCan::AccessDenied` (403).
- **Sem MFA** em lugar nenhum do projeto — confirmado por grep, zero
  TOTP/2FA.
- **Cobertura de teste de autorização só no admin wildcard**: os 16
  arquivos de teste de controller admin usam só `users(:one)` (o papel
  "Plataforma", que pode tudo) — nenhum usa `users(:two)` (o único
  fixture com escopo restrito) contra uma rota HTTP real. Só existe
  negação testada no nível de `Ability` (`ability_test.rb`), não de
  controller.

## Confirmado correto, sem mudança necessária

- Mensagem de erro de login já genérica (`FailureApp#mensagem`) — senha
  errada e e-mail inexistente dão a mesma resposta, mesmo status.
- rack-attack real, três camadas (IP, e-mail, banimento por burst) — não
  é `:lockable` do Devise, é uma substituição arquitetural válida.
- IDOR: todo controller admin usa o idioma "fetch-then-authorize" do
  CanCanCan — `Model.find(params[:id])` sem escopo, mas `authorize!`
  reavalia a instância carregada contra condições reais de tenant em
  `ability.rb`, então acesso cross-tenant vira 403 real, não vazamento de
  dado (achado menor: vira 403 em vez de 404, um oráculo de existência de
  baixa severidade, não um IDOR completo).
- Front nunca confia em checagem client-side pra autorização — já
  documentado antes desta fase (`MEDIDAS-DE-SEGURANCA.md`), reforçado
  aqui com a leitura de `CurrentUserSerializer` (não manda papel/
  permissão pro front, de propósito).
- JWT: algoritmo HS256 (default seguro da gem, produção falha sem
  `DEVISE_JWT_SECRET_KEY`), claims mínimas (sem nome/e-mail/permissão no
  payload), revogação real via `jti` (não `Devise::JWT::
  RevocationStrategies::Null`) — logout invalida token de verdade.

## Decisão tomada: só o crítico, resto fica documentado

Perguntado ao usuário se deveria prosseguir pra `api/` — resposta: só o
achado mais crítico (validação de senha, acima). Os demais achados que
exigem mudança em `api/` (`:recoverable`, log de evento de segurança,
teste de controller com usuário restrito, matriz de autorização
automatizada) **não foram implementados** nesta fase — ficam registrados
nas páginas próprias da wiki
([Redefinição de senha](../../How to Dev/docs-frontend/seguranca/REDEFINICAO-DE-SENHA.md),
[Força bruta e bloqueio](../../How to Dev/docs-frontend/seguranca/FORCA-BRUTA-E-BLOQUEIO.md),
[IDOR e autorização](../../How to Dev/docs-frontend/seguranca/IDOR-E-AUTORIZACAO.md),
[Autorização automatizada](../../How to Dev/docs-frontend/seguranca/AUTORIZACAO-AUTOMATIZADA.md))
pra quando o time decidir mexer em `api/`.
