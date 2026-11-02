# Finanças Smart

## Acesse e teste o site

**[Abrir Finanças Smart](https://financas-smart.gabriela-lima0717.chatgpt.site/)**

Clique em **Cadastre-se** para criar uma conta ou em **Entrar** para acessar uma conta já criada neste navegador. Não é necessário instalar o projeto para testar.

As contas e os dados ficam salvos apenas no navegador utilizado, sem sincronização entre dispositivos. Para conhecer as funcionalidades, use dados fictícios e a demonstração opcional disponível no painel.

Aplicação de finanças pessoais em português, gratuita e sem backend. React, TypeScript, Vite, Tailwind CSS, Lucide, Recharts, React Router e Dexie/IndexedDB.

## Executar

Requer Node.js 20.19+ ou 22+ e npm.

```sh
npm install
npm run dev
```

Abra a URL exibida pelo Vite. Para gerar a versão distribuível:

```sh
npm run build
npm run preview
```

O diretório `dist` pode ser servido por qualquer servidor estático. Configure fallback de navegação para `index.html` em hospedagens. Não abra `index.html` diretamente pelo protocolo file.

## Funcionalidades

- Painel com seleção de mês, saldo acumulado, receitas, despesas, economia e gráficos.
- Transações com edição, exclusão e busca por descrição/categoria, tipo e mês.
- Metas com prazo, acompanhamento e atualização do valor guardado.
- Simulação de juros compostos com aportes mensais ao final de cada período.
- Conteúdo educativo integrado, sem consultas a APIs.
- Perfil, backup JSON e restauração validada e atômica.
- Demonstração opcional com dados fictícios, carregada somente em uma base vazia.
- Layout responsivo e ocultação de valores no painel.

Os registros ficam no IndexedDB do navegador. O nome do perfil fica no banco local de contas. As senhas são verificadas com PBKDF2-SHA-256, salt aleatório e 600.000 iterações; não são salvas em texto puro. Há cadastro e login locais com nome, e-mail e senha. Cada conta usa um banco IndexedDB separado. Não há sincronização entre dispositivos. A sessão fica apenas em memória e exige novo login ao recarregar a página. Não compartilhe seu perfil de navegador se quiser manter seus registros privados. A exportação é um arquivo JSON sem criptografia.

A versão de produção instala um service worker para reabrir a aplicação offline após a primeira visita online e conclusão do cache. O modo de desenvolvimento precisa do servidor Vite. Instalar as dependências exige internet; usar a aplicação compilada não exige serviços externos. Limpar os dados do site pode apagar os registros: guarde backups.

As metas não movimentam automaticamente o saldo. O simulador utiliza taxa anual efetiva convertida para mensal, sem impostos, inflação ou custos; seus resultados são ilustrativos.

O login local não criptografa os registros nem protege contra acesso às ferramentas do computador. Não há confirmação de e-mail ou recuperação de senha por e-mail. Os backups contêm apenas os dados financeiros, sem credenciais. O acesso direto aos registros da versão sem login foi removido para evitar cópias indiscriminadas entre contas. O banco antigo permanece intacto; a recuperação pela interface exige um backup pessoal exportado anteriormente.

Testes de autenticação, isolamento e regressões de QA: `npm test`.


Os prazos fracionários do simulador são arredondados ao mês mais próximo. A tela informa o número de meses utilizado; patrimônio, aportes e gráfico usam esse mesmo prazo. Datas inexistentes, valores com frações de centavo e descrições fora dos limites são rejeitados nos formulários e nos backups.
