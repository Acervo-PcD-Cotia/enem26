
# Plano de Evolucao ENEM+ 2026 -- Plataforma de Foco Absoluto

## Visao Geral

Este plano implementa as 6 atualizacoes obrigatorias solicitadas, sem criar novas abas no menu e preservando a estrutura existente (Hoje, Trilhas, Revisoes, Redacao, Comunidade).

---

## 1. ABA "HOJE" (Dashboard) -- Foco Absoluto

**Arquivo:** `src/pages/Dashboard.tsx`

**Estado atual:** Mostra 3 tarefas mock fixas, stats gerais, gamificacao, check-in semanal, caderno de erros e conquistas. Muita informacao competindo por atencao.

**Mudancas:**
- Substituir a lista de 3 tarefas mock por UMA UNICA tarefa principal destacada, com texto motivacional: "Faca isso agora. O resto vem depois."
- Derivar a tarefa principal da logica: (1) revisao RPA atrasada > (2) revisao RPA de hoje > (3) proximo assunto na trilha
- Remover os cards de "Caderno de Erros" e "Conquistas" do dashboard (acessiveis via menu lateral ou settings)
- Simplificar os stats: manter apenas streak e progresso do dia
- Manter o Pomodoro (ferramenta de foco)
- Mover check-in semanal para dentro do header como icone discreto, nao como banner grande

---

## 2. TRILHAS DE ESTUDO -- Resumo Essencial do Tema

**Arquivo:** `src/pages/Subjects.tsx` (e novo componente `src/components/subjects/SubjectEssentialSummary.tsx`)

**Estado atual:** Lista de assuntos com status e botao de materiais. Sem conteudo resumido.

**Mudancas:**
- Ao clicar no nome do assunto (nao no status), abrir um Sheet/Drawer com o "Resumo Essencial do Tema" contendo:
  - O que mais cai no ENEM (2-3 topicos)
  - Erros comuns dos alunos
  - Armadilhas de prova
  - Dica pratica para acertar
- Conteudo gerado por IA (Lovable AI com Gemini Flash) sob demanda e cacheado no banco
- Tempo maximo de leitura: 5 minutos (indicador visual)
- Sem PDFs, sem textos longos

**Nova tabela (migracao):**
```sql
CREATE TABLE subject_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES subjects(id) NOT NULL,
  content TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject_id)
);
```

---

## 3. REVISOES RPA -- Conteudo Pratico por Revisao

**Arquivo:** `src/pages/Reviews.tsx` (e novo componente `src/components/reviews/ReviewSession.tsx`)

**Estado atual:** Lista de revisoes com botoes de concluir/adiar. Sem conteudo de revisao.

**Mudancas:**
- Ao clicar em "Concluir" uma revisao, abrir uma sessao de revisao contendo:
  - Texto humano: "Voce estudou isso ha alguns dias. Vamos garantir que nao esqueceu."
  - 3 questoes objetivas rapidas (buscadas do banco `questions` pelo `subject_id`)
  - 1 resumo visual curto (gerado por IA ou puxado do `subject_summaries`)
  - 1 dica/macete pratico
- Revisao marcada como concluida somente apos responder as 3 questoes
- Se nao houver questoes no banco para aquele assunto, mostrar apenas o resumo + dica e permitir concluir

---

## 4. REDACAO -- Modo Guiado

**Arquivo:** `src/pages/Essays.tsx`

**Estado atual:** Seleciona tema e vai direto para textarea + avaliacao por competencia. Sem guia.

**Mudancas:**
- Criar fluxo em etapas obrigatorias antes de liberar o campo de texto:
  1. **Tese** -- campo de 1 frase ("Qual sua posicao sobre o tema?")
  2. **Argumento 1** -- campo de topico ("Primeiro argumento de apoio")
  3. **Argumento 2** -- campo de topico ("Segundo argumento de apoio")
  4. **Proposta de Intervencao** -- checklist simples (Agente, Acao, Meio, Detalhamento, Finalidade)
  5. **Escrita completa** -- textarea liberado com a estrutura visivel como guia lateral
- Salvar os dados estruturados junto com a redacao
- O aluno nao pode pular etapas (botao "Proximo" so habilita apos preencher)

