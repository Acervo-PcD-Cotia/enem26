
# Plano de Implementacao Completo - ENEM 2026

## Resumo da Solicitacao

O usuario solicitou 8 funcionalidades principais:
1. Tornar bs7freitas@gmail.com superadmin
2. Criar tour/tutorial do site
3. Adicionar upload de materiais por materia (audio, video, mapa mental, flashcard, apresentacao)
4. Criar comunidade de estudos
5. Verificar logs do RPA
6. Testar modulo de questoes
7. Testar modulo de redacao
8. Implementar check-in semanal (Roda da Aprovacao)

---

## Fase 1: Sistema de Administracao

### 1.1 Atualizar Role do Usuario para Admin

O usuario bs7freitas@gmail.com ja existe no sistema com ID `516ebe88-b73b-4dbd-a636-0b054fa852aa`. Atualmente possui role "user". Sera atualizado para "admin".

**Acao**: Executar SQL para atualizar role

```sql
UPDATE public.user_roles 
SET role = 'admin' 
WHERE user_id = '516ebe88-b73b-4dbd-a636-0b054fa852aa';
```

### 1.2 Criar Enum "superadmin" (Opcional)

Se necessario distinguir entre admin e superadmin:

```sql
ALTER TYPE public.app_role ADD VALUE 'superadmin';
```

### 1.3 Criar Hook para Verificacao de Admin

Criar `src/hooks/useAdmin.ts` para verificar permissoes de admin no frontend.

---

## Fase 2: Tour/Tutorial Interativo

### 2.1 Nova Dependencia

Adicionar biblioteca de tour interativo (react-joyride ou driver.js).

### 2.2 Novos Arquivos

- `src/components/tour/AppTour.tsx` - Componente principal do tour
- `src/hooks/useTour.ts` - Hook para gerenciar estado do tour

### 2.3 Passos do Tour

1. **Dashboard** - "Bem-vindo! Aqui voce ve seu progresso diario"
2. **Trilhas** - "Clique em uma disciplina para ver os temas"
3. **Iniciar Estudo** - "Clique no circulo para mudar o status: Nao iniciado -> Em estudo -> Em revisao -> Consolidado"
4. **Timer Pomodoro** - "Use o timer para sessoes focadas"
5. **Revisoes RPA** - "Suas revisoes programadas aparecem aqui"
6. **Questoes** - "Pratique com questoes de cada disciplina"

### 2.4 Persistencia

Salvar flag `tour_completed` no perfil do usuario.

---

## Fase 3: Upload de Materiais por Assunto

### 3.1 Criar Storage Bucket

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('study-materials', 'study-materials', true);
```

### 3.2 Nova Tabela: subject_materials

```sql
CREATE TABLE public.subject_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  material_type TEXT NOT NULL CHECK (material_type IN ('audio', 'video', 'mindmap', 'flashcard', 'presentation')),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  external_url TEXT,
  source TEXT CHECK (source IN ('upload', 'youtube', 'gdrive', 'notebooklm')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subject_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own materials"
  ON subject_materials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own materials"
  ON subject_materials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own materials"
  ON subject_materials FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own materials"
  ON subject_materials FOR DELETE
  USING (auth.uid() = user_id);
```

### 3.3 Novos Arquivos Frontend

- `src/components/subjects/SubjectMaterials.tsx` - Modal/secao para exibir e adicionar materiais
- `src/components/subjects/MaterialUploadDialog.tsx` - Dialog para upload
- `src/components/subjects/MaterialCard.tsx` - Card para exibir material

### 3.4 Tipos de Material Suportados

| Tipo | Fonte | Formato |
|------|-------|---------|
| Audio | Upload/Link | mp3, wav, m4a |
| Video | Upload/YouTube/GDrive | mp4, link |
| Mapa Mental | Upload | pdf, png, jpg |
| Flashcard | NotebookLM | link |
| Apresentacao | NotebookLM/Upload | pdf, pptx, link |

---

## Fase 4: Comunidade de Estudos

### 4.1 Novas Tabelas

```sql
-- Posts da comunidade
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL CHECK (post_type IN ('question', 'help', 'resource', 'discussion')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'closed')),
  upvotes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Respostas/comentarios
CREATE TABLE public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES community_comments(id),
  content TEXT NOT NULL,
  is_accepted BOOLEAN DEFAULT false,
  upvotes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recursos compartilhados (videos/lives)
