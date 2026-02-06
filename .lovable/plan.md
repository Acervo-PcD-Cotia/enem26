
# Plano de Correção do Sistema RPA

## Problema Identificado
O sistema RPA não está criando revisões automáticas quando o usuário muda o status de um assunto para "Em revisão". A tabela `rpa_reviews` está vazia.

## Causa Raiz
A função `createInitialReviews` do hook `useRPAReviews` não está sendo chamada quando o status do assunto muda na página de Trilhas (Subjects).

## Solução Proposta

### 1. Modificar `src/pages/Subjects.tsx`
Integrar o hook `useRPAReviews` e chamar `createInitialReviews` quando o status mudar para "reviewing".

```typescript
// Adicionar import
import { useRPAReviews } from "@/hooks/useRPAReviews";

// No componente, adicionar:
const { createInitialReviews } = useRPAReviews();

// Na função que muda o status:
const handleStatusChange = async (subjectId: string, newStatus: string) => {
  // Atualizar status no banco...
  
  // Se o novo status for "reviewing", criar revisões RPA
  if (newStatus === 'reviewing' && user) {
    await createInitialReviews(user.id, subjectId);
  }
};
```

### 2. Verificar a Lógica de Status
Confirmar que os valores de status usados no frontend correspondem aos valores esperados pelo hook RPA:
- `not_started` -> Não iniciado
- `studying` -> Em estudo  
- `reviewing` -> Em revisão (trigger para RPA)
- `consolidated` -> Consolidado

### 3. Adicionar Logs de Debug
Manter os console.logs detalhados no hook para facilitar diagnóstico futuro.

## Arquivos a Modificar
- `src/pages/Subjects.tsx` - Integrar chamada ao RPA
- `src/hooks/useRPAReviews.ts` - Já possui logs, verificar se precisa ajustes

## Testes Necessários
1. Fazer login como usuário de teste
2. Navegar para Trilhas
3. Clicar 2x no status de um assunto (para mudar para "reviewing")
4. Verificar logs do console para mensagens "[RPA]"
5. Confirmar criação de 7 registros na tabela `rpa_reviews`
