# ADR 0001: Papel do GrammAIr Flow no ecossistema e refatoração com base nos papers

- **Status:** proposta (aguarda revisão da Luna e decisão do autor)
- **Data:** 06/11/2026
- **Autor das decisões:** Guilherme Gonçalves Machado
- **Redação:** Claude

## 1. Contexto

### 1.1 O que o GrammAIr Flow é hoje

O GrammAIr Flow tem cerca de 650 linhas. O backend usa FastAPI, spaCy, TextBlob, textstat e R (via rpy2). Ele devolve:

- etiquetas gramaticais por palavra;
- polaridade de sentimento;
- estatísticas de palavras e frases;
- índices de legibilidade (Flesch, Gunning Fog, SMOG, ARI);
- bigramas e trigramas mais frequentes;
- um aviso para frases com mais de 25 palavras.

Nada disso é próprio da Hubstry. São bibliotecas conhecidas, chamadas em sequência. A única opção já registrada é manter a camada em R.

Há também um problema de método. Os índices Flesch e SMOG foram calibrados para o inglês. Aplicados ao português sem adaptação, eles medem mal.

### 1.2 Papers lidos para esta proposta

| Paper | Fonte | Lido |
|---|---|---|
| Teoria da Inflexão Cognitiva Analógica (TICA), v0.1 | Zenodo 10.5281/zenodo.20113888 | seções 1 a 10 |
| Morfologia Harmônica: Manifesto Fundacional, v1.0 | Zenodo 10.5281/zenodo.19097971 | integral |
| HALE e HPG 1.0 | Zenodo 18901934 e 19056387 | ainda não |
| Álgebra Hexarrelacional, π√f(A) | não está público no Zenodo | ainda não |
| MCA-001 e preprint do HMAL | repositório do HMAL | conhecidos |

As afirmações sobre a Álgebra vêm das decisões já registradas no projeto HexaSign (seção 1.3), não da leitura direta do paper. **Esta ADR fica incompleta até a leitura da Álgebra.**

### 1.3 O que já está decidido em outros projetos

- **O motor de analogias fica no HexaSign** (repositório `hubstry-hexasign-lab`). Ele é determinístico e se baseia nas seis relações de significância (ρ₁ a ρ₆). O GrammAIr não deve duplicar esse motor.
- **Decisões de autor no HexaSign:**
  - ρ₂ (homologia) é tratada como homomorfismo;
  - a ordem das seis relações é conceitual, não implicação lógica.
- **Mercado da Álgebra:** processamento de linguagem natural (PLN) aplicado à governança de inteligência artificial (IA).
- **Hipótese comercial já discutida para o GrammAIr:** diagnóstico de clareza de termos de uso e políticas de privacidade de serviços digitais voltados a crianças e adolescentes.

## 2. O que cada paper oferece a um software, e o que não oferece

### 2.1 Morfologia Harmônica

**Oferece, de forma implementável:**

1. **Radical e flexão (seção II e Postulado IV).** O radical é o núcleo de sentido comum a uma família de palavras. A flexão é o mecanismo que gera as formas concretas. Isso pode ser medido em português. Basta agrupar palavras cognatas por radical (lema, radical e afixos) e registrar como cada forma deriva dele.
2. **Cadeia raiz, radical, tema e étimo (seção II.2).** O paper adota as definições de Elia. Cada uma vira um campo de dados distinto.
3. **Hierarquia de sete níveis (Postulado VI), coluna linguística.** Os níveis são fonema, morfema, radical, palavra, sintagma, sentença e discurso. Eles são uma estrutura de análise natural. Exceto o fonema, todos têm ferramentas maduras em PLN.
4. **Separação entre forma e função (seção II.2, Gautier e Wilmet).** A morfologia estuda formas. A sintaxe estuda funções. Essa separação organiza bem os módulos do código.

**Não oferece como base de produto:**

- **Os postulados transdomínio.** É o caso da triadicidade universal (VII), do espaço morfológico comum a acordes e formas (VIII) e das correspondências euclidianas. O próprio manifesto os declara hipóteses não demonstradas. O software pode servir para testá-los, mas não deve assumi-los como verdade. Exemplo: o código não deve forçar radicais de três elementos.

### 2.2 TICA

**Oferece, de forma implementável:**

1. **Os três modos de analogia (seção 7).**
   - Heurística: semelhança superficial, medida por vetores de palavras (embeddings).
   - Funcional: equivalência de papel, R(A,B) ≅ R(C,D).
   - Homológica: isomorfismo estrutural.
   
   Esse é o vocabulário que o GrammAIr deve usar para exportar dados ao HexaSign.
2. **A notação de transferência Pᵢ(Cₐ) →[Aₘ] Pⱼ(C_b) (seção 7.1).** Ela serve de esquema para registrar cada analogia detectada no texto.
3. **O aviso contra a analogia heurística enganosa (seção 7.2).** Isso é uma regra de qualidade testável: duas palavras parecidas por fora não bastam para concluir que são equivalentes.