**Nova tabela (migracao):**
```sql
ALTER TABLE essays ADD COLUMN IF NOT EXISTS thesis TEXT;
ALTER TABLE essays ADD COLUMN IF NOT EXISTS argument_1 TEXT;
ALTER TABLE essays ADD COLUMN IF NOT EXISTS argument_2 TEXT;
ALTER TABLE essays ADD COLUMN IF NOT EXISTS intervention_agent TEXT;
ALTER TABLE essays ADD COLUMN IF NOT EXISTS intervention_action TEXT;
ALTER TABLE essays ADD COLUMN IF NOT EXISTS intervention_means TEXT;
ALTER TABLE essays ADD COLUMN IF NOT EXISTS intervention_detail TEXT;
ALTER TABLE essays ADD COLUMN IF NOT EXISTS intervention_purpose TEXT;
```

---

## 5. CADERNO DE ERROS -- Uso Inteligente

**Arquivo:** `src/pages/ErrorNotebook.tsx`

**Estado atual:** Ja classifica erros em 4 categorias (conteudo, interpretacao, atencao, tempo), mostra stats e analise de padroes. Bem implementado.

**Mudancas incrementais:**
- Adicionar secao "Seu perfil de erro" no topo: frase clara tipo "Voce erra mais por **falta de atencao** em **Matematica**" (calculado dos dados existentes)
- Adicionar agrupamento por materia na analise de padroes (qual materia tem mais erros de cada tipo)
- Tom mais humano nos textos: trocar "Classifique seus erros" por "Por que voce errou? Entender isso muda tudo."

---

## 6. COMUNIDADE -- Controle Total

**Arquivo:** `src/pages/Community.tsx`

**Estado atual:** Permite 4 tipos de post (Duvida, Ajuda, Discussao, Recurso) + tab de recursos. Feed generico.

**Mudancas:**
- Restringir tipos de publicacao a exatamente 3:
  - "Duvida objetiva" (question)
  - "Algo que aprendi hoje" (learning)
  - "Erro que cometi e entendi" (error_insight)
- Remover tipos "help", "discussion", "resource"
- Remover a aba de Recursos separada (simplificar para uma unica lista)
- Limitar feed a 20 posts mais recentes (sem scroll infinito)
- Adicionar label amigavel para cada tipo

---

## Secao Tecnica

### Arquivos a criar
| Arquivo | Descricao |
|---------|-----------|
| `src/components/subjects/SubjectEssentialSummary.tsx` | Drawer com resumo essencial do tema |
| `src/components/reviews/ReviewSession.tsx` | Sessao de revisao interativa |
| `src/components/essays/EssayGuidedFlow.tsx` | Fluxo guiado de redacao em etapas |

### Arquivos a modificar
| Arquivo | Mudanca |
|---------|---------|
| `src/pages/Dashboard.tsx` | Simplificar para foco absoluto em 1 tarefa |
| `src/pages/Subjects.tsx` | Adicionar click no assunto para abrir resumo |
| `src/pages/Reviews.tsx` | Integrar sessao de revisao interativa |
| `src/pages/Essays.tsx` | Substituir editor direto pelo fluxo guiado |
| `src/pages/ErrorNotebook.tsx` | Adicionar perfil de erro e tom humano |
| `src/pages/Community.tsx` | Restringir a 3 tipos, remover aba recursos |

### Migracoes de banco
1. Tabela `subject_summaries` para cache de resumos
2. Colunas de estrutura guiada na tabela `essays`

### Integracao com IA
- Usar Lovable AI (Gemini 2.5 Flash) via edge function para gerar resumos essenciais dos temas
- Conteudo cacheado em `subject_summaries` para nao regenerar

### Ordem de implementacao
1. Migracoes de banco (tabelas e colunas)
2. Dashboard simplificado (impacto visual imediato)
3. Comunidade restrita (mudanca simples)
4. Caderno de Erros (ajustes incrementais)
5. Redacao guiada (novo fluxo)
6. Trilhas com resumo essencial (requer edge function + IA)
7. Revisoes interativas (requer questoes no banco)
