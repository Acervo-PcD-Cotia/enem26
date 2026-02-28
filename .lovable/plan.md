
# Adicionar Pagina "Tutores ENEM+ 2026"

## Resumo

Criar uma nova pagina `/tutores` com 3 cards interativos que direcionam o aluno para assistentes de IA no NotebookLM. Adicionar link no menu de navegacao (Navbar da landing page e BottomNavigation do app).

---

## Arquivos a criar

### `src/pages/Tutors.tsx`
Nova pagina com:
- Titulo: "Converse com seu Tutor ENEM+ 2026"
- Subtitulo explicativo
- 3 cards responsivos (3 colunas desktop, 1 mobile)
- Cada card com: emoji, nome, especialidade, descricao curta, botao "Conversar agora", badge "IA Gratuita"
- Links abrem em nova aba com `target="_blank" rel="noopener noreferrer"`
- Hover animado com framer-motion (elevacao + brilho)
- BottomNavigation incluida na pagina para navegacao do app

Dados dos 3 tutores:
1. Tutor Geral ENEM -- Filosofia, Biologia, Redacao e Literatura
2. Tutor ProEnem 2026 -- Redacao, Ciencias Humanas, Quimica e Geografia
3. Tutor Plano de Estudos -- Organizacao, Cronograma e Estrategias

---

## Arquivos a modificar

### `src/App.tsx`
- Importar `Tutors` page
- Adicionar rota `<Route path="/tutors" element={<Tutors />} />`

### `src/components/dashboard/BottomNavigation.tsx`
- Adicionar item "Tutores" com icone `GraduationCap` do lucide-react
- Path: `/tutors`
- Total de itens passa de 5 para 6

### `src/components/landing/Navbar.tsx`
- Adicionar "Tutores" nos `navItems` da landing page com `href: "/tutors"`

---

## Secao tecnica

- Nenhuma biblioteca nova sera instalada (usa framer-motion e lucide-react ja existentes)
- Nenhuma tabela de banco sera criada (pagina estatica com links externos)
- Cards usam os componentes `Card` do shadcn/ui ja existentes
- Badge usa o componente `Badge` ja existente
- Estilo segue a identidade visual atual: gradientes roxo/verde/laranja, glassmorphism, sombras coloridas
- Layout responsivo com grid Tailwind: `grid-cols-1 md:grid-cols-3`