**Não oferece como base de produto:**

- O formalismo de amplitude de probabilidade, o modelo cyborg e a categoria M (seções 3, 4 e 10). O próprio paper os declara modelos estruturais, não afirmações sobre o substrato. Não há medida observável em texto que os alimente.
- A taxonomia dos catorze processos cognitivos (seção 6). Ela é conceitualmente rica, mas não existe detector validado de "processo cognitivo" num texto. Implementá-la agora seria produzir rótulos sem critério de verificação.

**Erro encontrado:** a seção 9.3 da TICA cita o HPG 1.0 com o DOI 10.5281/zenodo.18652888. Esse DOI é da Teoria Tridimensional do Morfema. O DOI correto do HPG é 10.5281/zenodo.19056387. É o mesmo erro já corrigido no preprint do HMAL v1.0.1.

## 3. Decisão proposta

### D1. Papel

O GrammAIr Flow passa a ser a **camada morfológica e estrutural de textos em português** do ecossistema. Ele recebe um texto e devolve uma representação estruturada e determinística, organizada pelos níveis da Morfologia Harmônica. Essa representação serve a dois usos:

1. **Produto próprio:** um diagnóstico de clareza para documentos normativos curtos, como termos de uso e políticas de privacidade.
2. **Entrada do HexaSign:** termos, radicais e relações em formato que o motor de analogias consome.

**Alternativa rejeitada:** reimplementar as seis relações dentro do GrammAIr. Isso duplicaria o HexaSign e violaria o modo lean.

### D2. Módulos (separação forma e função)

```
backend/
  morfologia/   # FORMA: lema, radical, afixos, famílias de cognatos (Postulados I a V, coluna linguística)
  niveis/       # Hierarquia: morfema → radical → palavra → sintagma → sentença → discurso (Postulado VI)
  sintaxe/      # FUNÇÃO: dependências e papéis sintáticos (spaCy), sem misturar com forma
  clareza/      # Diagnóstico: termos definidos, variação terminológica, frases longas, legibilidade adaptada ao português
  exportacao/   # Esquema de troca com o HexaSign: termos, radicais, modo de analogia candidato (TICA, seção 7)
  r/            # Estatística em R: distribuições por nível e comparação entre documentos
```

### D3. Primeira entrega da refatoração (escopo mínimo)

1. **Famílias de radicais.** Para cada documento, o software agrupa as palavras cognatas e mostra, em cada família, o radical e as formas derivadas. Exemplos: "tratar", "tratamento", "tratado".
2. **Variação terminológica.** O software sinaliza quando um mesmo conceito aparece com radicais diferentes, como "dados pessoais", "informações" e "dados do usuário". Esse é o ponto em que a analogia heurística engana: palavras parecidas por fora são tratadas como iguais sem que o documento as defina como iguais. A decisão sobre equivalência fica com o HexaSign (ρ₃) ou com o revisor humano.
3. **Métricas por nível.** O software mede contagens e distribuições em cada nível da hierarquia. As análises estatísticas rodam em R.
4. **Legibilidade adaptada ao português.** O software usa a adaptação do índice Flesch ao português, de Martins e colaboradores (1996), no lugar da fórmula original em inglês.

**Fora da primeira entrega:**
- os catorze processos da TICA;
- os postulados transdomínio;
- o sentimento via TextBlob, que é treinado em inglês e deve ser removido ou substituído.

### D4. Critério de aceite

O critério é fixado antes do código, como no HMAL:

- um conjunto de 10 políticas de privacidade públicas, com marcações feitas ou revisadas pelo autor;
- metas de acerto da variação terminológica definidas pelo autor antes da primeira rodada.

## 4. Consequências

- **Positivas:** o GrammAIr ganha uma função própria e verificável, alinhada a dois papers do autor. Ele também alimenta o HexaSign sem duplicá-lo e mantém o R.
- **Negativas:** parte dos papers fica deliberadamente de fora (TICA seções 3, 4, 6 e 10; postulados transdomínio da Morfologia Harmônica). O diagnóstico de clareza depende de marcações humanas para ser validado.
- **Riscos:** a família de radicais em português exige analisar afixos derivacionais. O spaCy entrega o lema, mas não o radical. Será preciso um analisador de derivação, ainda a escolher e testar.

## 5. Pendências antes de aprovar

1. Ler a Álgebra Hexarrelacional, que não está pública no Zenodo. O autor precisa anexá-la.
2. Ler o HALE e o HPG para confirmar se acrescentam algo ao GrammAIr. A expectativa é que não, porque ambos tratam de endereçamento e protocolo harmônico.
3. Revisão da Luna.
4. Decisão do autor sobre D1 a D4.