CREATE TABLE public.community_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id),
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('video', 'live', 'study_group')),
  url TEXT NOT NULL,
  source TEXT CHECK (source IN ('upload', 'youtube', 'gdrive', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.2 Politicas RLS para Comunidade

```sql
-- Posts visiveis para todos usuarios autenticados
CREATE POLICY "Authenticated users can view posts"
  ON community_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create posts"
  ON community_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

### 4.3 Novos Arquivos Frontend

- `src/pages/Community.tsx` - Pagina principal da comunidade
- `src/components/community/PostCard.tsx` - Card de post
- `src/components/community/CreatePostDialog.tsx` - Criar novo post
- `src/components/community/CommentThread.tsx` - Thread de comentarios
- `src/components/community/ResourcesSection.tsx` - Secao de recursos

### 4.4 Rota

Adicionar `/community` ao App.tsx e BottomNavigation.

---

## Fase 5: Correcao do Sistema RPA

### 5.1 Diagnostico

O hook `useRPAReviews.ts` esta correto, mas pode haver problema com:
1. Verificacao de reviews existentes muito restritiva
2. Status "pending" incompativel com enum

### 5.2 Correcao no Hook

```typescript
// Em useRPAReviews.ts, verificar se o insert esta usando valores corretos
const reviews = RPA_INTERVALS.map(interval => ({
  user_id: userId,
  subject_id: subjectId,
  interval: interval,
  scheduled_date: getNextReviewDate(interval).toISOString().split('T')[0],
  status: 'pending' as const, // Verificar se 'pending' existe no enum task_status
  review_type: interval === '24h' ? 'flashcard' : 'questions',
}));
```

### 5.3 Adicionar Console Logs para Debug

Adicionar logs detalhados na funcao `createInitialReviews` para diagnosticar o problema.

---

## Fase 6: Check-in Semanal (Roda da Aprovacao)

### 6.1 Tabela Existente

A tabela `weekly_checkins` ja existe com os campos necessarios:
- sleep_rating, focus_rating, energy_rating
- motivation_rating, discipline_rating, consistency_rating
- ai_recommendations

### 6.2 Novos Arquivos Frontend

- `src/pages/WeeklyCheckIn.tsx` - Pagina de check-in semanal
- `src/components/checkin/ApprovalWheel.tsx` - Componente visual da roda
- `src/components/checkin/RatingSlider.tsx` - Slider para cada indicador

### 6.3 Integracao com IA

Usar Lovable AI (google/gemini-2.5-flash) para gerar recomendacoes personalizadas baseadas nos ratings.

### 6.4 Fluxo

1. Usuario acessa check-in semanal
2. Avalia cada indicador de 1-10
3. IA processa dados e gera recomendacoes
4. Sugestoes sao salvas e exibidas
5. Dashboard mostra resumo semanal

---

## Fase 7: Testes End-to-End

### 7.1 Testar Fluxo RPA
- Login
- Acessar Trilhas
- Marcar assunto como "Em revisao"
- Verificar se reviews foram criadas no banco

### 7.2 Testar Modulo Questoes
- Selecionar disciplina
- Resolver questoes
- Verificar feedback e estatisticas

### 7.3 Testar Modulo Redacao
- Criar nova redacao
- Selecionar tema
- Avaliar por competencia

---

## Arquitetura de Arquivos

```text
src/
├── components/
│   ├── tour/
│   │   └── AppTour.tsx
│   ├── subjects/
│   │   ├── SubjectMaterials.tsx
│   │   ├── MaterialUploadDialog.tsx
│   │   └── MaterialCard.tsx
│   ├── community/
│   │   ├── PostCard.tsx
│   │   ├── CreatePostDialog.tsx
│   │   ├── CommentThread.tsx
│   │   └── ResourcesSection.tsx
│   └── checkin/
│       ├── ApprovalWheel.tsx
│       └── RatingSlider.tsx
├── hooks/
│   ├── useAdmin.ts
│   ├── useTour.ts
│   └── useWeeklyCheckIn.ts
├── pages/
│   ├── Community.tsx
│   └── WeeklyCheckIn.tsx
```

---

## Ordem de Implementacao

1. **Imediato**: Atualizar role do admin e corrigir RPA
2. **Fase 1**: Tour/Tutorial + Verificacao Admin
3. **Fase 2**: Storage + Upload de Materiais
4. **Fase 3**: Comunidade de Estudos
5. **Fase 4**: Check-in Semanal com IA
6. **Fase 5**: Testes completos

---

## Secao Tecnica

### Migracao SQL Completa

A migracao incluira:
- Atualizacao do enum app_role (se necessario adicionar superadmin)
- Criacao do bucket storage.study-materials
- Tabela subject_materials com RLS
- Tabelas community_posts, community_comments, community_resources com RLS
- Atualizacao do role do usuario especifico

### Dependencias a Adicionar

```json
{
  "driver.js": "^1.3.1"
}
```

### Edge Functions (Se Necessario)

Para integracao com IA no check-in semanal, sera criada uma edge function `generate-ai-recommendations` que usa o Lovable AI.

