
# 🎓 ENEM 2026 - Plataforma Inteligente de Estudos

## Visão Geral
Plataforma web responsiva para preparação do ENEM 2026 com sistema de revisão espaçada automática (RPA), planejamento inteligente adaptativo e gamificação para manter a motivação dos alunos.

---

## 🎨 Design & Identidade Visual
- **Paleta vibrante**: Roxo primário (#8B5CF6), verde sucesso (#10B981), laranja energia (#F97316)
- **Visual jovem e motivador** com gradientes suaves e ícones expressivos
- **Cards com sombras coloridas** e animações sutis para engajamento
- **Tipografia moderna** com hierarquia clara
- **Mobile-first** com navegação por bottom bar no celular

---

## 🗂️ Módulos da Plataforma

### 1. Landing Page de Conversão
- Hero impactante com countdown para o ENEM 2026
- Seção de benefícios com ícones animados
- Depoimentos e prova social
- CTA principal: "Criar meu plano ENEM 2026"
- FAQ e rodapé com informações

### 2. Sistema de Autenticação
- Cadastro com email/senha e login social (Google)
- Verificação de email
- Recuperação de senha
- Perfil do usuário com foto e dados

### 3. Onboarding Inteligente (Wizard 5 passos)
- **Passo 1**: Curso desejado e universidade alvo
- **Passo 2**: Nota alvo e nível atual de conhecimento
- **Passo 3**: Disponibilidade (dias/semana e horas/dia)
- **Passo 4**: Autoavaliação por área do conhecimento
- **Passo 5**: Confirmação e geração do plano personalizado

### 4. Dashboard "Hoje" (Tela Principal)
- Card principal: "O que você precisa fazer agora"
- Lista de tarefas do dia categorizadas:
  - 📘 Estudo de novo conteúdo
  - 🧠 Revisões RPA pendentes (com prioridade visual)
  - ❓ Sessão de questões
  - ✍️ Redação (quando agendada)
- Botões de ação: ✅ Concluir | ⏸️ Adiar | ⚠️ Tive dificuldade
- Timer Pomodoro integrado
- Barra de progresso diário
- Streak de dias consecutivos

### 5. Planejamento Inteligente (Calendário Multi-nível)
- **Visão Anual**: Mapa de calor do progresso
- **Visão Mensal**: Distribuição de conteúdos por disciplina
- **Visão Semanal**: Detalhamento de tarefas
- **Replanejamento automático**: Sistema redistribui tarefas atrasadas
- Indicadores visuais de carga (leve/moderada/pesada)

### 6. Sistema RPA (Revisão Programada Automática)
- Intervalos automáticos: 24h → 7d → 15d → 30d → 60d → 120d → 180d
- Cada revisão gera uma atividade prática:
  - Flashcards gerados automaticamente
  - Mini-quiz de 5 questões
  - Resumo ativo para completar
- Dashboard de revisões pendentes com filtros
- Notificações de revisões críticas

### 7. Trilhas por Disciplina
- **5 áreas completas**: Matemática, Natureza, Humanas, Linguagens, Redação
- Checklist visual de todos os assuntos do ENEM
- Status por assunto: 🔘 Não iniciado → 🔵 Em estudo → 🟡 Em revisão → 🟢 Consolidado
- Progresso percentual por disciplina
- Estimativa de tempo para conclusão

### 8. Banco de Questões + Métricas
- Sessões de questões por disciplina/assunto
- Registro de cada resposta: tempo, acerto/erro, alternativa
- Dashboard de desempenho:
  - Gráfico de evolução temporal
  - Taxa de acerto por área
  - Assuntos mais errados (ranking)
- **IA sugere reforços** baseado nos padrões de erro

### 9. Caderno de Erros Inteligente
- Registro automático de cada erro com contexto
- Classificação do motivo: Conteúdo | Interpretação | Atenção | Tempo
- Transformar erro em flashcard com 1 clique
- **IA identifica padrões** e prioriza erros recorrentes no plano
- Filtros por disciplina, data e tipo de erro

### 10. Módulo de Redação ENEM
- Agenda automática semanal de redação
- Banco de temas organizados por eixo temático
- Editor de texto com contador de linhas (30 linhas)
- Registro de redações com:
  - Nota por competência (C1 a C5)
  - Nota total
  - Comentários e pontos de melhoria
- Gráfico de evolução das notas

### 11. Controle de Simulados
- Cadastro de simulados realizados
- Notas por área + nota geral
- Comparativo entre simulados
- **IA analisa resultados** e ajusta prioridades do plano
- Meta de evolução entre simulados

### 12. Roda da Aprovação (Check-in Semanal)
- Autoavaliação semanal (1-10):
  - Foco, Disciplina, Sono, Energia, Motivação, Constância
- Gráfico radar do bem-estar
- **IA gera recomendações** personalizadas:
  - Ajustar carga de estudos
  - Priorizar descanso
  - Sugestões de reorganização

### 13. Sistema de Gamificação
- 🔥 Contador de streak (dias consecutivos)
- 🏆 Selos de conquista (ex: "7 dias firme", "100 questões", "Mestre em Revisões")
- 📊 Metas semanais com progresso
- 💬 Mensagens motivacionais contextualizadas
- Ranking opcional entre amigos

---

## 🔧 Infraestrutura Técnica (Lovable Cloud)

### Banco de Dados
- Tabelas: usuários, perfis, planos de estudo, disciplinas, assuntos, sessões, revisões RPA, questões, erros, redações, simulados, check-ins, conquistas
- RLS (Row Level Security) para isolamento de dados por usuário

### Autenticação
- Email/senha + Google OAuth
- Verificação de email obrigatória

### Edge Functions + Lovable AI
- Geração de plano personalizado no onboarding
- Replanejamento automático de tarefas
- Análise de padrões de erro
- Recomendações da Roda da Aprovação
- Sugestões de reforço baseadas em desempenho

---

## 📱 Navegação

### Desktop
- Sidebar fixa com menu principal
- Header com perfil, notificações e streak

### Mobile
- Bottom navigation bar com 5 itens principais
- Menu hamburger para itens secundários
- Gestos de swipe para navegação entre tarefas

---

## 🚀 Fluxo Principal do Usuário
1. **Acessa Landing Page** → Clica "Criar meu plano"
2. **Cadastra-se** → Confirma email
3. **Completa Onboarding** → Sistema gera plano 2026
4. **Dashboard "Hoje"** → Executa tarefas diárias
5. **Marca conclusão** → Sistema agenda revisões RPA
6. **Resolve questões** → Erros vão para o caderno
7. **Check-in semanal** → Recebe recomendações da IA
8. **Repete ciclo** → Evolui até o ENEM

---

## 📋 Ordem de Implementação Sugerida
1. Configuração inicial + Landing Page
2. Autenticação e perfil de usuário
3. Onboarding wizard + estrutura de dados
4. Dashboard "Hoje" com tarefas básicas
5. Sistema RPA (núcleo do produto)
6. Trilhas por disciplina com checklist
7. Banco de questões e métricas
8. Caderno de erros inteligente
9. Módulo de redação
10. Controle de simulados
11. Roda da aprovação + recomendações IA
12. Gamificação e polimentos finais
