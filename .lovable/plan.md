

# Plano de Correção do Sistema RPA e Melhorias

## Diagnóstico Completo

### Problema Identificado no RPA
O código em `src/hooks/useRPAReviews.ts` (linha 54) está usando `'questions'` como valor de `review_type`, mas a tabela `rpa_reviews` tem um CHECK constraint que só aceita:
- `'flashcard'`
- `'quiz'`
- `'summary'`

**Código problemático (linha 54)**:
```typescript
review_type: interval === '24h' ? 'flashcard' : 'questions', // 'questions' não é válido!
```

### Página de Revisões Existente
A página `src/pages/Reviews.tsx` já existe e tem funcionalidade completa para:
- Listar revisões pendentes, próximas e concluídas
- Marcar revisões como concluídas
- Adiar revisões
- Mostrar alertas de revisões atrasadas

---

## Correções Necessárias

### 1. Corrigir Bug do review_type

**Arquivo**: `src/hooks/useRPAReviews.ts`

**Alteração na linha 54**:
```typescript
// DE:
review_type: interval === '24h' ? 'flashcard' : 'questions',

// PARA:
review_type: interval === '24h' ? 'flashcard' : 'quiz',
```

Isso garante que todos os valores inseridos respeitem o constraint da tabela.

---

### 2. Melhorar Página de Revisões (Opcional)

A página atual já funciona bem. Sugestões de melhoria:

1. **Adicionar data formatada** - Mostrar "Amanhã", "Em 3 dias", etc.
2. **Adicionar filtro por disciplina** - Para encontrar revisões específicas
3. **Card expandido com ações** - Mostrar tipo de revisão (flashcard/quiz) e permitir iniciar diretamente

---

## Testes Após Correção

Após aplicar a correção, o fluxo deve funcionar assim:

1. Usuário acessa **Trilhas**
2. Clica no status de um assunto duas vezes para mudar para "Em revisão"
3. Sistema cria 7 revisões no banco de dados
4. Toast de confirmação aparece: "7 revisões RPA foram criadas automaticamente"
5. Usuário acessa página **Revisões** e vê as revisões agendadas

---

## Seção Técnica

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/hooks/useRPAReviews.ts` | Trocar `'questions'` por `'quiz'` na linha 54 |

### Valores Válidos para review_type

| Valor | Uso |
|-------|-----|
| `flashcard` | Revisão de 24h (primeira revisão) |
| `quiz` | Revisões de 7d, 15d, 30d, 60d, 120d, 180d |
| `summary` | Revisão de resumo (não usado atualmente) |

### Verificação do Constraint no Banco
```sql
CHECK ((review_type = ANY (ARRAY['flashcard'::text, 'quiz'::text, 'summary'::text])))
```

