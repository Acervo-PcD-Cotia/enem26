

# Renomear "ENEM 2026" para "ENEM+ 2026"

## Alteracoes necessarias

Substituir todas as ocorrencias de **"ENEM 2026"** por **"ENEM+ 2026"** nos seguintes arquivos:

| Arquivo | Linhas afetadas |
|---------|----------------|
| `index.html` | Title e og:title |
| `src/components/landing/Navbar.tsx` | Linha 31 |
| `src/components/landing/HeroSection.tsx` | Linhas 67, 94 |
| `src/components/landing/HowItWorksSection.tsx` | Linha 9 |
| `src/components/landing/TestimonialsSection.tsx` | Linha 68 |
| `src/components/landing/FAQSection.tsx` | Linha 63 |
| `src/components/landing/CTASection.tsx` | Linhas 41, 52 |
| `src/components/landing/CountdownTimer.tsx` | Linhas 12, 51 |
| `src/components/landing/Footer.tsx` | Linhas 45, 49, 120 |
| `src/pages/Auth.tsx` | Linha 148 |
| `src/pages/Onboarding.tsx` | Linha 188 |
| `tailwind.config.ts` | Linha 60 (comentario) |

**Total: 12 arquivos, ~16 ocorrencias**

## Teste do RPA

A tabela `rpa_reviews` continua vazia. Apos aplicar a correcao do `review_type` (ja feita no ultimo commit), o proximo passo e testar o fluxo manualmente:

1. Fazer login
2. Ir para Trilhas
3. Mudar status de um assunto para "Em revisao"
4. Verificar se 7 registros aparecem na tabela `rpa_reviews`

Nao ha mais alteracoes de codigo necessarias para o RPA -- a correcao de `'questions'` para `'quiz'` ja foi aplicada. O teste precisa ser feito pelo usuario no app.

## Secao tecnica

- Busca e substituicao simples de texto em todos os arquivos listados
- Nenhuma mudanca de logica, apenas renomeacao de marca
- O comentario no `tailwind.config.ts` tambem sera atualizado para consistencia

