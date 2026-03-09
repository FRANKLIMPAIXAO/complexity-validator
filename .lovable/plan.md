

## Plano: Criar conta admin para franklim.contador@pactributaria.com.br

O usuário anterior com este email foi deletado. Precisamos recriá-lo e atribuir a role de admin.

### Passos

1. **Ativar auto-confirm de email temporariamente** — Usar a ferramenta de configuração de auth para que o signup funcione sem verificação de email.

2. **Você faz o signup na página /signup** — Use o email `franklim.contador@pactributaria.com.br` com a senha que preferir (mínimo 6 caracteres). O sistema criará o perfil automaticamente via trigger.

3. **Atribuir role de admin** — Após o signup, insiro a role `admin` na tabela `user_roles` para o novo user_id, vinculando à company correta.

4. **Desativar auto-confirm** — Reverter para exigir confirmação de email em futuros signups.

### Resultado
Conta funcional com acesso admin completo ao sistema PRAXIS.

